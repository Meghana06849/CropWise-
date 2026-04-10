# CropWise Backend

Production-ready Node.js + Express backend for CropWise.

## 1. Setup

1. Copy `.env.example` to `.env`
2. Fill in valid credentials:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `OPENWEATHER_API_KEY`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in development:
   ```bash
   npm run dev
   ```

## 2. API Base URL

`http://localhost:5000`

## 3. Endpoints

### Health
- `GET /api/health`

### Prediction
- `POST /api/predict`
- `GET /api/predictions`
- `DELETE /api/predictions/:id`

### Community
- `POST /api/posts`
- `GET /api/posts`
- `POST /api/posts/:id/comment`
- `POST /api/posts/:id/like`

### Weather
- `GET /api/weather?state=...&district=...`

## 4. Example Prediction Request

```json
{
  "state": "Maharashtra",
  "district": "Pune",
  "season": "Kharif",
  "area": 3.5,
  "soil_ph": 6.8,
  "nitrogen": 80,
  "phosphorus": 45,
  "potassium": 50
}
```

`rainfall` is optional. If omitted, real-time weather service is used.

## 5. Notes

- AI predictions are generated via Gemini from backend only.
- Weather data is fetched from OpenWeather API.
- All endpoints use JSON responses with `success` flag and `data` payload when applicable.
