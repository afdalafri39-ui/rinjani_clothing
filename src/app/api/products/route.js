import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'newest';

    const where = {};

    // By default, if not specifically asking for admin view, return ACTIVE products
    if (status) {
      where.status = status;
    } else if (!searchParams.has('allStatus')) {
      where.status = 'ACTIVE';
    }

    if (category) {
      where.category = { slug: category };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { material: { contains: search } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'name-asc') {
      orderBy = { name: 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
      },
      orderBy,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const data = await request.json();
    const { name, description, price, categoryId, material, weight, featured, status, images, variants } = data;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Nama dan harga produk wajib diisi' },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    // Ensure slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        categoryId: categoryId || null,
        material: material || null,
        weight: weight || null,
        featured: !!featured,
        status: status || 'ACTIVE',
        images: {
          create: (images || []).map((img, index) => ({
            url: typeof img === 'string' ? img : img.url,
            alt: img.alt || name,
            sortOrder: index,
          })),
        },
        variants: {
          create: (variants || []).map((v) => ({
            size: v.size || null,
            color: v.color || null,
            stock: parseInt(v.stock, 10) || 0,
            sku: v.sku || `${slug}-${v.size || ''}-${v.color || ''}`.toLowerCase().replace(/\s/g, '-'),
          })),
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat produk baru' },
      { status: 500 }
    );
  }
}
