// src/services/discount.service.ts
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";

interface ApplyDiscountInput {
  storeId:    string;
  cartItems:  { productId: string; qty: number; price: number; collectionIds?: string[] }[];
  subtotal:   number;
  customerId?: string;
  isFirstOrder?: boolean;
}

export class DiscountService {

  // ── Evaluate which automatic discounts apply to a cart ──────────────────
  static async getAutoDiscounts(input: ApplyDiscountInput) {
    const now = new Date();

    const discounts = await prisma.discount.findMany({
      where: {
        storeId:     input.storeId,
        isAutomatic: true,
        status:      "ACTIVE",
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
          { OR: [
            { flashSaleStartsAt: null },
            { flashSaleStartsAt: { lte: now } },
          ]},
          { OR: [
            { flashSaleEndsAt: null },
            { flashSaleEndsAt: { gte: now } },
          ]},
        ],
      },
      orderBy: { priority: "desc" },
    });

    const applicable: any[] = [];

    for (const d of discounts) {
      // Check usage limits
      if (d.maxUses && d.usedCount >= d.maxUses) continue;

      // Check minimum order value
      if (d.minOrderValue && input.subtotal < d.minOrderValue) continue;

      // Check first order only
      if (d.firstOrderOnly && !input.isFirstOrder) continue;

      // Check product/collection filter
      let eligibleItems = input.cartItems;
      if (d.productIds?.length > 0) {
        eligibleItems = input.cartItems.filter(i => d.productIds.includes(i.productId));
        if (eligibleItems.length === 0) continue;
      }

      // Check min quantity
      const totalQty = eligibleItems.reduce((s, i) => s + i.qty, 0);
      if (d.minQuantity && totalQty < d.minQuantity) continue;

      // Calculate discount amount
      const calc = DiscountService.calculateDiscount(d, input, eligibleItems);
      if (calc.amount > 0) {
        applicable.push({ discount: d, ...calc });
      }
    }

    return applicable;
  }

  // ── Calculate the monetary value of a discount ───────────────────────────
  static calculateDiscount(discount: any, input: ApplyDiscountInput, eligibleItems: typeof input.cartItems) {
    const eligibleSubtotal = eligibleItems.reduce((s, i) => s + i.price * i.qty, 0);

    switch (discount.type) {
      case "PERCENTAGE":
      case "FLASH_SALE": {
        const pct = discount.value / 100;
        const raw = eligibleSubtotal * pct;
        const amount = discount.maxDiscount ? Math.min(raw, discount.maxDiscount) : raw;
        return { amount: Math.round(amount * 100) / 100, label: `${discount.value}% off` };
      }

      case "FIXED": {
        return { amount: Math.min(discount.value, eligibleSubtotal), label: `$${discount.value} off` };
      }

      case "FREE_SHIPPING": {
        return { amount: 0, freeShipping: true, label: "Free shipping" };
      }

      case "BOGO": {
        if (!discount.bogoRequiredQty || !discount.bogoGetQty) return { amount: 0, label: "" };
        const sortedItems = [...eligibleItems].sort((a, b) => a.price - b.price);
        let totalFreeValue = 0;
        let required = discount.bogoRequiredQty;
        let freeLeft = discount.bogoGetQty;
        let counted = 0;
        for (const item of eligibleItems.sort((a, b) => b.price - a.price)) {
          for (let q = 0; q < item.qty; q++) {
            counted++;
            if (counted > required && freeLeft > 0) {
              const pctOff = (discount.bogoPctOff || 100) / 100;
              totalFreeValue += item.price * pctOff;
              freeLeft--;
            }
          }
        }
        return { amount: Math.round(totalFreeValue * 100) / 100, label: `Buy ${discount.bogoRequiredQty} get ${discount.bogoGetQty}` };
      }

      case "TIERED": {
        if (!discount.tiers) return { amount: 0, label: "" };
        const tiers = discount.tiers as { minQty: number; discount: number }[];
        const totalQty = eligibleItems.reduce((s, i) => s + i.qty, 0);
        const applicable = tiers.filter(t => totalQty >= t.minQty).sort((a, b) => b.discount - a.discount)[0];
        if (!applicable) return { amount: 0, label: "" };
        const amount = (eligibleSubtotal * applicable.discount) / 100;
        return { amount: Math.round(amount * 100) / 100, label: `${applicable.discount}% off (${totalQty}+ items)` };
      }

      default:
        return { amount: 0, label: "" };
    }
  }

  // ── Validate & apply a discount code ────────────────────────────────────
  static async validateCode(code: string, storeId: string, input: ApplyDiscountInput) {
    const now = new Date();

    const discount = await prisma.discount.findFirst({
      where: {
        storeId,
        name:   { equals: code, mode: "insensitive" },
        status: "ACTIVE",
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }],
      },
    });

    if (!discount) throw new AppError("Invalid or expired discount code", 400);
    if (discount.maxUses && discount.usedCount >= discount.maxUses)
      throw new AppError("Discount usage limit reached", 400);
    if (discount.minOrderValue && input.subtotal < discount.minOrderValue)
      throw new AppError(`Minimum order of $${discount.minOrderValue} required`, 400);

    const calc = DiscountService.calculateDiscount(discount, input, input.cartItems);
    return { discount, ...calc };
  }

  // ── Record discount usage after order placed ─────────────────────────────
  static async recordUsage(discountId: string, orderId: string, customerId: string | undefined, amountSaved: number) {
    await prisma.$transaction([
      await prisma.discountUsage.create({
        data: { discountId, orderId, customerId, amountSaved },
      }),
      await prisma.discount.update({
        where: { id: discountId },
        data:  { usedCount: { increment: 1 } },
      }),
    ]);
  }

  // ── Get analytics for a discount ────────────────────────────────────────
  static async getAnalytics(discountId: string) {
    const usages = await prisma.discountUsage.findMany({
      where:   { discountId },
      orderBy: { appliedAt: "desc" },
      take:    50,
    });

    const totalSaved    = usages.reduce((s, u) => s + u.amountSaved, 0);
    const uniqueOrders  = new Set(usages.map(u => u.orderId)).size;

    return { usages, totalSaved, uniqueOrders, totalUses: usages.length };
  }
}
