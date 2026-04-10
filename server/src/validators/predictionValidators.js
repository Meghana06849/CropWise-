import { body, param, query } from "express-validator";

export const createPredictionValidation = [
  body("state").trim().notEmpty().withMessage("state is required"),
  body("district").trim().notEmpty().withMessage("district is required"),
  body("season").trim().notEmpty().withMessage("season is required"),
  body("rainfall").optional().isFloat({ min: 0 }).withMessage("rainfall must be >= 0"),
  body("area").isFloat({ min: 0.01 }).withMessage("area must be greater than 0"),
  body("soil_ph").isFloat({ min: 0, max: 14 }).withMessage("soil_ph must be between 0 and 14"),
  body("nitrogen").isFloat({ min: 0 }).withMessage("nitrogen must be >= 0"),
  body("phosphorus").isFloat({ min: 0 }).withMessage("phosphorus must be >= 0"),
  body("potassium").isFloat({ min: 0 }).withMessage("potassium must be >= 0")
];

export const getPredictionsValidation = [
  query("state").optional().isString().trim(),
  query("district").optional().isString().trim(),
  query("season").optional().isString().trim(),
  query("crop").optional().isString().trim(),
  query("all").optional().isBoolean().withMessage("all must be true or false")
];

export const deletePredictionValidation = [
  param("id").isMongoId().withMessage("Valid prediction id is required")
];
