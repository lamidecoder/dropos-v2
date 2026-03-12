// src/middleware/customerAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export interface CustomerAuthRequest extends Request {
  customer?: { accountId: string; storeId: string; email: string };
}

export const authenticateCustomer = (req: CustomerAuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError("No customer token provided", 401);

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
    if (payload.type !== "customer") throw new AppError("Invalid token type", 401);
    req.customer = { accountId: payload.id, storeId: payload.storeId, email: payload.email };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") throw new AppError("Token expired", 401);
    throw new AppError("Invalid token", 401);
  }
};
