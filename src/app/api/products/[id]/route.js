import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Fetch product by id/slug error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail produk' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const data = await request.json();
    const { name, description, price, categoryId, material, weight, featured, status, images, variants } = data;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      slug = generateSlug(name);
      const duplicateSlug = await prisma.product.findFirst({
        where: { slug, NOT: { id } },
      });
      if (duplicateSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Delete existing images & variants if provided
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        slug,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
        material: material !== undefined ? material : existingProduct.material,
        weight: weight !== undefined ? weight : existingProduct.weight,
        featured: featured !== undefined ? !!featured : existingProduct.featured,
        status: status || existingProduct.status,
        images: images ? {
          create: images.map((img, index) => ({
            url: typeof img === 'string' ? img : img.url,
            alt: img.alt || name || existingProduct.name,
            sortOrder: index,
          })),
        } : undefined,
        variants: variants ? {
          create: variants.map((v) => ({
            size: v.size || null,
            color: v.color || null,
            stock: parseInt(v.stock, 10) || 0,
            sku: v.sku || `${slug}-${v.size || ''}-${v.color || ''}`.toLowerCase().replace(/\s/g, '-'),
          })),
        } : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    );
  }
}
