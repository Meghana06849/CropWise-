import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(env.mongodbUri, {
      autoIndex: env.nodeEnv !== "production",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: env.nodeEnv === "production" ? 100 : 20,
      minPoolSize: env.nodeEnv === "production" ? 10 : 0
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
};
