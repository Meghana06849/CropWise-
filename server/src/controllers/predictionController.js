import Prediction from "../models/Prediction.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { getCropPredictionFromGemini } from "../services/geminiService.js";
import { getWeatherByLocation } from "../services/weatherService.js";

export const createPrediction = asyncHandler(async (req, res) => {
  const {
    state,
    district,
    season,
    rainfall,
    area,
    soil_ph,
    nitrogen,
    phosphorus,
    potassium
  } = req.body;

  const parsedRainfall =
    typeof rainfall === "number"
      ? rainfall
      : typeof rainfall === "string" && rainfall.trim() !== ""
        ? Number(rainfall)
        : null;
  const hasManualRainfall = Number.isFinite(parsedRainfall);

  let weatherData = null;
  let weatherError = null;

  try {
    weatherData = await getWeatherByLocation({ state, district });
  } catch (error) {
    weatherError = error;
    if (!hasManualRainfall) {
      throw new AppError(
        "Weather lookup failed and rainfall was not provided manually",
        502,
        error.message
      );
    }
  }

  const effectiveRainfall = hasManualRainfall ? parsedRainfall : weatherData?.rainfall;

  const aiResult = await getCropPredictionFromGemini({
    state,
    district,
    season,
    rainfall: effectiveRainfall,
    area,
    soil_ph,
    nitrogen,
    phosphorus,
    potassium,
    humidity: weatherData?.humidity ?? null,
    temperature: weatherData?.temperature ?? null
  });

  const expectedProduction = Number((area * aiResult.yield).toFixed(2));
  const estimatedRevenue = Number((expectedProduction * aiResult.market_price).toFixed(2));

  const prediction = await Prediction.create({
    state,
    district,
    season,
    rainfall: effectiveRainfall,
    area,
    soil_ph,
    nitrogen,
    phosphorus,
    potassium,
    predicted_crop: aiResult.crop,
    expected_yield: aiResult.yield,
    expected_production: expectedProduction,
    confidence: aiResult.confidence,
    market_price: aiResult.market_price,
    price_trend: aiResult.price_trend,
    estimated_revenue: estimatedRevenue,
    recommendations: [...aiResult.recommendations, ...aiResult.alternative_crops],
    soil_tips: aiResult.soil_tips,
    createdBy: req.user?._id || null
  });

  req.app.get("io")?.emit("prediction:created", prediction);

  res.status(201).json({
    success: true,
    data: prediction,
    weather: weatherData,
    alternatives: aiResult.alternative_crops,
    weatherFallbackUsed: Boolean(weatherError && hasManualRainfall)
  });
});

export const getPredictions = asyncHandler(async (req, res) => {
  const { state, district, season, crop, all } = req.query;

  const filter = {};
  const requestAllRecords = String(all || "").toLowerCase() === "true";
  const canViewAll = req.user?.role === "admin" && requestAllRecords;

  if (!canViewAll) {
    filter.createdBy = req.user._id;
  }
  if (state) filter.state = state;
  if (district) filter.district = district;
  if (season) filter.season = season;
  if (crop) filter.predicted_crop = crop;

  const predictions = await Prediction.find(filter).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    count: predictions.length,
    data: predictions
  });
});

export const deletePrediction = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findById(req.params.id);

  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: "Prediction not found"
    });
  }

  const currentUserId = String(req.user?._id || "");
  const createdById = prediction.createdBy ? String(prediction.createdBy) : null;
  const isOwnerOrAdmin = req.user?.role === "admin" || !createdById || createdById === currentUserId;

  if (!isOwnerOrAdmin) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this prediction"
    });
  }

  await Prediction.findByIdAndDelete(req.params.id);

  req.app.get("io")?.emit("prediction:deleted", { id: String(prediction._id) });

  return res.json({
    success: true,
    message: "Prediction deleted successfully"
  });
});
