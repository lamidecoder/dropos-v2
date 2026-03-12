// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { prisma } from "../config/database";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message    = "Internal server error";
  let errors: any = undefined;

  // Known application error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message    = err.message;
  }

  // Zod validation error
  else if (err instanceof ZodError) {
    statusCode = 422;
    message    = "Validation failed";
    errors     = err.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
  }

  // Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      const field = (err.meta?.target as string[])?.join(", ") || "field";
      message = `${field} already exists`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else {
      statusCode = 400;
      message = "Database error";
    }
  }

  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Log to DB for critical errors
  if (statusCode >= 500) {
    logger.error({ message: err.message, stack: err.stack, path: req.path, method: req.method });
    try {
      await prisma.errorLog.create({
        data: {
          message: err.message,
          stack: err.stack,
          path: req.path,
          method: req.method,
          statusCode,
          ipAddress: req.ip,
        },
      });
    } catch {}
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && statusCode >= 500 && { stack: err.stack }),
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
