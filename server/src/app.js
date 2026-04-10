import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import predictionRoutes from "./routes/predictionRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (env.allowedOrigins.includes(origin)) return true;

  if (env.nodeEnv !== "production") {
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  }

  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for this origin"));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", predictionRoutes);
app.use("/api", communityRoutes);
app.use("/api", weatherRoutes);

if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));

  app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(clientIndexPath);
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
