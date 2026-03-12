// src/controllers/order.controller.ts
import { supplierService, FulfillmentPayload } from "../services/supplier.service";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { generateOrderNumber, paginate } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import { requireStoreOwner } from "./store.controller";
import { emailService }        from "../services/email.service";
import { notificationService } from "../services/notification.service";
import { pushToStoreOwner, PushTemplates } from "../services/push.service";

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().optional(),
  quantity:  z.number().int().min(1).max(1000).int().positive(),
});

const createOrderSchema = z.object({
  storeId:         z.string().uuid(),
  customerName:    z.string().min(2),
  customerEmail:   z.string().email(),
  customerPhone:   z.string().optional(),
  shippingAddress: z.object({
    address:    z.string().optional(),  // frontend field
    line1:      z.string().optional(),  // alias
    line2:      z.string().optional(),
    city:       z.string(),
    state:      z.string().optional(),
    postalCode: z.string().optional(),
    zip:        z.string().optional(),
    country:    z.string(),
  }).optional(),
  shippingCost:   z.number().optional(),
  taxAmount:      z.number().optional(),
  discountAmount: z.number().optional(),
  couponCode:     z.string().optional(),
  shippingMethod: z.string().optional(),
  billingAddress: z.object({
    line1:   z.string(),
    city:    z.string(),
    country: z.string(),
  }).optional(),
  items:  z.array(orderItemSchema).min(1),
  notes:  z.string().optional(),
  coupon:     z.string().optional(),  // legacy alias
});

// Create order (public checkout)
export const createOrder = async (req: Request, res: Response) => {
  const raw  = { ...req.body, couponCode: req.body.couponCode || req.body.coupon };
  const data = createOrderSchema.parse(raw);

  const store = await prisma.store.findUnique({ where: { id: data.storeId, status: "ACTIVE" } });
  if (!store) throw new AppError("Store not found or inactive", 404);

  // Validate products and calculate totals
  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of data.items) {
    const product = await prisma.product.findFirst({
      where: { id: item.productId, storeId: data.storeId, status: "ACTIVE" },
    });
    if (!product) throw new AppError(`Product ${item.productId} not found`, 404);

    // Check inventory
    if (product.trackInventory && !product.allowBackorder) {
      if (product.inventory < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }
    }

    const price = product.price;
    const total = price * item.quantity;
    subtotal += total;

    orderItems.push({
      productId: product.id,
      variantId: item.variantId,
      name:      product.name,
      sku:       product.sku,
      price,
      quantity:  item.quantity,
      total,
      image:     product.images[0],
    });
  }

  const taxAmount      = subtotal * ((store.taxRate || 0) / 100);
  // Use frontend-provided shipping cost; override to 0 if store's free-shipping threshold is met
  const rawShipping    = typeof data.shippingCost === 'number' ? data.shippingCost : 0;
  const shippingCost   = (store.freeShippingMin && subtotal >= store.freeShippingMin) ? 0 : rawShipping;
  const total          = subtotal + taxAmount + shippingCost;
  const orderNumber    = generateOrderNumber();

  // Upsert store customer
  let customer = await prisma.storeCustomer.findUnique({
    where: { storeId_email: { storeId: data.storeId, email: data.customerEmail } },
  });
  if (!customer) {
    customer = await prisma.storeCustomer.create({
      data: {
        storeId: data.storeId,
        email:   data.customerEmail,
        name:    data.customerName,
        phone:   data.customerPhone,
      },
    });
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      storeId:         data.storeId,
      customerId:      customer.id,
      customerEmail:   data.customerEmail,
      customerName:    data.customerName,
      customerPhone:   data.customerPhone,
      shippingAddress: data.shippingAddress as any,
      billingAddress:  data.billingAddress  as any,
      notes:           data.notes,
      subtotal,
      taxAmount,
      shippingCost,
      total,
      currency: store.currency,
      status:   "PENDING",
      items:    { create: orderItems },
    },
    include: { items: true },
  });

  // Decrement inventory
  for (const item of data.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data:  { inventory: { decrement: item.quantity } },
    });
  }

  // Send order confirmation to customer (email + optional SMS)
  emailService.sendOrderConfirmation({
    email:      order.customerEmail,
    name:       order.customerName,
    orderNumber: order.orderNumber,
    total:      order.total,
    currency:   order.currency,
    storeName:  store.name,
    storeEmail: store.supportEmail || undefined,
    items:      order.items.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price })),
  });

  notificationService.notifyCustomerOrderConfirmed({
    customerPhone: order.customerPhone,
    smsEnabled:    store.notifyCustomerSms ?? false,
    storeName:     store.name,
    orderNumber:   order.orderNumber,
    total:         order.total,
    currency:      order.currency,
    storeSlug:     store.slug,
  });

  // Send new order alert to store owner (email + optional SMS/WhatsApp)
  // Also fire Web Push notification
  pushToStoreOwner(order.storeId, PushTemplates.newOrder(
    order.orderNumber,
    `${order.currency} ${order.total.toFixed(2)}`
  )).catch(() => {/* non-fatal */});
  const owner = await prisma.user.findUnique({ where: { id: store.ownerId }, select: { email: true, name: true, phone: true } });
  if (owner) {
    emailService.sendNewOrderAlert({
      ownerEmail:   owner.email,
      ownerName:    owner.name,
      orderNumber:  order.orderNumber,
      customerName: order.customerName,
      total:        order.total,
      currency:     order.currency,
      storeName:    store.name,
      itemCount:    order.items.length,
    });

    notificationService.notifyOwnerNewOrder({
      ownerPhone:   store.smsPhone   || owner.phone || null,
      ownerWA:      store.whatsappPhone || null,
      smsEnabled:   store.smsEnabled     && store.notifyOwnerSms,
      waEnabled:    store.whatsappEnabled && store.notifyOwnerSms,
      storeName:    store.name,
      orderNumber:  order.orderNumber,
      customerName: order.customerName,
      total:        order.total,
      currency:     order.currency,
      itemCount:    order.items.length,
      storeSlug:    store.slug,
    });
  }

  return res.status(201).json({ success: true, message: "Order created", data: order });
};

