import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== "production",
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: env.nodeEnv === "production" ? 100 : 20,
    minPoolSize: env.nodeEnv === "production" ? 10 : 0
  });
};
