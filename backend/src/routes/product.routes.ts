// src/routes/product.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createProduct, getProducts, getProduct,
  updateProduct, deleteProduct, bulkCreateProducts,
  getPublicProducts, getPublicProduct,
  createVariant, updateVariant, deleteVariant, getVariants,
} from "../controllers/product.controller";

const router = Router();

// Public store products
router.get ("/public/:storeId",             getPublicProducts);
router.get ("/public/:storeId/:slug",       getPublicProduct);

// Authenticated store management
router.post  ("/:storeId",                              authenticate, createProduct);
router.post  ("/:storeId/bulk",                         authenticate, bulkCreateProducts);
router.get   ("/:storeId",                              authenticate, getProducts);
router.get   ("/:storeId/:productId",                   authenticate, getProduct);
router.put   ("/:storeId/:productId",                   authenticate, updateProduct);
router.delete("/:storeId/:productId",                   authenticate, deleteProduct);

// Variant management
router.get   ("/:storeId/:productId/variants",            authenticate, getVariants);
router.post  ("/:storeId/:productId/variants",            authenticate, createVariant);
router.put   ("/:storeId/:productId/variants/:variantId", authenticate, updateVariant);
router.delete("/:storeId/:productId/variants/:variantId", authenticate, deleteVariant);

export default router;
