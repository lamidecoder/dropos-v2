import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// POST /api/contact
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required" });
    }
    await (prisma.contactMessage as any).create({ data: { name, email, subject: subject || "general", message } });
    // TODO: send email notification to hello@droposhq.com via Resend
    res.json({ success: true, message: "Message received. We will reply within 24 hours." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
