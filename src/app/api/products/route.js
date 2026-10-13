import { NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';
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

    let query = supabase
      .from('Product')
      .select('*, category:Category(*), images:ProductImage(*), variants:ProductVariant(*)');

    if (status) {
      query = query.eq('status', status);
    } else if (!searchParams.has('allStatus')) {
      query = query.eq('status', 'ACTIVE');
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,material.ilike.%${search}%`);
    }

    if (sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'name-asc') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    const { data: rawProducts, error } = await query;
    if (error) throw error;

    let products = rawProducts || [];
    if (category) {
      products = products.filter((p) => p.category?.slug === category);
    }

    products.forEach((p) => {
      if (Array.isArray(p.images)) {
        p.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
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
    const { data: existing } = await supabase.from('Product').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const productId = generateId('prod');
    const { data: product, error } = await supabase
      .from('Product')
      .insert({
        id: productId,
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        categoryId: categoryId || null,
        material: material || null,
        weight: weight || null,
        featured: !!featured,
        status: status || 'ACTIVE',
      })
      .select('*, category:Category(*)')
      .single();

    if (error) throw error;

    // Insert Images
    let createdImages = [];
    if (images && images.length > 0) {
      const imgRows = images.map((img, index) => ({
        id: generateId('img'),
        productId: productId,
        url: typeof img === 'string' ? img : img.url,
        alt: (typeof img === 'object' && img.alt) || name,
        sortOrder: index,
      }));
      const { data: insertedImgs } = await supabase.from('ProductImage').insert(imgRows).select('*');
      createdImages = insertedImgs || [];
    }

    // Insert Variants
    let createdVariants = [];
    if (variants && variants.length > 0) {
      const varRows = variants.map((v) => ({
        id: generateId('var'),
        productId: productId,
        size: v.size || null,
        color: v.color || null,
        stock: parseInt(v.stock, 10) || 0,
        sku: v.sku || `${slug}-${v.size || ''}-${v.color || ''}`.toLowerCase().replace(/\s/g, '-'),
      }));
      const { data: insertedVars } = await supabase.from('ProductVariant').insert(varRows).select('*');
      createdVariants = insertedVars || [];
    }

    return NextResponse.json(
      {
        product: {
          ...product,
          images: createdImages,
          variants: createdVariants,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat produk baru' },
      { status: 500 }
    );
  }
}
