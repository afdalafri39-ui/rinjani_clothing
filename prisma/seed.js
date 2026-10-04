const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@rinjani.com' },
    update: {},
    create: {
      name: 'Admin Rinjani',
      email: 'admin@rinjani.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      brandName: 'Rinjani Clothing',
      whatsappNumber: '6281234567890',
      whatsappEnabled: true,
      telegramUsername: 'rinjaniclothing',
      telegramEnabled: true,
      instagramUrl: 'https://instagram.com/rinjaniclothing',
      email: 'hello@rinjaniclothing.com',
      address: 'Lombok, Nusa Tenggara Barat, Indonesia',
      orderMessageTemplate: 'Halo Rinjani Clothing,\n\nSaya ingin memesan:\n\nProduk: {{product_name}}\nUkuran: {{size}}\nWarna: {{color}}\nJumlah: {{quantity}}\n\nLink produk:\n{{product_url}}',
      currency: 'IDR',
    },
  });

  // Create categories
  const categories = [
    { name: 'T-Shirts', slug: 't-shirts', description: 'Kaos harian dengan kualitas premium', displayOrder: 1 },
    { name: 'Oversize', slug: 'oversize', description: 'Koleksi oversize untuk gaya santai', displayOrder: 2 },
    { name: 'Long Sleeve', slug: 'long-sleeve', description: 'Kaos lengan panjang untuk segala suasana', displayOrder: 3 },
    { name: 'Hoodies', slug: 'hoodies', description: 'Hoodie nyaman untuk cuaca sejuk', displayOrder: 4 },
    { name: 'Accessories', slug: 'accessories', description: 'Aksesoris pelengkap gaya', displayOrder: 5 },
  ];

  const createdCategories = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created;
  }

  // Create products with variants
  const products = [
    {
      name: 'Rinjani Mountain Tee',
      slug: 'rinjani-mountain-tee',
      description: 'Kaos dengan desain terinspirasi dari Gunung Rinjani. Bahan cotton combed 30s yang nyaman dan breathable untuk aktivitas sehari-hari.',
      price: 125000,
      categorySlug: 't-shirts',
      material: 'Cotton Combed 30s',
      weight: '180g',
      featured: true,
      status: 'ACTIVE',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
    },
    {
      name: 'Summit Oversize Tee',
      slug: 'summit-oversize-tee',
      description: 'Oversize tee dengan cutting relaxed fit. Desain minimalis dengan detail branding Rinjani Clothing di bagian dada.',
      price: 145000,
      categorySlug: 'oversize',
      material: 'Cotton Combed 24s',
      weight: '220g',
      featured: true,
      status: 'ACTIVE',
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Cream', 'Navy'],
    },
    {
      name: 'Trail Long Sleeve',
      slug: 'trail-long-sleeve',
      description: 'Kaos lengan panjang untuk petualangan outdoor. Bahan yang cepat kering dan nyaman di segala cuaca.',
      price: 165000,
      categorySlug: 'long-sleeve',
      material: 'Cotton Bamboo Blend',
      weight: '200g',
      featured: false,
      status: 'ACTIVE',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Brown'],
    },
    {
      name: 'Basecamp Hoodie',
      slug: 'basecamp-hoodie',
      description: 'Hoodie tebal dan hangat untuk cuaca dingin. Dilengkapi kangaroo pocket dan adjustable hood. Cocok untuk camping atau hang out.',
      price: 275000,
      categorySlug: 'hoodies',
      material: 'Fleece Cotton',
      weight: '450g',
      featured: true,
      status: 'ACTIVE',
      sizes: ['M', 'L', 'XL'],
      colors: ['Black', 'Navy'],
    },
    {
      name: 'Urban Graphic Tee',
      slug: 'urban-graphic-tee',
      description: 'Kaos dengan artwork eksklusif bertema urban culture. Printing menggunakan teknik DTF berkualitas tinggi yang tahan lama.',
      price: 135000,
      categorySlug: 't-shirts',
      material: 'Cotton Combed 30s',
      weight: '180g',
      featured: false,
      status: 'ACTIVE',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
    },
    {
      name: 'Wilderness Oversize',
      slug: 'wilderness-oversize',
      description: 'Oversize tee koleksi Wilderness. Desain back print yang bold dengan tema alam dan pegunungan.',
      price: 155000,
      categorySlug: 'oversize',
      material: 'Cotton Combed 24s',
      weight: '230g',
      featured: true,
      status: 'ACTIVE',
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Cream'],
    },
    {
      name: 'Ridge Cap',
      slug: 'ridge-cap',
      description: 'Topi five-panel dengan bordir logo Rinjani Clothing. Adjustable strap untuk kenyamanan.',
      price: 89000,
      categorySlug: 'accessories',
      material: 'Canvas Cotton',
      weight: '80g',
      featured: false,
      status: 'ACTIVE',
      sizes: ['One Size'],
      colors: ['Black', 'Navy', 'Brown'],
    },
    {
      name: 'Crater Tee',
      slug: 'crater-tee',
      description: 'Kaos minimalis dengan desain typography. Inspirasi dari kawah Segara Anak di Gunung Rinjani.',
      price: 120000,
      categorySlug: 't-shirts',
      material: 'Cotton Combed 30s',
      weight: '175g',
      featured: false,
      status: 'ACTIVE',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy'],
    },
  ];

  for (const prod of products) {
    const category = createdCategories[prod.categorySlug];
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        categoryId: category.id,
        material: prod.material,
        weight: prod.weight,
        featured: prod.featured,
        status: prod.status,
      },
    });

    // Create variants
    for (const size of prod.sizes) {
      for (const color of prod.colors) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            color,
            stock: Math.floor(Math.random() * 15) + 1,
            sku: `${prod.slug}-${size}-${color}`.toLowerCase().replace(/\s/g, '-'),
          },
        });
      }
    }
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
