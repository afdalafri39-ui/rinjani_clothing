-- ====================================================================
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

-- DATA: User (1 rows)
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")
VALUES ('cmumu1sdy0000sxkst1cs7ni1', 'Admin Rinjani', 'admin@rinjani.com', '$2b$12$mceJmuN8w.87ZUe8ADm9ZOGNElGgx/UbxbBTcZn6x60nEvKOBdnv6', 'ADMIN', '2026-09-29T15:30:07.990Z'::timestamptz, '2026-09-29T15:30:07.990Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;

-- DATA: SiteSettings (1 rows)
INSERT INTO "SiteSettings" ("id", "brandName", "whatsappNumber", "whatsappEnabled", "telegramUsername", "telegramEnabled", "instagramUrl", "email", "address", "orderMessageTemplate", "currency", "customOrdersSheetWebhook", "productOrdersSheetWebhook", "updatedAt")
VALUES ('default', 'Rinjani Clothing', '6281369876282', TRUE, 'rinjaniclothing', FALSE, 'http://instagram.com/rinjani.clothing', 'hello@rinjaniclothing.com', 'Lombok, Nusa Tenggara Barat, Indonesia', 'Halo Rinjani Clothing,

Saya ingin memesan:

Produk: {{product_name}}
Ukuran: {{size}}
Warna: {{color}}
Jumlah: {{quantity}}

Link produk:
{{product_url}}', 'IDR', NULL, NULL, '2026-10-04T17:46:26.055Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;

-- DATA: Category (5 rows)
INSERT INTO "Category" ("id", "name", "slug", "description", "image", "displayOrder", "active", "createdAt", "updatedAt")
VALUES ('cmumu1se70001sxksgzukbcdn', 'T-Shirts', 't-shirts', 'Kaos harian dengan kualitas premium', NULL, 1, TRUE, '2026-09-29T15:30:07.999Z'::timestamptz, '2026-09-29T15:30:07.999Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Category" ("id", "name", "slug", "description", "image", "displayOrder", "active", "createdAt", "updatedAt")
VALUES ('cmumu1sea0002sxksweprx2w1', 'Oversize', 'oversize', 'Koleksi oversize untuk gaya santai', NULL, 2, TRUE, '2026-09-29T15:30:08.002Z'::timestamptz, '2026-09-29T15:30:08.002Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Category" ("id", "name", "slug", "description", "image", "displayOrder", "active", "createdAt", "updatedAt")
VALUES ('cmumu1sed0003sxksdrccy4r0', 'Long Sleeve', 'long-sleeve', 'Kaos lengan panjang untuk segala suasana', NULL, 3, TRUE, '2026-09-29T15:30:08.005Z'::timestamptz, '2026-09-29T15:30:08.005Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Category" ("id", "name", "slug", "description", "image", "displayOrder", "active", "createdAt", "updatedAt")
VALUES ('cmumu1seg0004sxksnewcrp66', 'Hoodies', 'hoodies', 'Hoodie nyaman untuk cuaca sejuk', NULL, 4, TRUE, '2026-09-29T15:30:08.008Z'::timestamptz, '2026-09-29T15:30:08.008Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Category" ("id", "name", "slug", "description", "image", "displayOrder", "active", "createdAt", "updatedAt")
VALUES ('cmv6kzorh0005sxh8gno6fdtu', 'Accessories', 'accessories', 'Aksesoris pelengkap gaya', NULL, 5, TRUE, '2026-10-13T11:11:56.958Z'::timestamptz, '2026-10-13T11:11:56.958Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;

-- DATA: Product (8 rows)
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6iqnk10004sxysh7847xld', 'Dummy', 'dummy', '', 149000, NULL, 'Cotton Combed 30s', '180g', FALSE, 'ACTIVE', '2026-10-13T10:08:56.256Z'::timestamptz, '2026-10-13T11:12:27.842Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6kzorl0007sxh86sh5t2x1', 'Rinjani Mountain Tee', 'rinjani-mountain-tee', 'Kaos dengan desain terinspirasi dari Gunung Rinjani. Bahan cotton combed 30s yang nyaman dan breathable untuk aktivitas sehari-hari.', 125000, 'cmumu1se70001sxksgzukbcdn', 'Cotton Combed 30s', '180g', TRUE, 'ACTIVE', '2026-10-13T11:11:56.962Z'::timestamptz, '2026-10-13T11:11:56.962Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6kzos2000psxh8v4oidqj0', 'Summit Oversize Tee', 'summit-oversize-tee', 'Oversize tee dengan cutting relaxed fit. Desain minimalis dengan detail branding Rinjani Clothing di bagian dada.', 145000, 'cmumu1sea0002sxksweprx2w1', 'Cotton Combed 24s', '220g', TRUE, 'ACTIVE', '2026-10-13T11:11:56.978Z'::timestamptz, '2026-10-13T11:11:56.978Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6kzoso001fsxh85quseq79', 'Trail Long Sleeve', 'trail-long-sleeve', 'Kaos lengan panjang untuk petualangan outdoor. Bahan yang cepat kering dan nyaman di segala cuaca.', 165000, 'cmumu1sed0003sxksdrccy4r0', 'Cotton Bamboo Blend', '200g', FALSE, 'ACTIVE', '2026-10-13T11:11:57.001Z'::timestamptz, '2026-10-13T11:11:57.001Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6kzotb0025sxh8kzbw42og', 'Basecamp Hoodie', 'basecamp-hoodie', 'Hoodie tebal dan hangat untuk cuaca dingin. Dilengkapi kangaroo pocket dan adjustable hood. Cocok untuk camping atau hang out.', 275000, 'cmumu1seg0004sxksnewcrp66', 'Fleece Cotton', '450g', TRUE, 'ACTIVE', '2026-10-13T11:11:57.024Z'::timestamptz, '2026-10-13T11:11:57.024Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6kzoto002jsxh80u82fhvg', 'Urban Graphic Tee', 'urban-graphic-tee', 'Kaos dengan artwork eksklusif bertema urban culture. Printing menggunakan teknik DTF berkualitas tinggi yang tahan lama.', 135000, 'cmumu1se70001sxksgzukbcdn', 'Cotton Combed 30s', '180g', FALSE, 'ACTIVE', '2026-10-13T11:11:57.036Z'::timestamptz, '2026-10-13T11:11:57.036Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6kzou40031sxh8q8naw1zb', 'Wilderness Oversize', 'wilderness-oversize', 'Oversize tee koleksi Wilderness. Desain back print yang bold dengan tema alam dan pegunungan.', 155000, 'cmumu1sea0002sxksweprx2w1', 'Cotton Combed 24s', '230g', TRUE, 'ACTIVE', '2026-10-13T11:11:57.052Z'::timestamptz, '2026-10-13T11:11:57.052Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "categoryId", "material", "weight", "featured", "status", "createdAt", "updatedAt")
VALUES ('cmv6kzouu003rsxh8s73buggo', 'Ridge Cap', 'ridge-cap', 'Topi five-panel dengan bordir logo Rinjani Clothing. Adjustable strap untuk kenyamanan.', 89000, 'cmv6kzorh0005sxh8gno6fdtu', 'Canvas Cotton', '80g', FALSE, 'ACTIVE', '2026-10-13T11:11:57.079Z'::timestamptz, '2026-10-13T11:11:57.079Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;

-- DATA: ProductImage (1 rows)
INSERT INTO "ProductImage" ("id", "productId", "url", "alt", "sortOrder", "createdAt")
VALUES ('cmv6iqnk10005sxys2zo3fyg7', 'cmv6iqnk10004sxysh7847xld', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', 'Dummy', 0, '2026-10-13T10:08:56.256Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;

-- DATA: ProductVariant (65 rows)
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6iqnk10006sxysoizd0ym8', 'cmv6iqnk10004sxysh7847xld', 'S', 'Black', 10, 'dummy-s-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6iqnk10007sxyss1wlw8f3', 'cmv6iqnk10004sxysh7847xld', 'M', 'Black', 15, 'dummy-m-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6iqnk10008sxys5qglmy28', 'cmv6iqnk10004sxysh7847xld', 'L', 'Black', 12, 'dummy-l-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6iqnk10009sxys1xyi1adu', 'cmv6iqnk10004sxysh7847xld', 'XL', 'Black', 8, 'dummy-xl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoro0009sxh8nawh6iqp', 'cmv6kzorl0007sxh86sh5t2x1', 'S', 'Black', 3, 'rinjani-mountain-tee-s-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzorp000bsxh8rviv51n7', 'cmv6kzorl0007sxh86sh5t2x1', 'S', 'White', 6, 'rinjani-mountain-tee-s-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzorr000dsxh8emxpi0pz', 'cmv6kzorl0007sxh86sh5t2x1', 'M', 'Black', 15, 'rinjani-mountain-tee-m-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzort000fsxh87rw8iyte', 'cmv6kzorl0007sxh86sh5t2x1', 'M', 'White', 6, 'rinjani-mountain-tee-m-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoru000hsxh89nlxzpmf', 'cmv6kzorl0007sxh86sh5t2x1', 'L', 'Black', 5, 'rinjani-mountain-tee-l-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzorw000jsxh8xugbzpy5', 'cmv6kzorl0007sxh86sh5t2x1', 'L', 'White', 4, 'rinjani-mountain-tee-l-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzory000lsxh860nl3onv', 'cmv6kzorl0007sxh86sh5t2x1', 'XL', 'Black', 12, 'rinjani-mountain-tee-xl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzos0000nsxh8mwitkbo4', 'cmv6kzorl0007sxh86sh5t2x1', 'XL', 'White', 10, 'rinjani-mountain-tee-xl-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzos4000rsxh8743fb26h', 'cmv6kzos2000psxh8v4oidqj0', 'M', 'Black', 6, 'summit-oversize-tee-m-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzos5000tsxh8oxr02jp2', 'cmv6kzos2000psxh8v4oidqj0', 'M', 'Cream', 9, 'summit-oversize-tee-m-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzos7000vsxh8cqcz0yf9', 'cmv6kzos2000psxh8v4oidqj0', 'M', 'Navy', 6, 'summit-oversize-tee-m-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzos8000xsxh8h5b4v4ux', 'cmv6kzos2000psxh8v4oidqj0', 'L', 'Black', 11, 'summit-oversize-tee-l-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosa000zsxh8s2tjpjgy', 'cmv6kzos2000psxh8v4oidqj0', 'L', 'Cream', 11, 'summit-oversize-tee-l-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosb0011sxh87tzow4uy', 'cmv6kzos2000psxh8v4oidqj0', 'L', 'Navy', 11, 'summit-oversize-tee-l-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosd0013sxh8hz1g3exx', 'cmv6kzos2000psxh8v4oidqj0', 'XL', 'Black', 10, 'summit-oversize-tee-xl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosf0015sxh88hfnnhxw', 'cmv6kzos2000psxh8v4oidqj0', 'XL', 'Cream', 9, 'summit-oversize-tee-xl-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosh0017sxh8e6gr7752', 'cmv6kzos2000psxh8v4oidqj0', 'XL', 'Navy', 9, 'summit-oversize-tee-xl-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosj0019sxh814q2pobb', 'cmv6kzos2000psxh8v4oidqj0', 'XXL', 'Black', 6, 'summit-oversize-tee-xxl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosk001bsxh819tyq0if', 'cmv6kzos2000psxh8v4oidqj0', 'XXL', 'Cream', 14, 'summit-oversize-tee-xxl-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosm001dsxh8cuw1ta06', 'cmv6kzos2000psxh8v4oidqj0', 'XXL', 'Navy', 8, 'summit-oversize-tee-xxl-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosq001hsxh8dtmkuy5x', 'cmv6kzoso001fsxh85quseq79', 'S', 'Black', 2, 'trail-long-sleeve-s-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoss001jsxh81clm69x2', 'cmv6kzoso001fsxh85quseq79', 'S', 'White', 10, 'trail-long-sleeve-s-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzost001lsxh8i8jrtb2v', 'cmv6kzoso001fsxh85quseq79', 'S', 'Brown', 12, 'trail-long-sleeve-s-brown')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosv001nsxh8q5idof9d', 'cmv6kzoso001fsxh85quseq79', 'M', 'Black', 1, 'trail-long-sleeve-m-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosx001psxh8xjupdf4b', 'cmv6kzoso001fsxh85quseq79', 'M', 'White', 9, 'trail-long-sleeve-m-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzosy001rsxh8xniapcij', 'cmv6kzoso001fsxh85quseq79', 'M', 'Brown', 5, 'trail-long-sleeve-m-brown')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzot0001tsxh8xjjylk5z', 'cmv6kzoso001fsxh85quseq79', 'L', 'Black', 9, 'trail-long-sleeve-l-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzot2001vsxh8aed9tuoz', 'cmv6kzoso001fsxh85quseq79', 'L', 'White', 2, 'trail-long-sleeve-l-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzot4001xsxh8jxtc0vyl', 'cmv6kzoso001fsxh85quseq79', 'L', 'Brown', 5, 'trail-long-sleeve-l-brown')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzot5001zsxh87gfovfkw', 'cmv6kzoso001fsxh85quseq79', 'XL', 'Black', 4, 'trail-long-sleeve-xl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzot70021sxh86i3rcezp', 'cmv6kzoso001fsxh85quseq79', 'XL', 'White', 9, 'trail-long-sleeve-xl-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzot90023sxh82i4coc0p', 'cmv6kzoso001fsxh85quseq79', 'XL', 'Brown', 9, 'trail-long-sleeve-xl-brown')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotd0027sxh8cq9d4ozf', 'cmv6kzotb0025sxh8kzbw42og', 'M', 'Black', 13, 'basecamp-hoodie-m-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotf0029sxh81ofbbgbn', 'cmv6kzotb0025sxh8kzbw42og', 'M', 'Navy', 13, 'basecamp-hoodie-m-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotg002bsxh806oslyrw', 'cmv6kzotb0025sxh8kzbw42og', 'L', 'Black', 7, 'basecamp-hoodie-l-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoti002dsxh8ixfaw5kr', 'cmv6kzotb0025sxh8kzbw42og', 'L', 'Navy', 15, 'basecamp-hoodie-l-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotk002fsxh88c2ij5jh', 'cmv6kzotb0025sxh8kzbw42og', 'XL', 'Black', 7, 'basecamp-hoodie-xl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotl002hsxh8mjyeg2mq', 'cmv6kzotb0025sxh8kzbw42og', 'XL', 'Navy', 10, 'basecamp-hoodie-xl-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotq002lsxh8zh6ra6su', 'cmv6kzoto002jsxh80u82fhvg', 'S', 'Black', 4, 'urban-graphic-tee-s-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzots002nsxh8my912kcd', 'cmv6kzoto002jsxh80u82fhvg', 'S', 'White', 12, 'urban-graphic-tee-s-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotu002psxh8o6qyvuxd', 'cmv6kzoto002jsxh80u82fhvg', 'M', 'Black', 4, 'urban-graphic-tee-m-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotv002rsxh89wimjmuz', 'cmv6kzoto002jsxh80u82fhvg', 'M', 'White', 6, 'urban-graphic-tee-m-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzotx002tsxh8r7t0krll', 'cmv6kzoto002jsxh80u82fhvg', 'L', 'Black', 14, 'urban-graphic-tee-l-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoty002vsxh8jdxgtsh2', 'cmv6kzoto002jsxh80u82fhvg', 'L', 'White', 6, 'urban-graphic-tee-l-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzou0002xsxh8dvqai80g', 'cmv6kzoto002jsxh80u82fhvg', 'XL', 'Black', 11, 'urban-graphic-tee-xl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzou2002zsxh8xvax7gun', 'cmv6kzoto002jsxh80u82fhvg', 'XL', 'White', 2, 'urban-graphic-tee-xl-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzou60033sxh8e9vmlowh', 'cmv6kzou40031sxh8q8naw1zb', 'M', 'Black', 13, 'wilderness-oversize-m-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzou70035sxh826a4clt3', 'cmv6kzou40031sxh8q8naw1zb', 'M', 'White', 2, 'wilderness-oversize-m-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoua0037sxh87ok5mjul', 'cmv6kzou40031sxh8q8naw1zb', 'M', 'Cream', 7, 'wilderness-oversize-m-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzouc0039sxh8u9ye760s', 'cmv6kzou40031sxh8q8naw1zb', 'L', 'Black', 14, 'wilderness-oversize-l-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoud003bsxh89sc4oxva', 'cmv6kzou40031sxh8q8naw1zb', 'L', 'White', 4, 'wilderness-oversize-l-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzouf003dsxh81sfwukaf', 'cmv6kzou40031sxh8q8naw1zb', 'L', 'Cream', 9, 'wilderness-oversize-l-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzouh003fsxh842jnutwv', 'cmv6kzou40031sxh8q8naw1zb', 'XL', 'Black', 10, 'wilderness-oversize-xl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzouj003hsxh8xib1bdns', 'cmv6kzou40031sxh8q8naw1zb', 'XL', 'White', 9, 'wilderness-oversize-xl-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoul003jsxh82v08v8np', 'cmv6kzou40031sxh8q8naw1zb', 'XL', 'Cream', 3, 'wilderness-oversize-xl-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoun003lsxh8eudyr10j', 'cmv6kzou40031sxh8q8naw1zb', 'XXL', 'Black', 2, 'wilderness-oversize-xxl-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzoup003nsxh8bu7kmh0w', 'cmv6kzou40031sxh8q8naw1zb', 'XXL', 'White', 12, 'wilderness-oversize-xxl-white')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzour003psxh83cspc25r', 'cmv6kzou40031sxh8q8naw1zb', 'XXL', 'Cream', 13, 'wilderness-oversize-xxl-cream')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzouw003tsxh8pzjaa04u', 'cmv6kzouu003rsxh8s73buggo', 'One Size', 'Black', 13, 'ridge-cap-one-size-black')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzouy003vsxh8dxeaftrw', 'cmv6kzouu003rsxh8s73buggo', 'One Size', 'Navy', 8, 'ridge-cap-one-size-navy')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ProductVariant" ("id", "productId", "size", "color", "stock", "sku")
VALUES ('cmv6kzouz003xsxh8qr7moxg0', 'cmv6kzouu003rsxh8s73buggo', 'One Size', 'Brown', 7, 'ridge-cap-one-size-brown')
ON CONFLICT ("id") DO NOTHING;

-- DATA: CustomGarment (8 rows)
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodv90000sxrgtjjfhfae', 'T-Shirt Reguler', 't-shirt-reguler', 'T-Shirt', 'Kaos lengan pendek potongan reguler fit, nyaman untuk harian. Bahan cotton combed lembut dan adem.', 55000, 12, TRUE, 1, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"]', '2026-10-13T10:35:10.005Z'::timestamptz, '2026-10-13T10:35:10.005Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodvc0001sxrg3munrbjk', 'T-Shirt Oversize', 't-shirt-oversize', 'T-Shirt', 'Kaos oversize dengan drop shoulder, tampilan streetwear modern. Potongan longgar dan trendi.', 65000, 12, TRUE, 2, '["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"]', '2026-10-13T10:35:10.008Z'::timestamptz, '2026-10-13T10:35:10.008Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodve0002sxrgwbftqi0y', 'Polo Shirt', 'polo-shirt', 'Polo', 'Polo shirt klasik dengan kerah rapi, cocok untuk seragam kantor, event, atau casual semi-formal.', 75000, 12, TRUE, 3, '["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80"]', '2026-10-13T10:35:10.010Z'::timestamptz, '2026-10-13T10:41:28.613Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodvg0003sxrgxuovos55', 'Long Sleeve', 'long-sleeve', 'Long Sleeve', 'Kaos lengan panjang dengan rib manset, cocok untuk cuaca sejuk, outdoor, dan gaya layering.', 65000, 12, TRUE, 4, '["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80"]', '2026-10-13T10:35:10.012Z'::timestamptz, '2026-10-13T10:35:10.012Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodvi0004sxrgs33f82z1', 'Hoodie', 'hoodie', 'Hoodie', 'Hoodie pullover dengan kangaroo pocket dan tali serut, bahan fleece tebal premium yang hangat.', 135000, 12, TRUE, 5, '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"]', '2026-10-13T10:35:10.015Z'::timestamptz, '2026-10-13T10:35:10.015Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodvk0005sxrgue1vaxix', 'Jersey Sport', 'jersey-sport', 'Jersey', 'Jersey olahraga bahan Dri-Fit mikro, ultra ringan, cepat kering, dan sangat breathable.', 70000, 12, TRUE, 6, '["https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=800&q=80"]', '2026-10-13T10:35:10.017Z'::timestamptz, '2026-10-13T10:35:10.017Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodvm0006sxrg5hjrgjnr', 'Raglan', 'raglan', 'Raglan', 'Kaos raglan 3/4 sleeves kombinasi dua warna, gaya vintage baseball autentik.', 65000, 12, TRUE, 7, '["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80"]', '2026-10-13T10:35:10.018Z'::timestamptz, '2026-10-13T10:35:10.018Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CustomGarment" ("id", "name", "slug", "category", "description", "price", "minOrder", "active", "sortOrder", "images", "createdAt", "updatedAt")
VALUES ('cmv6jodvo0007sxrgu0in3dqd', 'Tank Top', 'tank-top', 'Tank Top', 'Tank top sleeveless potongan ergonomis, cocok untuk olahraga, gym, dan cuaca tropis.', 50000, 12, TRUE, 8, '["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80"]', '2026-10-13T10:35:10.021Z'::timestamptz, '2026-10-13T10:35:10.021Z'::timestamptz)
ON CONFLICT ("id") DO NOTHING;

-- 4. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
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
