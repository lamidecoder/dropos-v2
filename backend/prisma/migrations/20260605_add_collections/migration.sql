CREATE TABLE IF NOT EXISTS "Collection" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "storeId"     TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "emoji"       TEXT DEFAULT '📦',
  "productIds"  TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "Collection_storeId_idx" ON "Collection"("storeId");
