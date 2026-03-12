import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { setup2FA, verify2FA, disable2FA, validate2FALogin } from "../controllers/twoFA.controller";
const r = Router();
r.post("/setup", authenticate, setup2FA);
r.post("/verify", authenticate, verify2FA);
r.post("/disable", authenticate, disable2FA);
r.post("/validate", validate2FALogin);
export default r;
