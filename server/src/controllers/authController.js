import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserSession from "../models/UserSession.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { env } from "../config/env.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const parseExpiryToMs = (value) => {
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) return numeric * 1000;

  const match = String(value).trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 30 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return amount * multipliers[unit];
};

const createAccessToken = (userId) =>
  jwt.sign({ type: "access" }, env.jwtSecret, {
    subject: String(userId),
    expiresIn: env.jwtExpiry
  });

const createRefreshToken = (userId, sessionId) =>
  jwt.sign({ type: "refresh", sid: sessionId }, env.jwtRefreshSecret, {
    subject: String(userId),
    expiresIn: env.jwtRefreshExpiry
  });

const issueSessionTokens = async (user, req) => {
  const now = new Date();
  const sessionId = crypto.randomUUID();
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id, sessionId);

  await UserSession.create({
    userId: user._id,
    sessionId,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.connection?.remoteAddress || "",
    loginAt: now,
    expiresAt: new Date(Date.now() + parseExpiryToMs(env.jwtRefreshExpiry))
  });

  await User.findByIdAndUpdate(user._id, { $set: { lastLoginAt: now } });

  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({ name, email, password, role });
  const tokens = await issueSessionTokens(user, req);

  res.status(201).json({
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: user.toSafeJSON()
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = await issueSessionTokens(user, req);

  res.json({
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: user.toSafeJSON()
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401, error.message);
  }

  if (payload.type !== "refresh" || !payload.sid || !payload.sub) {
    throw new AppError("Invalid refresh token payload", 401);
  }

  const session = await UserSession.findOne({
    sessionId: payload.sid,
    userId: payload.sub,
    revokedAt: null
  });

  if (!session) {
    throw new AppError("Session not found or revoked", 401);
  }

  if (session.expiresAt.getTime() < Date.now()) {
    const now = new Date();
    session.revokedAt = now;
    session.logoutAt = now;
    await session.save();
    throw new AppError("Session expired", 401);
  }

  if (session.refreshTokenHash !== hashToken(refreshToken)) {
    const now = new Date();
    session.revokedAt = now;
    session.logoutAt = now;
    await session.save();
    throw new AppError("Refresh token mismatch", 401);
  }

  const rotateTime = new Date();
  session.revokedAt = rotateTime;
  session.logoutAt = rotateTime;
  await session.save();

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError("User account no longer exists", 401);
  }

  const tokens = await issueSessionTokens(user, req);

  res.json({
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: user.toSafeJSON()
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
    if (payload.type === "refresh" && payload.sid && payload.sub) {
      const now = new Date();
      await UserSession.findOneAndUpdate(
        { sessionId: payload.sid, userId: payload.sub, revokedAt: null },
        { revokedAt: now, logoutAt: now }
      );

      await User.findByIdAndUpdate(payload.sub, { $set: { lastLogoutAt: now } });
    }
  } catch (_error) {
    // Logout should remain idempotent.
  }

  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  res.json({
    success: true,
    user: req.user.toSafeJSON()
  });
});
