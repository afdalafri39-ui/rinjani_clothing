// Script to populate/seed data from db_backup_full.json into the target PostgreSQL database via Prisma
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const backupPath = path.join(__dirname, 'db_backup_full.json');

async function restore() {
  if (!fs.existsSync(backupPath)) {
    console.error('Backup file not found at:', backupPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log('Restoring data to connected database...');

  // 1. Users
  for (const u of data.users || []) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
    });
  }
  console.log('Restored users:', data.users?.length || 0);

  // 2. SiteSettings
  for (const s of data.siteSettings || []) {
    await prisma.siteSettings.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }
  console.log('Restored siteSettings:', data.siteSettings?.length || 0);

  // 3. Categories
  for (const c of data.categories || []) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        displayOrder: c.displayOrder,
        active: c.active,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
    });
  }
  console.log('Restored categories:', data.categories?.length || 0);

  // 4. Products
  for (const p of data.products || []) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        material: p.material,
        weight: p.weight,
        featured: p.featured,
        status: p.status,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
    });
  }
  console.log('Restored products:', data.products?.length || 0);

  // 5. Product Images
  for (const pi of data.productImages || []) {
    const existing = await prisma.productImage.findUnique({ where: { id: pi.id } });
    if (!existing) {
      await prisma.productImage.create({
        data: {
          id: pi.id,
          productId: pi.productId,
          url: pi.url,
          alt: pi.alt,
          sortOrder: pi.sortOrder,
          createdAt: new Date(pi.createdAt),
        },
      });
    }
  }
  console.log('Restored productImages:', data.productImages?.length || 0);

  // 6. Product Variants
  for (const pv of data.productVariants || []) {
    const existing = await prisma.productVariant.findUnique({ where: { id: pv.id } });
    if (!existing) {
      await prisma.productVariant.create({
        data: {
          id: pv.id,
          productId: pv.productId,
          size: pv.size,
          color: pv.color,
          stock: pv.stock,
          sku: pv.sku,
        },
      });
    }
  }
  console.log('Restored productVariants:', data.productVariants?.length || 0);

  // 7. Custom Orders
  for (const co of data.customOrders || []) {
    await prisma.customOrder.upsert({
      where: { orderNumber: co.orderNumber },
      update: {},
      create: {
        ...co,
        createdAt: new Date(co.createdAt),
        updatedAt: new Date(co.updatedAt),
      },
    });
  }
  console.log('Restored customOrders:', data.customOrders?.length || 0);

  // 8. Product Orders
  for (const po of data.productOrders || []) {
    await prisma.productOrder.upsert({
      where: { orderNumber: po.orderNumber },
      update: {},
      create: {
        ...po,
        createdAt: new Date(po.createdAt),
        updatedAt: new Date(po.updatedAt),
      },
    });
  }
  console.log('Restored productOrders:', data.productOrders?.length || 0);

  // 9. Custom Garments
  for (const cg of data.customGarments || []) {
    await prisma.customGarment.upsert({
      where: { slug: cg.slug },
      update: {},
      create: {
        ...cg,
        createdAt: new Date(cg.createdAt),
        updatedAt: new Date(cg.updatedAt),
      },
    });
  }
  console.log('Restored customGarments:', data.customGarments?.length || 0);

  console.log('✅ ALL DATA RESTORED SUCCESSFULLY TO TARGET DATABASE!');
}

restore()
  .catch((err) => {
    console.error('Error restoring data:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
