import { Router } from "express";
import {
  createPrediction,
  deletePrediction,
  getPredictions
} from "../controllers/predictionController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createPredictionValidation,
  deletePredictionValidation,
  getPredictionsValidation
} from "../validators/predictionValidators.js";
import { validateRequest } from "../utils/validate.js";

const router = Router();

router.post("/predict", requireAuth, createPredictionValidation, validateRequest, createPrediction);
router.get("/predictions", requireAuth, getPredictionsValidation, validateRequest, getPredictions);
router.delete(
  "/predictions/:id",
  requireAuth,
  deletePredictionValidation,
  validateRequest,
  deletePrediction
);

export default router;
