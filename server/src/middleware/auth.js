import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import AppError from "../utils/appError.js";
import User from "../models/User.js";

export const requireAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (payload.type && payload.type !== "access") {
      return next(new AppError("Invalid token type", 401));
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return next(new AppError("User account no longer exists", 401));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired authentication token", 401, error.message));
  }
};

export const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.type && payload.type !== "access") {
      return next();
    }
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch (_error) {
    // Optional auth should not fail the request.
  }

  return next();
};
