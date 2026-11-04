# HireNexa

HireNexa is a full-stack recruitment and career platform that connects students with employers. Students can browse public Arbeitnow listings or jobs posted directly by recruiters, apply with a resume, and track each application. Recruiters can publish openings, review candidates, and move applications through the hiring process.

The platform also includes career tools, skill assessments, interview preparation, and webcam-based exam proctoring. Proctoring signals are intended to support human review and should not be treated as proof of misconduct.

## Features

- **Student workspace:** profile and resume, saved jobs, applications, interviews, skill assessments, and AI-assisted career tools.
- **Live Jobs:** job listings supplied by the Arbeitnow job-board API.
- **HireNexa Jobs:** active roles published by recruiters, including search and application forms.
- **Recruiter workspace:** company profiles, job publishing, applicant review, resume access, status updates, and hiring analytics.
- **Exam proctoring:** a Python service analyzes webcam frames for face presence and direction, people count, and phone use.
- **Administration:** user, recruiter, company, and report management.

## Technology

- Frontend: React, Vite, React Router, TanStack Query, Tailwind CSS, and Clerk
- Backend: Node.js, Express, Prisma, PostgreSQL, and Socket.IO
- CV service: Python, TensorFlow, and OpenCV
- Integrations: Arbeitnow, Groq, OpenAI, Cloudinary, and Nodemailer
- Hosting: Vercel for the frontend; Render for the API, database, and CV service

## Run locally

### Requirements

- Node.js 20 or newer and npm
- PostgreSQL 14 or a compatible hosted PostgreSQL database
- Python 3.11 for the optional CV service
- Clerk credentials for production-style authentication

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Add your database and service credentials to .env.
npx prisma generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

The API runs at `http://localhost:5000`. The seed command adds sample users, recruiter companies, and job listings for development.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
# Set VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL in .env.
npm run dev
```

The Vite app runs at `http://localhost:3000` and proxies `/api` requests to the backend. Set `VITE_USE_LOCAL_AUTH=true` only for local development when using the built-in demo accounts; keep `ALLOW_DEV_AUTH=false` in production.

### CV proctoring service

The backend starts the CV bridge automatically when `CV/.venv` exists. To prepare it manually:

```powershell
cd CV
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

The service listens on `http://127.0.0.1:5001`. Proctoring needs camera permission in the browser.

## Environment configuration

Copy the example files and provide your own credentials:

- `backend/.env.example` for PostgreSQL, Clerk, Cloudinary, email, AI providers, CORS, and CV service settings.
- `frontend/.env.example` for Clerk’s publishable key, API URL, and optional local authentication.

Keep real `.env` files and API secrets out of Git. Resume uploads use Cloudinary when configured; local development falls back to private server storage.

## Deploy

### Backend on Render

The root `render.yaml` defines the PostgreSQL database, Express API, and Dockerized CV service. Create a Render Blueprint from this repository and provide the secret values requested by the Blueprint. Set `FRONTEND_URL` to the deployed Vercel origin.

### Frontend on Vercel

Import the repository into Vercel and set the project root directory to `frontend`. Add these environment variables:

- `VITE_CLERK_PUBLISHABLE_KEY`: your Clerk publishable key
- `VITE_API_URL`: the deployed backend API URL ending in `/api`

The Vite build and SPA rewrite are configured in `frontend/vercel.json`.

## Useful commands

| Location | Command | Purpose |
| --- | --- | --- |
| `frontend/` | `npm run dev` | Start the Vite development server |
| `frontend/` | `npm run build` | Create the production frontend build |
| `frontend/` | `npm run lint` | Run ESLint |
| `backend/` | `npm run dev` | Start the API with nodemon |
| `backend/` | `npm run prisma:push` | Apply the Prisma schema to the database |
| `backend/` | `npm run prisma:seed` | Add development sample data |

## Repository description

AI-assisted job and career platform for students and recruiters, with employer-posted jobs, resume applications, status tracking, skill assessments, and webcam exam proctoring.
