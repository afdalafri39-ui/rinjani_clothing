import { NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('Category')
      .select('*, products:Product(id)')
      .eq('active', true)
      .order('displayOrder', { ascending: true });

    if (error) throw error;

    const formatted = (categories || []).map((c) => ({
      ...c,
      _count: {
        products: c.products ? c.products.length : 0,
      },
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil kategori' },
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

    const { name, description, image, displayOrder, active } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    const { data: existing } = await supabase
      .from('Category')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const id = generateId('cat');
    const { data: category, error } = await supabase
      .from('Category')
      .insert({
        id,
        name,
        slug,
        description: description || null,
        image: image || null,
        displayOrder: parseInt(displayOrder, 10) || 0,
        active: active !== undefined ? !!active : true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kategori' },
      { status: 500 }
    );
  }
}
