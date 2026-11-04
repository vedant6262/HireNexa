"""HTTP bridge for the CV exam-monitoring project.

This file lives in the job-portal backend and only *imports* the existing CV
package. No file inside the CV folder is modified. The service loads the same
face-direction CNN, phone detector, and person detector used by ``CV/main.py``
and exposes them to the web app over a small JSON API.

Run with the CV virtual environment (it already has TensorFlow/OpenCV):

    ..\\CV\\.venv\\Scripts\\python.exe cv_service\\server.py
"""
from __future__ import annotations

import base64
import json
import os
import sys
import threading
import time
import traceback
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DEFAULT_CV_ROOT = Path(__file__).resolve().parents[2] / "CV"
CV_ROOT = Path(os.environ.get("CV_DIR", DEFAULT_CV_ROOT)).resolve()
HOST = os.environ.get("CV_SERVICE_HOST", "127.0.0.1")
PORT = int(os.environ.get("CV_SERVICE_PORT", os.environ.get("PORT", "5001")))
SERVICE_VERSION = "8"
MAX_IMAGE_BYTES = 8 * 1024 * 1024
PERSON_REFRESH_SECONDS = 2.0

if str(CV_ROOT) not in sys.path:
    sys.path.insert(0, str(CV_ROOT))

import cv2  # noqa: E402
import numpy as np  # noqa: E402

from config import (  # noqa: E402
    DIRECTION_EVENT_SECONDS,
    FACE_ABSENCE_SECONDS,
    EVENT_COOLDOWN_SECONDS,
    MIRROR_PREVIEW,
    PERSON_CONFIDENCE_THRESHOLD,
    PHONE_TRACK_IOU_THRESHOLD,
)
from src.face_detection import FaceDetector  # noqa: E402
from src.face_direction import FaceDirectionClassifier  # noqa: E402
from src.person_detection import PersonDetector  # noqa: E402
from src.phone_detection import PhoneDetector  # noqa: E402
from src.suspicion_engine import SuspicionEngine  # noqa: E402

PHONE_MIN_CONFIDENCE = max(0.70, float(os.environ.get("CV_PHONE_MIN_CONFIDENCE", "0.70")))
PHONE_CONFIRMATION_FRAMES_EFFECTIVE = max(1, int(os.environ.get("CV_PHONE_CONFIRMATION_FRAMES", "2")))
PHONE_INSTANT_CONFIDENCE = min(
    0.99,
    max(PHONE_MIN_CONFIDENCE, float(os.environ.get("CV_PHONE_INSTANT_CONFIDENCE", "0.85"))),
)
FACE_MIN_ASPECT = 0.60
FACE_MAX_ASPECT = 1.65
FACE_MIN_WIDTH_FRACTION = 0.09
FACE_MIN_SKIN_RATIO = 0.15

