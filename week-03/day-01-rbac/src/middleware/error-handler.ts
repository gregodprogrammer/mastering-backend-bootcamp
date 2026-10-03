import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({
    event: "request:error",
    message: err.message,
    method: req.method,
    path: req.path,
  });

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}


