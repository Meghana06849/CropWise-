import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    refreshTokenHash: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: ""
    },
    ipAddress: {
      type: String,
      default: ""
    },
    loginAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    logoutAt: {
      type: Date,
      default: null,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: -1 });

const UserSession = mongoose.model("UserSession", userSessionSchema);

export default UserSession;
