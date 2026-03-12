import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createProductSubscription, getProductSubscriptions, updateProductSubscription } from "../controllers/productSubscription.controller";
const r = Router();
r.post("/:storeId", createProductSubscription);
r.get("/:storeId", authenticate, getProductSubscriptions);
r.patch("/:storeId/:subId", authenticate, updateProductSubscription);
export default r;
