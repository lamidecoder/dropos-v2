import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { listBanks, verifyAccount, connectBankAccount, getBankInfo } from "../controllers/bankAccount.controller";

const router = Router();

router.get  ("/",                              listBanks);      // public — no auth needed
router.post ("/verify",  authenticate,         verifyAccount);
router.post ("/:storeId/connect", authenticate, connectBankAccount);
router.get  ("/:storeId",         authenticate, getBankInfo);

export default router;
