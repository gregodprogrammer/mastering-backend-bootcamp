import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import "./events/admin.events.js";

const app = express();

// === MIDDLEWARE ===
app.use(helmet());
app.use(cors());
app.use(express.json());

// === REQUEST LOGGING ===
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  next();
});

// === HEALTH CHECK ===
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// === AUTH ROUTES ===
app.use("/api/v1/auth", authRoutes);

// === ADMIN / RBAC ROUTES ===
app.use("/api/v1/admin", adminRoutes);

// === ERROR HANDLER ===
app.use(errorHandler);

export default app;
