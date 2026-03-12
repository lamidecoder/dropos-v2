import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  requestReturn, getReturns, updateReturn,
  createFlashSale, getFlashSales, updateFlashSale, deleteFlashSale, getActiveFlashSales,
  exportStoreData,
} from "../controllers/returns.controller";

const r = Router();

// Returns
r.post("/return/:orderNumber",             requestReturn);
r.get("/returns/:storeId",                 authenticate, getReturns);
r.patch("/returns/:storeId/:returnId",     authenticate, updateReturn);

// Flash Sales — specific routes BEFORE generic /:storeId
r.get("/flash-sales/:storeId/active",      getActiveFlashSales);   // public, specific first
r.get("/flash-sales/:storeId",             authenticate, getFlashSales);
r.post("/flash-sales/:storeId",            authenticate, createFlashSale);
r.patch("/flash-sales/:storeId/:saleId",   authenticate, updateFlashSale);
r.delete("/flash-sales/:storeId/:saleId",  authenticate, deleteFlashSale);

// Export
r.get("/export/:storeId",                  authenticate, exportStoreData);

export default r;
