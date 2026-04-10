import { validationResult } from "express-validator";
import AppError from "./appError.js";

export const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  return next();
};
