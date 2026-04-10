import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    season: { type: String, required: true, trim: true },
    rainfall: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 0.01 },
    soil_ph: { type: Number, required: true, min: 0, max: 14 },
    nitrogen: { type: Number, required: true, min: 0 },
    phosphorus: { type: Number, required: true, min: 0 },
    potassium: { type: Number, required: true, min: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null
    },
    predicted_crop: { type: String, required: true, trim: true },
    expected_yield: { type: Number, required: true, min: 0 },
    expected_production: { type: Number, required: true, min: 0 },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    market_price: { type: Number, required: true, min: 0 },
    price_trend: {
      type: String,
      required: true,
      enum: ["up", "down", "stable"]
    },
    estimated_revenue: { type: Number, required: true, min: 0 },
    recommendations: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one recommendation is required"
      }
    },
    soil_tips: { type: String, required: true, trim: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

predictionSchema.index({ state: 1, district: 1, season: 1, createdAt: -1 });
predictionSchema.index({ predicted_crop: 1, createdAt: -1 });

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;