// Get orders for a store
export const getOrders = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const { page = 1, limit = 20, status, search } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));

  const where: any = { storeId };
  if (status) where.status = status;
  if (search) where.OR = [
    { orderNumber: { contains: search as string, mode: "insensitive" } },
    { customerEmail: { contains: search as string, mode: "insensitive" } },
    { customerName:  { contains: search as string, mode: "insensitive" } },
  ];

  const [orders, total] = await Promise.all([
    await prisma.order.findMany({
      where, take, skip,
      include: { items: true, payment: { select: { gateway: true, status: true } } },
      orderBy: { createdAt: "desc" },
    }),
    await prisma.order.count({ where }),
  ]);

  return res.json({
    success: true,
    data: orders,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

// Get single order
export const getOrder = async (req: AuthRequest, res: Response) => {
  const { storeId, orderId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId },
    include: { items: { include: { product: { select: { name: true, images: true } } } }, payment: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  return res.json({ success: true, data: order });
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { storeId, orderId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const { status, trackingNumber, trackingUrl, cancelReason } = z.object({
    status:         z.enum(["PENDING","PROCESSING","SHIPPED","DELIVERED","COMPLETED","CANCELLED"]),
    trackingNumber: z.string().optional(),
    trackingUrl:    z.string().optional(),
    cancelReason:   z.string().optional(),
  }).parse(req.body);

  const order = await prisma.order.findFirst({ where: { id: orderId, storeId } });
  if (!order) throw new AppError("Order not found", 404);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data:  { status, trackingNumber, trackingUrl, cancelReason },
  });

  // Email + SMS notification to customer
  await emailService.sendOrderStatusUpdate(
    order.customerEmail,
    order.customerName,
    order.orderNumber,
    status,
    trackingNumber
  );

  const statusStore = await prisma.store.findUnique({
    where: { id: updated.storeId },
    select: { notifyCustomerSms: true, slug: true, name: true },
  });
  if (statusStore) {
    notificationService.notifyCustomerStatusUpdate({
      customerPhone:  order.customerPhone || null,
      smsEnabled:     statusStore.notifyCustomerSms ?? false,
      storeName:      statusStore.name,
      orderNumber:    order.orderNumber,
      status,
      trackingNumber: trackingNumber || null,
      storeSlug:      statusStore.slug,
    });
  }

  // Auto-fulfillment: when order moves to PROCESSING, forward to suppliers
  if (status === "PROCESSING") {
    try {
      const orderWithItems = await prisma.order.findUnique({
        where:   { id: orderId },
        include: { items: { include: { product: { include: { supplierProducts: { include: { supplier: true } } } } } } },
      });
      const storeData = await prisma.store.findUnique({ where: { id: storeId }, select: { name: true } });

      if (orderWithItems) {
        // Group by supplier and auto-fulfill if enabled
        const bySupplier = new Map<string, { supplier: any; items: typeof orderWithItems.items }>();
        for (const item of orderWithItems.items) {
          const link = item.product.supplierProducts?.[0];
          if (!link?.supplier?.autoFulfill) continue;
          const sup = link.supplier;
          if (!bySupplier.has(sup.id)) bySupplier.set(sup.id, { supplier: sup, items: [] });
          bySupplier.get(sup.id)!.items.push(item);
        }

        for (const [, { supplier, items }] of bySupplier) {
          const payload: FulfillmentPayload = {
            orderNumber:     updated.orderNumber,
            orderId:         updated.id,
            customerName:    updated.customerName,
            customerEmail:   updated.customerEmail,
            customerPhone:   updated.customerPhone ?? null,
            shippingAddress: updated.shippingAddress,
            storeName:       storeData?.name ?? storeId,
            storeId,
            total:           updated.total,
            currency:        updated.currency,
            notes:           updated.notes ?? null,
            items: items.map(i => ({
              name:        i.name,
              sku:         i.sku ?? null,
              quantity:    i.quantity,
              price:       i.price,
              supplierSku: i.product.supplierProducts?.[0]?.supplierSku ?? null,
              supplierUrl: i.product.supplierProducts?.[0]?.supplierUrl ?? null,
            })),
          };

          let method = "MANUAL";
          let success = false;
          if (supplier.webhookUrl) {
            method = "WEBHOOK";
            success = await supplierService.fulfillOrderByWebhook(supplier.webhookUrl, payload);
          } else if (supplier.fulfillEmail) {
            method = "EMAIL";
            success = await supplierService.fulfillOrderByEmail(supplier.fulfillEmail, supplier.name, payload);
          } else {
            method = "MANUAL"; success = true;
          }

          await prisma.fulfillmentOrder.create({
            data: {
              orderId:    updated.id,
              supplierId: supplier.id,
              storeId,
              status:     success ? "SENT" : "FAILED",
              sentAt:     success ? new Date() : undefined,
              method,
              payload:    payload as any,
            },
          });
        }
      }
    } catch (err: any) {
      // Non-blocking — never fail the status update because of fulfillment
      logger.warn(`[AutoFulfill] Error: ${err.message}`);
    }
  }

  return res.json({ success: true, message: "Order status updated", data: updated });
};

// Get single order by order number (for customer tracking)
export const trackOrder = async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status:      true,
      total:       true,
      currency:    true,
      trackingNumber: true,
      trackingUrl: true,
      createdAt:   true,
      items: {
        select: { name: true, quantity: true, price: true, image: true },
      },
    },
  });
  if (!order) throw new AppError("Order not found", 404);
  return res.json({ success: true, data: order });
};
