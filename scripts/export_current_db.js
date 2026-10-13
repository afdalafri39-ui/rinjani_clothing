const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportAll() {
  const users = await prisma.user.findMany();
  const siteSettings = await prisma.siteSettings.findMany();
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany();
  const productImages = await prisma.productImage.findMany();
  const productVariants = await prisma.productVariant.findMany();
  const customOrders = await prisma.customOrder.findMany();
  const productOrders = await prisma.productOrder.findMany();
  const customGarments = await prisma.customGarment.findMany();

  const data = {
    users,
    siteSettings,
    categories,
    products,
    productImages,
    productVariants,
    customOrders,
    productOrders,
    customGarments,
  };

  const outPath = path.join(__dirname, 'db_backup_full.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');

  console.log('--- EXPORT SUCCESS ---');
  console.log('Users:', users.length);
  console.log('SiteSettings:', siteSettings.length);
  console.log('Categories:', categories.length);
  console.log('Products:', products.length);
  console.log('ProductImages:', productImages.length);
  console.log('ProductVariants:', productVariants.length);
  console.log('CustomOrders:', customOrders.length);
  console.log('ProductOrders:', productOrders.length);
  console.log('CustomGarments:', customGarments.length);
  console.log('Saved to:', outPath);
}

exportAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
