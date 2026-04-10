import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import AppError from "../utils/appError.js";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

const modelCandidates = [
  env.geminiModel,
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001"
].filter((value, index, self) => value && self.indexOf(value) === index);

const cleanJsonText = (text) => {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : text.trim();
};

const validateAiPayload = (payload) => {
  const requiredStringFields = ["crop", "price_trend", "soil_tips"];
  for (const field of requiredStringFields) {
    if (typeof payload[field] !== "string" || !payload[field].trim()) {
      throw new AppError(`AI response is missing required field: ${field}`, 502);
    }
  }

  const requiredNumberFields = ["yield", "confidence", "market_price"];
  for (const field of requiredNumberFields) {
    if (typeof payload[field] !== "number" || Number.isNaN(payload[field])) {
      throw new AppError(`AI response field must be numeric: ${field}`, 502);
    }
  }

  if (!Array.isArray(payload.recommendations) || payload.recommendations.length === 0) {
    throw new AppError("AI response field recommendations must be a non-empty array", 502);
  }

  if (!Array.isArray(payload.alternative_crops)) {
    throw new AppError("AI response field alternative_crops must be an array", 502);
  }
};

export const getCropPredictionFromGemini = async (input) => {
  const prompt = `You are an agricultural AI advisor for Indian farming conditions.
Return ONLY strict JSON and no markdown.

Input:
${JSON.stringify(input, null, 2)}

Output JSON schema:
{
  "crop": "string",
  "yield": number,
  "confidence": number,
  "market_price": number,
  "price_trend": "up|down|stable",
  "recommendations": ["string"],
  "soil_tips": "string",
  "alternative_crops": ["string"]
}

Rules:
- yield is expected tonnes per hectare.
- confidence is between 0 and 100.
- market_price is INR per tonne.
- recommendations and alternative_crops must not be empty.
- Keep responses practical and specific to Indian farming.
`;

  try {
    let lastError = null;
    let result = null;
    const modelErrors = [];

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        break;
      } catch (error) {
        lastError = error;
        modelErrors.push(`${modelName}: ${error.message}`);
      }
    }

    if (!result) {
      throw new Error(
        `No Gemini model could generate a response. Attempts: ${modelErrors.join(" | ")}`
      );
    }

    const responseText = result.response.text();
    const parsed = JSON.parse(cleanJsonText(responseText));

    validateAiPayload(parsed);

    parsed.price_trend = parsed.price_trend.toLowerCase();
    if (!["up", "down", "stable"].includes(parsed.price_trend)) {
      throw new AppError("AI response price_trend must be one of up, down, stable", 502);
    }

    return {
      crop: parsed.crop.trim(),
      yield: parsed.yield,
      confidence: Math.max(0, Math.min(100, parsed.confidence)),
      market_price: parsed.market_price,
      price_trend: parsed.price_trend,
      recommendations: parsed.recommendations.map((item) => String(item).trim()).filter(Boolean),
      soil_tips: parsed.soil_tips.trim(),
      alternative_crops: parsed.alternative_crops.map((item) => String(item).trim()).filter(Boolean)
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to generate AI crop prediction", 502, error.message);
  }
};
