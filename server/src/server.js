import http from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: env.allowedOrigins,
        credentials: true
      }
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      socket.emit("connected", { success: true, message: "Realtime channel connected" });
    });

    httpServer.listen(env.port, () => {
      console.log(`CropWise backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
