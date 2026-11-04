# CV proctoring service deployment

`main.py` runs the local webcam examination monitor. It opens a camera and desktop window, so it is not a Vercel serverless function and cannot be deployed as the web app's Python entrypoint.

For HireNexa's browser-based proctoring, deploy the HTTP service in `backend/cv_service/server.py`. The root `render.yaml` configures it as a Docker web service using `Dockerfile.cv`, which installs the dependencies and copies this `CV` package. Deploy the Render Blueprint from the repository root. Set Vercel's project root directory to `frontend`; then set `VITE_API_URL` to the deployed backend API URL ending in `/api`.

To run the desktop monitor locally, install `requirements.txt` in a Python environment with webcam access and run `python main.py` from this directory.
