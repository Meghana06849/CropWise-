import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("valid email is required").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("password must be at least 8 characters")
];

export const loginValidation = [
  body("email").isEmail().withMessage("valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("password is required")
];

export const refreshValidation = [
  body("refreshToken").isString().notEmpty().withMessage("refreshToken is required")
];

export const logoutValidation = [
  body("refreshToken").isString().notEmpty().withMessage("refreshToken is required")
];
