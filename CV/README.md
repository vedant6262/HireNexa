# AI-Based Exam Cheating Detection (OpenCV Desktop)

This project collects your own webcam images and trains a six-class face-direction CNN. It does not download a training dataset and does not use a web UI. Automated detections are review aids, not proof of misconduct.

## Windows quick start

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

1. Capture face classes: `python -m src.capture_dataset`. Use `SPACE`, `A`, `N`, `P`, `R`, and `Q`.
2. Validate: `python -m src.dataset_validation`.
3. Train: `python -m src.train_face_model`. Training must finish before `python main.py`.
4. Capture images into the two folders with `python -m src.phone_dataset_capture`.
   The window starts in `phone` mode. Press `SPACE` to capture, `M` to switch
   between `phone` and `nophone`, and `Q` to quit. Images are saved under
   `dataset/mobile_phone/images/phone` and `dataset/mobile_phone/images/nophone`.
5. Annotate phone boxes: `python -m src.phone_annotation`. Draw a box around
   every phone and press `S` to save. No-phone captures already receive empty
   annotation files; `X` can also save an empty annotation.
6. Include hard negatives in `nophone`, such as calculators, remotes, books,
   wallets, laptops, and empty desks.
8. Run `python -m src.phone_training_pipeline`. This validates annotations, creates
   reproducible splits, trains a one-class TensorFlow grid detector from randomly
   initialized weights, selects its threshold on validation data, evaluates the
   held-out test split, and verifies that the saved model loads.
   After importing a complete, annotated dataset, `python -m src.phone_dataset_manager
   phone --train` is also available as an explicit automatic-after-validation option.
9. Start monitoring: `python main.py`. Use `S` to start/stop, `P` to pause, `R` to reset, `H` for help, and `Q` to quit.

The first run creates `dataset/`, `models/`, `logs/`, `reports/`, and `training_results/`. Examination events are stored in SQLite and `logs/events.csv`; reports are JSON and CSV files under `reports/`.
Phone training details, epoch losses, checkpoints, and full failure tracebacks are written to `logs/phone_training.log`.

## Troubleshooting

- If the webcam does not open, close other camera applications, grant Windows camera permission, or change `WEBCAM_INDEX` in `config.py`.
- If TensorFlow cannot install, use a supported 64-bit Python version and follow the TensorFlow Windows installation guidance.
- Missing face model: capture a complete, readable six-class dataset and run `python -m src.train_face_model`.
- Insufficient phone data: collect varied positive and negative images, annotate every
  positive image, and run the pipeline again. Training refuses to start without a
  trustworthy positive bounding box.
- Phone false positives: the runtime enforces `PHONE_CONFIDENCE_THRESHOLD` even if an
  old training report selected a lower threshold, and requires
  `PHONE_CONFIRMATION_FRAMES` consecutive matching frames. Add hard-negative images
  showing hair, faces, hands, books, laptops, remotes, and empty desks, then retrain.
- Poor accuracy: capture more varied images with consistent lighting, distance, head angles, and backgrounds;
  keep the face centered and avoid near-duplicate frames. The monitor also smooths predictions across
  adjacent frames to reduce flicker. Adjust `FACE_SMOOTHING_ALPHA` in `config.py` only if needed:
  higher values react faster, while lower values are steadier. Retrain after adding new samples.
- CPU performance: reduce camera resolution or capture target; the monitor deliberately avoids saving face images by default.

## Verification checklist

The dataset, training, persistence, report, keyboard-control, and safe-shutdown paths are implemented and can be checked without a webcam. Physical webcam capture, CNN accuracy, person-count quality, and phone-detector quality require local hardware and images and must be tested by the user; no accuracy is claimed in advance.

## HireNexa deployment

`main.py` runs the local webcam examination monitor. It opens a camera and desktop window, so it is not a Vercel serverless function and cannot be deployed as the web app's Python entrypoint.

For HireNexa's browser-based proctoring, deploy the HTTP service in `backend/cv_service/server.py`. The root `render.yaml` configures it as a Docker web service using `Dockerfile.cv`, which installs the dependencies and copies this `CV` package. Deploy the Render Blueprint from the repository root. Set Vercel's project root directory to `frontend`; then set `VITE_API_URL` to the deployed backend API URL ending in `/api`.
