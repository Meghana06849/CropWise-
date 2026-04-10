# CropWise

CropWise is an AI-powered agricultural advisory platform for Indian farmers.

## Project Structure

- `server/` - Node.js, Express, MongoDB backend
- `client/` - React, Vite, Tailwind frontend

## Local Development

### Backend

1. `cd server`
2. Copy `.env.example` to `.env`
3. Fill in `MONGODB_URI`, `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`, and `JWT_SECRET`
4. `npm install`
5. `npm run dev`

### Frontend

1. `cd client`
2. Copy `.env.example` to `.env`
3. Set `VITE_API_URL` if needed
4. `npm install`
5. `npm run dev`

## Docker Deployment

1. Set the required environment variables for Gemini, JWT, and OpenWeather.
2. Run `docker compose up --build` from the repository root.
3. Open the app at `http://localhost:8080`.

## Render Deployment (Single Link)

This repository is configured for single-link deployment where one backend service also serves the built frontend.

### Option A: Blueprint (Recommended)

1. Push this repository to GitHub.
2. In Render, choose **New** -> **Blueprint**.
3. Select this repository.
4. Render reads `render.yaml` and creates the `cropwise` web service.
5. Fill secrets when prompted (`MONGODB_URI`, `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`, `ALLOWED_ORIGINS`).

### Option B: Manual Web Service

1. Create one **Web Service** from repository root (`.`).
2. Set **Build Command**: `npm run build:all`
3. Set **Start Command**: `npm run start:server`
4. Set **Health Check Path**: `/api/health`
5. Add the environment variables listed in `render.yaml`.

### Production Environment Notes

- Use MongoDB Atlas URI for `MONGODB_URI`.
- Set `ALLOWED_ORIGINS` to your Render app URL, e.g. `https://cropwise.onrender.com`.
- Frontend API/socket defaults are configured for same-origin in production (`/api` and current host origin).

## Main Features

- JWT authentication
- AI crop prediction via Gemini
- Real-time weather lookup
- MongoDB persistence
- Community posts, comments, likes
- Realtime updates through Socket.IO
- PDF export for prediction reports
