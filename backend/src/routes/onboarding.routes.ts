import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();
router.use(authenticate);

// POST /api/onboarding/complete
router.post("/complete", async (req: any, res: Response) => {
  try {
    const { niche, stage, goal, template } = req.body;
    const userId  = req.user.id;
    const storeId = req.user.stores?.[0]?.id;

    // Update user as onboarded
    const user = await prisma.user.update({
      where: { id: userId },
      data: { onboarded: true, onboardNiche: niche, onboardStage: stage, onboardGoal: goal, onboardTemplate: template },
    });

    // Apply template to store if exists
    if (storeId && template) {
      await prisma.store.update({
        where: { id: storeId },
        data: { templateId: template, primaryColor: getColorForNiche(niche) },
      }).catch(() => {}); // Non-critical
    }

    // Generate KIRO welcome message based on answers
    const nicheLabels: Record<string,string> = {
      hair:"Hair and Beauty", fashion:"Fashion and Clothing", electronics:"Electronics",
      food:"Food and Drinks", skincare:"Skincare and Wellness", home:"Home and Living",
      kids:"Kids and Baby", other:"your niche",
    };
    const nicheLabel = nicheLabels[niche] || "your niche";

    const kiroMessage = `Perfect. I am setting up your ${nicheLabel} store right now. I am picking the best template, importing trending products in your category, and configuring Paystack for Nigerian buyers. This takes about 10 seconds.`;

    // Create first milestone: store setup
    if (storeId) {
      await prisma.milestone.create({
        data: {
          storeId, type: "store_complete",
          title: "Your store is live",
          message: `KIRO has set up your ${nicheLabel} store. Share your link and get your first sale today.`,
          cta: { label: "View your store", href: "/dashboard/stores" },
        },
      }).catch(() => {});
    }

    res.json({ success: true, data: { kiroMessage, user: { ...user, password: undefined } } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function getColorForNiche(niche: string): string {
  const colors: Record<string,string> = {
    hair:"#E91E8C", fashion:"#8B5CF6", electronics:"#06B6D4",
    food:"#F59E0B", skincare:"#10B981", home:"#F97316", kids:"#EC4899",
  };
  return colors[niche] || "#6B35E8";
}

export default router;