DIRECTION_EVENT_TYPES = {"looking_left", "looking_right", "looking_up", "looking_down"}
EVENT_DESCRIPTIONS = {
    "phone_detected": "Mobile phone detected",
    "multiple_people": "More than one person detected",
    "face_absent": "Face not detected in the camera frame",
    "looking_left": "Candidate looking left",
    "looking_right": "Candidate looking right",
    "looking_up": "Candidate looking up",
    "looking_down": "Candidate looking down",
    "eyes_closed": "Eyes closed",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class FastPredictModel:
    """Call the Keras model directly to avoid ``predict()`` loop overhead.

    ``model.predict()`` builds a dataset and adds several hundred milliseconds
    of overhead for tiny inputs. Calling the model as a function returns the
    same tensor and keeps the CV project's trained weights unchanged.
    """

    def __init__(self, model) -> None:
        self._model = model

    def predict(self, x, verbose=0, **kwargs):
        return self._model(x, training=False).numpy()

    def __getattr__(self, name):
        return getattr(self._model, name)


def decode_image(data_url: str) -> np.ndarray:
    if not isinstance(data_url, str) or not data_url:
        raise ValueError("An 'image' base64 string is required.")
    encoded = data_url.split(",", 1)[1] if data_url.startswith("data:") else data_url
    raw = base64.b64decode(encoded, validate=False)
    if len(raw) > MAX_IMAGE_BYTES:
        raise ValueError("Image is too large for the proctoring service.")
    frame = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if frame is None or frame.size == 0:
        raise ValueError("Could not decode the supplied image.")
    return frame


def box_iou(first, second) -> float:
    first_x, first_y, first_width, first_height = first
    second_x, second_y, second_width, second_height = second
    left, top = max(first_x, second_x), max(first_y, second_y)
    right = min(first_x + first_width, second_x + second_width)
    bottom = min(first_y + first_height, second_y + second_height)
    intersection = max(0, right - left) * max(0, bottom - top)
    union = first_width * first_height + second_width * second_height - intersection
    return intersection / union if union else 0.0


def skin_ratio(crop: np.ndarray) -> float:
    """Fraction of skin-colored pixels, used to reject face/background false positives."""
    if crop is None or crop.size == 0:
        return 0.0
    ycrcb = cv2.cvtColor(crop, cv2.COLOR_BGR2YCrCb)
    mask = cv2.inRange(ycrcb, (0, 133, 77), (255, 173, 127))
    return float(cv2.countNonZero(mask)) / float(crop.shape[0] * crop.shape[1])


def face_is_plausible(box, frame: np.ndarray, person_boxes) -> bool:
    x, y, width, height = box
    frame_height, frame_width = frame.shape[:2]
    if width <= 0 or height <= 0:
        return False
    if width / height < FACE_MIN_ASPECT or width / height > FACE_MAX_ASPECT:
        return False
    if width < frame_width * FACE_MIN_WIDTH_FRACTION:
        return False

    center_x = x + width / 2
    center_y = y + height / 2
    if center_x < frame_width * 0.08 or center_x > frame_width * 0.92:
        return False
    if center_y < frame_height * 0.04 or center_y > frame_height * 0.96:
        return False

    if person_boxes:
        near_person = any(
            person_x - 0.10 * person_width <= center_x <= person_x + 1.10 * person_width
            and person_y - 0.10 * person_height <= center_y <= person_y + 1.10 * person_height
            for (person_x, person_y, person_width, person_height), _weight in person_boxes
        )
        if not near_person:
            return False

    crop = frame[y:y + height, x:x + width]
    return skin_ratio(crop) >= FACE_MIN_SKIN_RATIO


def phone_is_plausible(box, frame: np.ndarray) -> bool:
    x, y, width, height = box
    frame_height, frame_width = frame.shape[:2]
    if width <= 0 or height <= 0:
        return False

    area_ratio = (width * height) / float(frame_width * frame_height)
    if area_ratio < 0.002 or area_ratio > 0.35:
        return False

    aspect = width / height
    if aspect < 0.22 or aspect > 4.5:
        return False

    return True


class SharedModels:
    """Loads the heavy models once and shares them across exam sessions."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.errors: dict[str, str] = {}
        self.loaded_at = utc_now()

        self.face_detector = FaceDetector()
        self.person_detector = PersonDetector(PERSON_CONFIDENCE_THRESHOLD)

        self.face_classifier = None
        try:
            self.face_classifier = FaceDirectionClassifier()
            self.face_classifier.model = FastPredictModel(self.face_classifier.model)
        except Exception as error:  # noqa: BLE001 - report, do not crash the bridge
            self.errors["face_direction"] = str(error)

        self.phone_detector = None
        try:
            self.phone_detector = PhoneDetector(threshold=PHONE_MIN_CONFIDENCE)
            self.phone_detector.model = FastPredictModel(self.phone_detector.model)
        except Exception as error:  # noqa: BLE001 - phone model may be absent
            self.errors["phone_detector"] = str(error)

    def health(self) -> dict:
        return {
            "faceDirectionModel": self.face_classifier is not None,
            "phoneModel": self.phone_detector is not None,
            "personDetector": True,
            "errors": self.errors,
        }


class SessionMonitor:
    """Per-assessment detection state, mirroring CV/main.py's monitoring loop."""

    def __init__(self, session_id: str, models: SharedModels) -> None:
        self.session_id = session_id
        self.models = models
        self.engine = SuspicionEngine()
        self.started = time.time()
        self.last_frame_at = None
        self.frame_count = 0
        self.phone_candidate = None
        self.phone_candidate_frames = 0
        self.phone_box = None
        self.phone_confidence = 0.0
        self.person_boxes = []
        self.last_people_at = 0.0
        self.lock = threading.Lock()

        if models.face_classifier is not None:
            models.face_classifier.reset()

    def _event(self, event_type: str, contribution: int, **extra) -> dict:
        return {
            "type": event_type,
            "description": EVENT_DESCRIPTIONS.get(event_type, event_type.replace("_", " ").title()),
            "contribution": contribution,
            "start": utc_now(),
            "end": utc_now(),
            "duration": 0,
            **extra,
        }

    def analyze(self, frame: np.ndarray) -> dict:
        with self.lock:
            # Match CV/main.py exactly: the desktop monitor flips the webcam
            # frame before running the face-direction model (MIRROR_PREVIEW).
            if MIRROR_PREVIEW:
                frame = cv2.flip(frame, 1)

            now = time.time()
            self.frame_count += 1
            self.last_frame_at = now
            events: list[dict] = []

            with self.models.lock:
                if now - self.last_people_at >= PERSON_REFRESH_SECONDS:
                    self.person_boxes = self.models.person_detector.detect(frame)
                    self.last_people_at = now
                person_boxes = self.person_boxes

                raw_faces = self.models.face_detector.detect(frame)
                faces = [face for face in raw_faces if face_is_plausible(face, frame, person_boxes)]
                if not faces and raw_faces:
                    faces = [max(raw_faces, key=lambda face: face[2] * face[3])]
                if not faces and self.models.face_classifier is not None:
                    self.models.face_classifier.reset()

                face_payload = []
                for box in faces:
                    entry = {"box": [int(value) for value in box], "direction": "uncertain", "confidence": 0.0}
                    if self.models.face_classifier is not None:
                        crop = self.models.face_detector.crop(frame, box)
                        label, confidence = self.models.face_classifier.predict(crop, tracking_box=box)
                        entry["direction"] = label
                        entry["confidence"] = round(float(confidence), 4)
                        if label in DIRECTION_EVENT_TYPES:
                            contribution = self.engine.add(label, now=now)
                            if contribution:
                                events.append(self._event(label, contribution, confidence=entry["confidence"]))
                    face_payload.append(entry)

                phone_payload = {"detected": False, "confidence": 0.0, "box": None}
                if self.models.phone_detector is not None:
                    raw_phone_boxes = [
                        detection
                        for detection in self.models.phone_detector.detect(frame)
                        if phone_is_plausible(detection[0], frame)
                    ]
                    if raw_phone_boxes:
                        candidate = max(raw_phone_boxes, key=lambda detection: detection[1])
                        if (
                            self.phone_candidate
                            and box_iou(candidate[0], self.phone_candidate[0]) >= PHONE_TRACK_IOU_THRESHOLD
                        ):
                            self.phone_candidate = candidate
                            self.phone_candidate_frames += 1
                        else:
                            self.phone_candidate = candidate
                            self.phone_candidate_frames = 1
                    else:
                        self.phone_candidate = None
                        self.phone_candidate_frames = 0

                    required_frames = PHONE_CONFIRMATION_FRAMES_EFFECTIVE
                    if self.phone_candidate and self.phone_candidate[1] >= PHONE_INSTANT_CONFIDENCE:
                        required_frames = 1

                    if self.phone_candidate and self.phone_candidate_frames >= required_frames:
                        self.phone_box = [int(value) for value in self.phone_candidate[0]]
                        self.phone_confidence = round(float(self.phone_candidate[1]), 4)
                        phone_payload = {
                            "detected": True,
                            "confidence": self.phone_confidence,
                            "box": self.phone_box,
                        }
                        contribution = self.engine.add("phone_detected", now=now)
                        if contribution:
                            events.append(
                                self._event("phone_detected", contribution, confidence=self.phone_confidence)
                            )
                    else:
                        self.phone_box = None
                        self.phone_confidence = 0.0

            face_absent = not faces and now - self.started > FACE_ABSENCE_SECONDS
            if face_absent:
                contribution = self.engine.add("face_absent", now=now)
                if contribution:
                    events.append(self._event("face_absent", contribution))

            person_count = max(len(person_boxes), len(faces))
            multiple_people = person_count > 1
            if multiple_people:
                contribution = self.engine.add("multiple_people", now=now)
                if contribution:
                    events.append(self._event("multiple_people", contribution))

            return {
                "ok": True,
                "sessionId": self.session_id,
                "frameCount": self.frame_count,
                "analyzedAt": utc_now(),
                "faceCount": len(faces),
                "personCount": person_count,
                "faces": face_payload,
                "phone": phone_payload,
                "multiplePeople": multiple_people,
                "faceAbsent": face_absent,
                "events": events,
                "score": self.engine.score,
                "level": self.engine.level(),
                "frame": {"width": int(frame.shape[1]), "height": int(frame.shape[0])},
            }


class ProctoringService:
    def __init__(self, models: SharedModels) -> None:
        self.models = models
        self.sessions: dict[str, SessionMonitor] = {}
        self.lock = threading.Lock()

    def start_session(self, session_id: str) -> SessionMonitor:
        with self.lock:
            monitor = SessionMonitor(session_id, self.models)
            self.sessions[session_id] = monitor
            return monitor

    def get_session(self, session_id: str) -> SessionMonitor:
        with self.lock:
            monitor = self.sessions.get(session_id)
        if monitor is None:
            monitor = self.start_session(session_id)
        return monitor

    def stop_session(self, session_id: str) -> dict | None:
        with self.lock:
            monitor = self.sessions.pop(session_id, None)
        if monitor is None:
            return None
        return {
            "sessionId": session_id,
            "score": monitor.engine.score,
            "level": monitor.engine.level(),
            "frameCount": monitor.frame_count,
        }


class Handler(BaseHTTPRequestHandler):
    service: ProctoringService
    server_version = "CVProctoring/1.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, format_string: str, *args) -> None:  # noqa: A003
        print(f"[cv-service] {self.address_string()} {format_string % args}")

    def _send(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path.split("?", 1)[0] == "/health":
            self._send(
                200,
                {
                    "ok": True,
                    "service": "cv-proctoring",
                    "version": SERVICE_VERSION,
                    "pid": os.getpid(),
                    "parentPid": os.getppid(),
                    "cvRoot": str(CV_ROOT),
                    "models": self.service.models.health(),
                },
            )
            return
        self._send(404, {"error": f"Unknown path: {self.path}"})

    def do_POST(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        try:
            payload = self._read_json()
            if path == "/session":
                session_id = str(payload.get("sessionId") or "").strip()
                if not session_id:
                    self._send(400, {"error": "sessionId is required."})
                    return
                self.service.start_session(session_id)
                self._send(200, {"ok": True, "sessionId": session_id})
                return

            if path == "/analyze":
                session_id = str(payload.get("sessionId") or "").strip()
                if not session_id:
                    self._send(400, {"error": "sessionId is required."})
                    return
                frame = decode_image(payload.get("image"))
                result = self.service.get_session(session_id).analyze(frame)
                self._send(200, result)
                return

            if path == "/stop":
                session_id = str(payload.get("sessionId") or "").strip()
                summary = self.service.stop_session(session_id)
                self._send(200, {"ok": True, "summary": summary})
                return

            self._send(404, {"error": f"Unknown path: {path}"})
        except ValueError as error:
            self._send(400, {"error": str(error)})
        except Exception as error:  # noqa: BLE001 - keep the bridge alive
            traceback.print_exc()
            self._send(500, {"error": f"CV analysis failed: {error}"})


def main() -> None:
    print(f"[cv-service] CV project: {CV_ROOT}")
    print("[cv-service] Loading CV models (TensorFlow) ...")
    models = SharedModels()
    print(f"[cv-service] Models ready: {models.health()}")
    service = ProctoringService(models)
    Handler.service = service
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"[cv-service] Listening on http://{HOST}:{PORT}")
    print("[cv-service] Event cooldown:", EVENT_COOLDOWN_SECONDS, "| direction window:", DIRECTION_EVENT_SECONDS)
    print(
        "[cv-service] Phone guards:",
        f"confirm={PHONE_CONFIRMATION_FRAMES_EFFECTIVE} frame(s)",
        f"| instant>={PHONE_INSTANT_CONFIDENCE:.2f}",
        f"| min>={PHONE_MIN_CONFIDENCE:.2f}",
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
