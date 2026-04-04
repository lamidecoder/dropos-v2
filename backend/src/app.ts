import "express-async-errors";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

// Middleware
import { globalRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";

// Core Routes
import authRoutes        from "./routes/auth.routes";
import storeRoutes       from "./routes/store.routes";
import productRoutes     from "./routes/product.routes";
import orderRoutes       from "./routes/order.routes";
import paymentRoutes     from "./routes/payment.routes";
import customerRoutes    from "./routes/customer.routes";
import adminRoutes       from "./routes/admin.routes";
import analyticsRoutes   from "./routes/analytics.routes";
import uploadRoutes      from "./routes/upload.routes";
import supportRoutes     from "./routes/support.routes";
import notificationRoutes from "./routes/notification.routes";
import couponRoutes      from "./routes/coupon.routes";
import discountRoutes    from "./routes/discount.routes";
import affiliateRoutes   from "./routes/affiliate.routes";
import aiRoutes          from "./routes/ai.routes";
import pushRoutes        from "./routes/push.routes";
import shippingRoutes    from "./routes/shipping.routes";
import reviewRoutes      from "./routes/review.routes";
import invoiceRoutes     from "./routes/invoice.routes";
import emailRoutes       from "./routes/email.routes";
import upsellRoutes      from "./routes/upsell.routes";
import abandonedCartRoutes from "./routes/abandonedCart.routes";
import notifSettingsRoutes from "./routes/notificationSettings.routes";
import currencyRoutes      from "./routes/currency.routes";
import supplierRoutes      from "./routes/supplier.routes";
import refundRoutes        from "./routes/refund.routes";
import giftCardRoutes      from "./routes/giftCard.routes";
import customerAccountRoutes from "./routes/customerAccount.routes";
import funnelRoutes        from "./routes/funnel.routes";
import apiKeyRoutes        from "./routes/apiKey.routes";
import webhookRoutes       from "./routes/webhook.routes";
import returnsRoutes       from "./routes/returns.routes";
import twoFARoutes         from "./routes/twoFA.routes";
import productSubscriptionRoutes from "./routes/productSubscription.routes";
import waitlistRoutes      from "./routes/waitlist.routes";

// KAI CORE
import kaiRoutes from "./routes/kai.routes";

// KAI EXPANSIONS
import kaiPowerRoutes from "./routes/kai.power.routes";
import featuresRoutes from "./routes/features.routes";
import loyaltyRoutes from "./routes/loyalty.routes";
import superchargeRoutes from "./routes/supercharge.routes";
import kaiAgentRoutes from "./routes/kai.agent.routes";
import themeRoutes from "./routes/theme.routes";

// Controllers (Advanced AI + Automation)
import productIntelRoutes from "./controllers/product.intel.controller";
import intelRoutes from "./controllers/kai.intelligence.controller";
import fulfillmentRoutes from "./controllers/fulfillment.controller";

const app = express();

// TRUST PROXY
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// SECURITY
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "https://dropos-frontend1.vercel.app",
  "https://droposhq.com",
  "https://www.droposhq.com",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

// WEBHOOK RAW BODY
app.use("/api/payments/webhook/stripe", express.raw({ type: "application/json" }));
app.use("/api/payments/webhook/paystack", express.raw({ type: "application/json" }));
app.use("/api/payments/webhook/flutterwave", express.raw({ type: "application/json" }));

// BODY PARSER
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(compression());

// QUERY SANITIZATION
app.use((req, _res, next) => {
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = (req.query[key] as string[]).at(-1) as any;
    }
  }
  next();
});

// STATIC
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// LOGGING
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
  app.use(requestLogger);
}

// RATE LIMIT
app.use("/api", globalRateLimiter);

// HEALTH
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "DropOS API" });
});

// CORE BUSINESS ROUTES
app.use("/api/auth",                 authRoutes);
app.use("/api/stores",               storeRoutes);
app.use("/api/products",             productRoutes);
app.use("/api/orders",               orderRoutes);
app.use("/api/payments",             paymentRoutes);
app.use("/api/customers",            customerRoutes);
app.use("/api/admin",                adminRoutes);
app.use("/api/analytics",            analyticsRoutes);
app.use("/api/upload",               uploadRoutes);
app.use("/api/support",              supportRoutes);
app.use("/api/notifications",        notificationRoutes);
app.use("/api/coupons",              couponRoutes);
app.use("/api/discounts",            discountRoutes);
app.use("/api/affiliates",           affiliateRoutes);
app.use("/api/ai",                   aiRoutes);
app.use("/api/push",                 pushRoutes);
app.use("/api/shipping",             shippingRoutes);
app.use("/api/reviews",              reviewRoutes);
app.use("/api/invoices",             invoiceRoutes);
app.use("/api/email",                emailRoutes);
app.use("/api/abandoned-carts",      abandonedCartRoutes);
app.use("/api/notification-settings",notifSettingsRoutes);
app.use("/api/currency",             currencyRoutes);
app.use("/api/suppliers",            supplierRoutes);
app.use("/api/refunds",              refundRoutes);
app.use("/api/gift-cards",           giftCardRoutes);
app.use("/api/customer-auth",        customerAccountRoutes);
app.use("/api/funnel",               funnelRoutes);
app.use("/api/api-keys",             apiKeyRoutes);
app.use("/api/webhooks",             webhookRoutes);
app.use("/api/ops",                  returnsRoutes);
app.use("/api/2fa",                  twoFARoutes);
app.use("/api/product-subscriptions",productSubscriptionRoutes);
app.use("/api/upsell",               upsellRoutes);
app.use("/api/waitlist",             waitlistRoutes);

// KAI SYSTEM
app.use("/api/kai",              kaiRoutes);
app.use("/api/kai/power",        kaiPowerRoutes);
app.use("/api/kai/agent",        kaiAgentRoutes);
app.use("/api/features",         featuresRoutes);
app.use("/api/loyalty",          loyaltyRoutes);
app.use("/api/super",            superchargeRoutes);
app.use("/api/theme",            themeRoutes);
app.use("/api/products/intel",   productIntelRoutes);
app.use("/api/intel",            intelRoutes);
app.use("/api/fulfillment",      fulfillmentRoutes);

// ERRORS
app.use(notFound);
app.use(errorHandler);

export default app;