import asyncHandler from "../utils/asyncHandler.js";
import { getWeatherByLocation } from "../services/weatherService.js";

export const getWeather = asyncHandler(async (req, res) => {
  const { state, district } = req.query;
  const weather = await getWeatherByLocation({ state, district });

  res.json({
    success: true,
    data: weather
  });
});
