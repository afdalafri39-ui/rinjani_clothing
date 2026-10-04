import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { name, description, image, displayOrder, active } = await request.json();

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = generateSlug(name);
      const duplicate = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (duplicate) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug,
        description: description !== undefined ? description : existing.description,
        image: image !== undefined ? image : existing.image,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : existing.displayOrder,
        active: active !== undefined ? !!active : existing.active,
      },
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui kategori' },
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
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}
