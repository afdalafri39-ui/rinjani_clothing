const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'db_backup_full.json');
const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val))) {
    return `'${val.replace(/'/g, "''")}'::timestamptz`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

let sql = `-- ====================================================================
-- RINJANI CLOTHING - SUPABASE POSTGRESQL SCHEMA & DATA MIGRATION
-- Generated automatically from existing SQLite dev.db
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE TABLES

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT,
    "material" TEXT,
    "weight" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CustomOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "garmentModel" TEXT NOT NULL,
    "garmentCategory" TEXT,
    "color" TEXT NOT NULL,
    "colorHex" TEXT,
    "fabric" TEXT NOT NULL,
    "fabricWeight" TEXT,
    "printingMethod" TEXT NOT NULL,
    "sizes" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "designFiles" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CustomOrder_orderNumber_key" ON "CustomOrder"("orderNumber");

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brandName" TEXT NOT NULL DEFAULT 'Rinjani Clothing',
    "whatsappNumber" TEXT,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramUsername" TEXT,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "instagramUrl" TEXT,
    "email" TEXT,
    "address" TEXT,
    "orderMessageTemplate" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "customOrdersSheetWebhook" TEXT,
    "productOrdersSheetWebhook" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "productName" TEXT NOT NULL,
    "productSlug" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "size" TEXT,
    "color" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductOrder_orderNumber_key" ON "ProductOrder"("orderNumber");

CREATE TABLE IF NOT EXISTS "CustomGarment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'T-Shirt',
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minOrder" INTEGER NOT NULL DEFAULT 12,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomGarment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CustomGarment_slug_key" ON "CustomGarment"("slug");

-- 3. INSERT DUMMY & EXISTING DATA
`;

// Users
if (data.users && data.users.length > 0) {
  sql += `\n-- DATA: User (${data.users.length} rows)\n`;
  data.users.forEach(u => {
    sql += `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")\n`;
    sql += `VALUES (${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, ${escapeSql(u.passwordHash)}, ${escapeSql(u.role)}, ${escapeSql(u.createdAt)}, ${escapeSql(u.updatedAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// SiteSettings
if (data.siteSettings && data.siteSettings.length > 0) {
  sql += `\n-- DATA: SiteSettings (${data.siteSettings.length} rows)\n`;
  data.siteSettings.forEach(s => {
    sql += `INSERT INTO "SiteSettings" ("id", "brandName", "whatsappNumber", "whatsappEnabled", "telegramUsername", "telegramEnabled", "instagramUrl", "email", "address", "orderMessageTemplate", "currency", "customOrdersSheetWebhook", "productOrdersSheetWebhook", "updatedAt")\n`;
    sql += `VALUES (${escapeSql(s.id)}, ${escapeSql(s.brandName)}, ${escapeSql(s.whatsappNumber)}, ${escapeSql(s.whatsappEnabled)}, ${escapeSql(s.telegramUsername)}, ${escapeSql(s.telegramEnabled)}, ${escapeSql(s.instagramUrl)}, ${escapeSql(s.email)}, ${escapeSql(s.address)}, ${escapeSql(s.orderMessageTemplate)}, ${escapeSql(s.currency)}, ${escapeSql(s.customOrdersSheetWebhook)}, ${escapeSql(s.productOrdersSheetWebhook)}, ${escapeSql(s.updatedAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// Categories
if (data.categories && data.categories.length > 0) {
  sql += `\n-- DATA: Category (${data.categories.length} rows)\n`;
  data.categories.forEach(c => {
    sql += `INSERT INTO "Category" ("id", "name", "slug", "description", "image", "displayOrder", "active", "createdAt", "updatedAt")\n`;
    sql += `VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.image)}, ${escapeSql(c.displayOrder)}, ${escapeSql(c.active)}, ${escapeSql(c.createdAt)}, ${escapeSql(c.updatedAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// Products
if (data.products && data.products.length > 0) {
  sql += `\n-- DATA: Product (${data.products.length} rows)\n`;
  data.products.forEach(p => {
    sql += `INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")\n`;
    sql += `VALUES (${escapeSql(p.id)}, ${escapeSql(p.name)}, ${escapeSql(p.slug)}, ${escapeSql(p.description)}, ${escapeSql(p.price)}, ${escapeSql(p.categoryId)}, ${escapeSql(p.material)}, ${escapeSql(p.weight)}, ${escapeSql(p.featured)}, ${escapeSql(p.status)}, ${escapeSql(p.createdAt)}, ${escapeSql(p.updatedAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// ProductImages
if (data.productImages && data.productImages.length > 0) {
  sql += `\n-- DATA: ProductImage (${data.productImages.length} rows)\n`;
  data.productImages.forEach(pi => {
    sql += `INSERT INTO "ProductImage" ("id", "productId", "url", "alt", "sortOrder", "createdAt")\n`;
    sql += `VALUES (${escapeSql(pi.id)}, ${escapeSql(pi.productId)}, ${escapeSql(pi.url)}, ${escapeSql(pi.alt)}, ${escapeSql(pi.sortOrder)}, ${escapeSql(pi.createdAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// ProductVariants
if (data.productVariants && data.productVariants.length > 0) {
  sql += `\n-- DATA: ProductVariant (${data.productVariants.length} rows)\n`;
  data.productVariants.forEach(pv => {
    sql += `INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")\n`;
    sql += `VALUES (${escapeSql(pv.id)}, ${escapeSql(pv.productId)}, ${escapeSql(pv.size)}, ${escapeSql(pv.color)}, ${escapeSql(pv.stock)}, ${escapeSql(pv.sku)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// CustomOrders
if (data.customOrders && data.customOrders.length > 0) {
  sql += `\n-- DATA: CustomOrder (${data.customOrders.length} rows)\n`;
  data.customOrders.forEach(co => {
    sql += `INSERT INTO "CustomOrder" ("id", "orderNumber", "customerName", "customerPhone", "customerEmail", "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight", "printingMethod", "sizes", "totalQuantity", "notes", "designFiles", "status", "adminNotes", "createdAt", "updatedAt")\n`;
    sql += `VALUES (${escapeSql(co.id)}, ${escapeSql(co.orderNumber)}, ${escapeSql(co.customerName)}, ${escapeSql(co.customerPhone)}, ${escapeSql(co.customerEmail)}, ${escapeSql(co.garmentModel)}, ${escapeSql(co.garmentCategory)}, ${escapeSql(co.color)}, ${escapeSql(co.colorHex)}, ${escapeSql(co.fabric)}, ${escapeSql(co.fabricWeight)}, ${escapeSql(co.printingMethod)}, ${escapeSql(co.sizes)}, ${escapeSql(co.totalQuantity)}, ${escapeSql(co.notes)}, ${escapeSql(co.designFiles)}, ${escapeSql(co.status)}, ${escapeSql(co.adminNotes)}, ${escapeSql(co.createdAt)}, ${escapeSql(co.updatedAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// ProductOrders
if (data.productOrders && data.productOrders.length > 0) {
  sql += `\n-- DATA: ProductOrder (${data.productOrders.length} rows)\n`;
  data.productOrders.forEach(po => {
    sql += `INSERT INTO "ProductOrder" ("id", "orderNumber", "customerName", "customerPhone", "customerEmail", "productName", "productSlug", "price", "quantity", "size", "color", "totalPrice", "notes", "status", "adminNotes", "createdAt", "updatedAt")\n`;
    sql += `VALUES (${escapeSql(po.id)}, ${escapeSql(po.orderNumber)}, ${escapeSql(po.customerName)}, ${escapeSql(po.customerPhone)}, ${escapeSql(po.customerEmail)}, ${escapeSql(po.productName)}, ${escapeSql(po.productSlug)}, ${escapeSql(po.price)}, ${escapeSql(po.quantity)}, ${escapeSql(po.size)}, ${escapeSql(po.color)}, ${escapeSql(po.totalPrice)}, ${escapeSql(po.notes)}, ${escapeSql(po.status)}, ${escapeSql(po.adminNotes)}, ${escapeSql(po.createdAt)}, ${escapeSql(po.updatedAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// CustomGarments
if (data.customGarments && data.customGarments.length > 0) {
  sql += `\n-- DATA: CustomGarment (${data.customGarments.length} rows)\n`;
  data.customGarments.forEach(cg => {
    sql += `INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")\n`;
    sql += `VALUES (${escapeSql(cg.id)}, ${escapeSql(cg.name)}, ${escapeSql(cg.slug)}, ${escapeSql(cg.category)}, ${escapeSql(cg.description)}, ${escapeSql(cg.price)}, ${escapeSql(cg.minOrder)}, ${escapeSql(cg.active)}, ${escapeSql(cg.sortOrder)}, ${escapeSql(cg.images)}, ${escapeSql(cg.createdAt)}, ${escapeSql(cg.updatedAt)})\n`;
    sql += `ON CONFLICT ("id") DO NOTHING;\n`;
  });
}

// 4. ROW LEVEL SECURITY (RLS) & POLICIES
sql += `\n-- 4. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomGarment" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all Category" ON "Category";
  CREATE POLICY "Allow all Category" ON "Category" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all Product" ON "Product";
  CREATE POLICY "Allow all Product" ON "Product" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all ProductImage" ON "ProductImage";
  CREATE POLICY "Allow all ProductImage" ON "ProductImage" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all ProductVariant" ON "ProductVariant";
  CREATE POLICY "Allow all ProductVariant" ON "ProductVariant" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all CustomGarment" ON "CustomGarment";
  CREATE POLICY "Allow all CustomGarment" ON "CustomGarment" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all CustomOrder" ON "CustomOrder";
  CREATE POLICY "Allow all CustomOrder" ON "CustomOrder" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all ProductOrder" ON "ProductOrder";
  CREATE POLICY "Allow all ProductOrder" ON "ProductOrder" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all SiteSettings" ON "SiteSettings";
  CREATE POLICY "Allow all SiteSettings" ON "SiteSettings" FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all User" ON "User";
  CREATE POLICY "Allow all User" ON "User" FOR ALL USING (true) WITH CHECK (true);
END $$;
`;

const outSqlPath = path.join(__dirname, 'supabase_migration_and_data.sql');
fs.writeFileSync(outSqlPath, sql, 'utf8');
console.log('Generated SQL file at:', outSqlPath, 'Size:', (fs.statSync(outSqlPath).size / 1024).toFixed(2), 'KB');
