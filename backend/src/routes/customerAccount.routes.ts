import { Router } from "express";
import { authenticateCustomer } from "../middleware/customerAuth";
import {
  registerCustomer, loginCustomer, getCustomerProfile, updateCustomerProfile,
  toggleWishlist, getWishlist, customerForgotPassword,
} from "../controllers/customerAccount.controller";

const r = Router();
// Public
r.post("/register", registerCustomer);
r.post("/login", loginCustomer);
r.post("/forgot-password", customerForgotPassword);
// Authenticated customer
r.get("/profile", authenticateCustomer, getCustomerProfile);
r.patch("/profile", authenticateCustomer, updateCustomerProfile);
r.post("/wishlist/toggle", authenticateCustomer, toggleWishlist);
r.get("/wishlist", authenticateCustomer, getWishlist);
export default r;
