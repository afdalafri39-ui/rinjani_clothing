import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET: Get single custom model
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data: model, error } = await supabase
      .from('CustomGarment')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error) throw error;
    if (!model) {
      return NextResponse.json({ error: 'Model custom tidak ditemukan.' }, { status: 404 });
    }

    let images = [];
    try {
      images = JSON.parse(model.images || '[]');
    } catch {
      images = [];
    }

    return NextResponse.json({
      model: {
        ...model,
        images,
        image: images[0] || '',
      },
    });
  } catch (error) {
    console.error('GET /api/custom-models/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memuat data model custom.' }, { status: 500 });
  }
}

// PUT / PATCH: Update custom model
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data: existing } = await supabase
      .from('CustomGarment')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Model custom tidak ditemukan.' }, { status: 404 });
    }

    const {
      name,
      slug: customSlug,
      category,
      description,
      price,
      minOrder,
      active,
      sortOrder,
      images,
    } = body;

    const data = { updatedAt: new Date().toISOString() };

    if (name !== undefined) data.name = name.trim();
    if (customSlug !== undefined) {
      const newSlug = generateSlug(customSlug);
      const { data: conflict } = await supabase
        .from('CustomGarment')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .maybeSingle();
      if (!conflict) data.slug = newSlug;
    }
    if (category !== undefined) data.category = category.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (price !== undefined) data.price = parseFloat(price) || 0;
    if (minOrder !== undefined) data.minOrder = parseInt(minOrder, 10) || 12;
    if (active !== undefined) data.active = Boolean(active);
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder, 10) || 0;
    if (images !== undefined) {
      data.images = Array.isArray(images)
        ? JSON.stringify(images.filter(Boolean))
        : typeof images === 'string'
        ? images
        : '[]';
    }

    const { data: updated, error } = await supabase
      .from('CustomGarment')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(updated.images || '[]');
    } catch {
      parsedImages = [];
    }

    return NextResponse.json({
      model: {
        ...updated,
        images: parsedImages,
        image: parsedImages[0] || '',
      },
    });
  } catch (error) {
    console.error('PUT /api/custom-models/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui model custom.' }, { status: 500 });
  }
}

// DELETE: Delete custom model
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('CustomGarment').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Model custom berhasil dihapus.' });
  } catch (error) {
    console.error('DELETE /api/custom-models/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus model custom.' }, { status: 500 });
  }
}
