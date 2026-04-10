import { query } from "express-validator";

export const weatherValidation = [
  query("state").trim().notEmpty().withMessage("state is required"),
  query("district").trim().notEmpty().withMessage("district is required")
];
