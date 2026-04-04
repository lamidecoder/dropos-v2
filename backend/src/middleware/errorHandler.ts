// ============================================================
// Error Handler — Human-Readable Errors
// Path: backend/src/middleware/errorHandler.ts
// Add to app.ts LAST: app.use(errorHandler);
// ============================================================
import { Request, Response, NextFunction } from "express";

// Map of technical errors → human messages
const ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  // Auth
  NO_TOKEN:          { message: "Please log in to continue",                    status: 401 },
  TOKEN_EXPIRED:     { message: "Your session expired — refreshing now",        status: 401 },
  USER_NOT_FOUND:    { message: "Account not found — please contact support",   status: 401 },
  ACCOUNT_BANNED:    { message: "Account suspended. Email support@droposHQ.com",status: 403 },
  FORBIDDEN:         { message: "You don't have permission to do that",         status: 403 },
  KAI_LIMIT_REACHED: { message: "KAI message limit reached — upgrade your plan",status: 403 },

  // Database
  P2002:  { message: "That already exists — try a different name",              status: 409 },
  P2025:  { message: "Item not found",                                           status: 404 },
  P2003:  { message: "Related item not found",                                  status: 400 },
  P2014:  { message: "Cannot delete — items still linked to this",              status: 400 },

  // KAI / AI
  AI_UNAVAILABLE:     { message: "KAI is briefly unavailable — try in a moment",status: 503 },
  AI_NOT_CONFIGURED:  { message: "AI service not set up — contact support",     status: 503 },
  RATE_LIMITED:       { message: "Too many requests — please wait a moment",    status: 429 },

  // Files
  FILE_TOO_LARGE:  { message: "File is too large — max 10MB",                   status: 413 },
  INVALID_FILE:    { message: "Invalid file type — use JPG, PNG, or WebP",      status: 400 },

  // Generic
  NOT_FOUND:       { message: "Page not found",                                 status: 404 },
  VALIDATION:      { message: "Please check your inputs and try again",         status: 400 },
};

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Already sent response
  if (res.headersSent) return next(err);

  // Log the actual error internally
  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    code:    err.code || err.name,
    message: err.message,
    stack:   process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Determine error type
  let status  = err.status || err.statusCode || 500;
  let message = err.message || "Something went wrong — please try again";
  let code    = err.code || "UNKNOWN_ERROR";

  // Map Prisma errors
  if (err.code?.startsWith("P")) {
    const mapped = ERROR_MESSAGES[err.code];
    if (mapped) { status = mapped.status; message = mapped.message; }
  }

  // Map custom codes
  if (err.code && ERROR_MESSAGES[err.code]) {
    const mapped = ERROR_MESSAGES[err.code];
    status  = mapped.status;
    message = mapped.message;
  }

  // Don't expose internal errors in production
  if (status === 500 && process.env.NODE_ENV === "production") {
    message = "Something went wrong on our end — we're looking into it";
  }

  res.status(status).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV === "development" && { debug: err.message }),
  });
}

// ── Not found handler ────────────────────────────────────────
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    code:    "NOT_FOUND",
    message: `Route ${req.method} ${req.path} not found`,
  });
}

// ── Async wrapper — catches errors in async route handlers ────
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
