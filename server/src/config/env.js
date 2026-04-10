import dotenv from "dotenv";

dotenv.config();

const requiredVars = [
  "MONGODB_URI",
  "GEMINI_API_KEY",
  "OPENWEATHER_API_KEY",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET"
];

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || "7d",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "30d",
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  openWeatherBaseUrl: process.env.OPENWEATHER_BASE_URL || "https://api.openweathermap.org",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};

export const validateEnv = () => {
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
};
