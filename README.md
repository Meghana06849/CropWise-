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

## Vercel Deployment

This repo can be deployed to Vercel with the frontend and API in the same project.

### What works

- Frontend UI
- Authentication
- Crop predictions
- Weather lookup
- Community posts, comments, likes
- MongoDB persistence through the Vercel API function

### What is disabled on Vercel

- Socket.IO realtime transport, because Vercel does not run a persistent Node server

### Vercel setup

1. Import the repository into Vercel.
2. Use the repository root as the project root.
3. Let Vercel read [vercel.json](vercel.json).
4. Add these environment variables in Vercel:
	- `NODE_ENV=production`
	- `MONGODB_URI=your Atlas URI`
	- `GEMINI_API_KEY=your Gemini key`
	- `OPENWEATHER_API_KEY=your OpenWeather key`
	- `JWT_SECRET=your secret`
	- `JWT_REFRESH_SECRET=your secret`
	- `VITE_ENABLE_REALTIME=false`
5. Deploy.

### Notes

- SPA routes are handled by the rewrite in [vercel.json](vercel.json).
- API requests are handled by the serverless function in [api/[...path].js](api/%5B...path%5D.js).
- Local development and Render deployment still work the same way as before.

## Main Features

- JWT authentication
- AI crop prediction via Gemini
- Real-time weather lookup
- MongoDB persistence
- Community posts, comments, likes
- Realtime updates through Socket.IO
- PDF export for prediction reports
