import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "./logger.js";
import NodeCache from "node-cache";

// Cache para IA (Regra 6)
export const aiCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Middleware Regra 1 e 7: Request ID e Métricas de Performance
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Inject Request ID
  const reqId = req.headers["x-request-id"] as string || uuidv4();
  req.headers["x-request-id"] = reqId;
  res.setHeader("x-request-id", reqId);

  const start = performance.now();
  const startMem = process.memoryUsage().heapUsed;

  // Intercept finish event to log metrics
  res.on("finish", () => {
    const duration = performance.now() - start;
    const endMem = process.memoryUsage().heapUsed;
    const memDiff = (endMem - startMem) / 1024 / 1024; // MB

    Logger.info(`Request Completed: ${req.method} ${req.originalUrl}`, req, {
      durationMs: Math.round(duration),
      memoryDiffMB: Number(memDiff.toFixed(2)),
      statusCode: res.statusCode,
    });
  });

  next();
};
