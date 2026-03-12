// prisma/seed.ts
import { PrismaClient, Role, UserStatus, PlanType, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Platform settings
  await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    update: {},
    create: {
      id:                 "singleton",
      platformFeePercent: 10,
      starterPrice:       9,
      proPrice:           29,
      advancedPrice:      79,
      maintenanceMode:    false,
      allowRegistration:  true,
    },
  });

  // ── Super Admin ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where:  { email: "admin@dropos.io" },
    update: {
      password:      adminPassword,
      status:        UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email:         "admin@dropos.io",
      password:      adminPassword,
      name:          "Super Admin",
      role:          Role.SUPER_ADMIN,
      status:        UserStatus.ACTIVE,
      emailVerified: true,
    },
  });
  console.log(`✅ Admin:  ${admin.email}  /  Admin123!`);

  // ── Store Owner ──────────────────────────────────────────────────────────────
  const ownerPassword = await bcrypt.hash("Owner123!", 12);
  const owner = await prisma.user.upsert({
    where:  { email: "owner@dropos.io" },
    update: {
      password:      ownerPassword,
      status:        UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email:         "owner@dropos.io",
      password:      ownerPassword,
      name:          "Demo Owner",
      phone:         "+234 801 234 5678",
      role:          Role.STORE_OWNER,
      status:        UserStatus.ACTIVE,
      emailVerified: true,
      country:       "Nigeria",
      city:          "Lagos",
    },
  });
  console.log(`✅ Owner:  ${owner.email}  /  Owner123!`);

  // Subscription for owner
  const now     = new Date();
  const yearEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  await prisma.subscription.upsert({
    where:  { userId: owner.id },
    update: {},
    create: {
      userId:             owner.id,
      plan:               PlanType.ADVANCED,
      status:             SubscriptionStatus.ACTIVE,
      price:              79,
      currency:           "USD",
      currentPeriodStart: now,
      currentPeriodEnd:   yearEnd,
    },
  });

  // ── Demo Store ───────────────────────────────────────────────────────────────
  const store = await prisma.store.upsert({
    where:  { slug: "demo-store" },
    update: {},
    create: {
      ownerId:      owner.id,
      name:         "Demo Store",
      slug:         "demo-store",
      description:  "Your demo dropshipping store powered by DropOS",
      domain:       "demo-store.dropos.io",
      status:       "ACTIVE",
      currency:     "USD",
      country:      "Nigeria",
      supportEmail: "support@demo-store.com",
      primaryColor: "#7c3aed",
    },
  });
  console.log(`✅ Store:  /store/demo-store`);

  // ── Demo Products ────────────────────────────────────────────────────────────
  const products = [
    { name: "Wireless Earbuds Pro",  price: 89.99,  comparePrice: 129.99, inventory: 234, sku: "WEP-001", category: "Electronics"  },
    { name: "Minimalist Watch",       price: 149.99, comparePrice: 199.99, inventory: 56,  sku: "MW-042",  category: "Accessories"  },
    { name: "Smart Water Bottle",     price: 34.99,  comparePrice: 49.99,  inventory: 0,   sku: "SWB-018", category: "Lifestyle"    },
    { name: "Laptop Stand Aluminum",  price: 59.99,  comparePrice: 79.99,  inventory: 112, sku: "LSA-007", category: "Electronics"  },
    { name: "Phone Grip Ring",        price: 12.99,  comparePrice: 0,      inventory: 450, sku: "PGR-033", category: "Accessories"  },
    { name: "LED Desk Lamp",          price: 45.99,  comparePrice: 69.99,  inventory: 78,  sku: "LDL-011", category: "Home & Office" },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await prisma.product.upsert({
      where:  { storeId_slug: { storeId: store.id, slug } },
      update: {},
      create: {
        storeId:      store.id,
        name:         p.name,
        slug,
        price:        p.price,
        comparePrice: p.comparePrice || undefined,
        inventory:    p.inventory,
        sku:          p.sku,
        category:     p.category,
        status:       p.inventory > 0 ? "ACTIVE" : "OUT_OF_STOCK",
        description:  `High-quality ${p.name} for everyday use.`,
      },
    });
  }
  console.log(`✅ Products: ${products.length} demo products added`);

  console.log("");
  console.log("🎉 Done! Start the servers and go to http://localhost:3000");
  console.log("─────────────────────────────────────────────────────────");
  console.log("  Admin:  admin@dropos.io   /  Admin123!");
  console.log("  Owner:  owner@dropos.io   /  Owner123!");
  console.log("  Store:  http://localhost:3000/store/demo-store");
  console.log("─────────────────────────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
