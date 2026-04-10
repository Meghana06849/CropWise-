import axios from "axios";
import { env } from "../config/env.js";
import AppError from "../utils/appError.js";

const weatherClient = axios.create({
  baseURL: env.openWeatherBaseUrl,
  timeout: 15000
});

const getRainfallMm = (rainData = {}) => {
  if (typeof rainData["1h"] === "number") {
    return rainData["1h"];
  }

  if (typeof rainData["3h"] === "number") {
    return Number((rainData["3h"] / 3).toFixed(2));
  }

  return 0;
};

export const getWeatherByLocation = async ({ state, district }) => {
  if (!state || !district) {
    throw new AppError("State and district are required for weather lookup", 400);
  }

  let geo;

  try {
    const geoResponse = await weatherClient.get("/geo/1.0/direct", {
      params: {
        q: `${district},${state},IN`,
        limit: 1,
        appid: env.openWeatherApiKey
      }
    });

    geo = geoResponse.data?.[0];
  } catch (error) {
    throw new AppError("Failed to resolve location for weather service", 502, error.message);
  }

  if (!geo?.lat || !geo?.lon) {
    throw new AppError("Could not locate weather coordinates for provided district and state", 404);
  }

  try {
    const weatherResponse = await weatherClient.get("/data/2.5/weather", {
      params: {
        lat: geo.lat,
        lon: geo.lon,
        units: "metric",
        appid: env.openWeatherApiKey
      }
    });

    const weather = weatherResponse.data;

    return {
      rainfall: getRainfallMm(weather.rain),
      humidity: weather.main?.humidity,
      temperature: weather.main?.temp,
      source: "openweathermap"
    };
  } catch (error) {
    throw new AppError("Failed to fetch weather data", 502, error.message);
  }
};
