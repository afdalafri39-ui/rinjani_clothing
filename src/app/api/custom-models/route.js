import { NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';

// Helper to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET: List all custom garment models
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('CustomGarment')
      .select('*')
      .order('sortOrder', { ascending: true })
      .order('createdAt', { ascending: false });

    if (activeOnly) {
      query = query.eq('active', true);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data: models, error } = await query;
    if (error) throw error;

    // Parse images array for each model
    const formattedModels = (models || []).map((m) => {
      let images = [];
      try {
        images = JSON.parse(m.images || '[]');
      } catch {
        images = [];
      }
      return {
        ...m,
        images,
        image: images[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      };
    });

    return NextResponse.json({ models: formattedModels });
  } catch (error) {
    console.error('GET /api/custom-models error:', error);
    return NextResponse.json({ error: 'Gagal memuat katalog model custom.' }, { status: 500 });
  }
}

// POST: Create a new custom garment model
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      slug: customSlug,
      category = 'T-Shirt',
      description = '',
      price = 0,
      minOrder = 12,
      active = true,
      sortOrder = 0,
      images = [],
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama model pakaian wajib diisi.' }, { status: 400 });
    }

    let slug = customSlug ? generateSlug(customSlug) : generateSlug(name);
    const { data: existing } = await supabase
      .from('CustomGarment')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Ensure images is stored as JSON string
    const imagesJson = Array.isArray(images)
      ? JSON.stringify(images.filter(Boolean))
      : typeof images === 'string'
      ? images
      : '[]';

    const id = generateId('cg');
    const { data: newModel, error } = await supabase
      .from('CustomGarment')
      .insert({
        id,
        name: name.trim(),
        slug,
        category: category.trim(),
        description: description ? description.trim() : null,
        price: parseFloat(price) || 0,
        minOrder: parseInt(minOrder, 10) || 12,
        active: Boolean(active),
        sortOrder: parseInt(sortOrder, 10) || 0,
        images: imagesJson,
      })
      .select()
      .single();

    if (error) throw error;

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(newModel.images || '[]');
    } catch {
      parsedImages = [];
    }

    return NextResponse.json(
      {
        model: {
          ...newModel,
          images: parsedImages,
          image: parsedImages[0] || '',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/custom-models error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan model custom baru.' }, { status: 500 });
  }
}
