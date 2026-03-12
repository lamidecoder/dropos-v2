// src/utils/logger.ts
import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

const logsDir = path.join(process.cwd(), "logs");

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), logFormat),
    }),
    new winston.transports.File({ filename: `${logsDir}/error.log`,   level: "error" }),
    new winston.transports.File({ filename: `${logsDir}/combined.log` }),
  ],
});

// Add http level
winston.addColors({ http: "magenta" });
