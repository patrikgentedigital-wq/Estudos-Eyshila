import { Request } from "express";

type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export class Logger {
  private static formatLog(level: LogLevel, message: string, reqId?: string, meta: any = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      reqId: reqId || "system",
      message,
      ...meta
    });
  }

  static info(message: string, req?: Request | string, meta?: any) {
    const reqId = typeof req === "string" ? req : req?.headers?.["x-request-id"] as string;
    console.log(this.formatLog("INFO", message, reqId, meta));
  }

  static warn(message: string, req?: Request | string, meta?: any) {
    const reqId = typeof req === "string" ? req : req?.headers?.["x-request-id"] as string;
    console.warn(this.formatLog("WARN", message, reqId, meta));
  }

  static error(message: string, error: Error | unknown, req?: Request | string, meta?: any) {
    const reqId = typeof req === "string" ? req : req?.headers?.["x-request-id"] as string;
    const stackTrace = error instanceof Error ? error.stack : String(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(this.formatLog("ERROR", message, reqId, {
      ...meta,
      error: errorMessage,
      stack: stackTrace
    }));
  }

  static critical(message: string, error: Error | unknown, req?: Request | string, meta?: any) {
    const reqId = typeof req === "string" ? req : req?.headers?.["x-request-id"] as string;
    const stackTrace = error instanceof Error ? error.stack : String(error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(this.formatLog("CRITICAL", `[ANOMALY] ${message}`, reqId, {
      ...meta,
      error: errorMessage,
      stack: stackTrace
    }));
  }
}
