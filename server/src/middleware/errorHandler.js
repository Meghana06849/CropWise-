import AppError from "../utils/appError.js";

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource id",
      details: err.message
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Database validation failed",
      details: Object.values(err.errors).map((fieldError) => fieldError.message)
    });
  }

  if (err instanceof AppError) {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: "Internal server error",
    details: process.env.NODE_ENV === "production" ? undefined : err.message
  });
};
