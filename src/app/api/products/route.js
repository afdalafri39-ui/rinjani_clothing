import { NextResponse } from 'next/server';
import { supabase, generateId, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { generateSlug, getRandomApparelImage } from '@/lib/utils';
import mockProductsData from '@/data/mock_products.json';

function getFallbackProducts(searchParams) {
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const featured = searchParams.get('featured');
  const sort = searchParams.get('sort') || 'newest';

  let products = [...(mockProductsData.products || [])];

  if (status) {
    products = products.filter((p) => p.status === status);
  } else if (!searchParams.has('allStatus')) {
    products = products.filter((p) => p.status === 'ACTIVE');
  }

  if (featured === 'true') {
    products = products.filter((p) => p.featured === true);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q))
    );
  }

  if (category) {
    products = products.filter((p) => p.category?.slug === category);
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === 'name-asc') {
    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return products;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (!isSupabaseConfigured()) {
    const products = getFallbackProducts(searchParams);
    return NextResponse.json({ products });
  }

  try {
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
    console.warn('Fetch products Supabase error, falling back to mock data:', error.message);
    const products = getFallbackProducts(searchParams);
    return NextResponse.json({ products });
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

    // Insert Images (auto-generate random apparel image if not provided)
    let createdImages = [];
    const imageList = (images && images.length > 0) ? images : [getRandomApparelImage()];
    const imgRows = imageList.map((img, index) => ({
      id: generateId('img'),
      productId: productId,
      url: typeof img === 'string' ? img : img.url,
      alt: (typeof img === 'object' && img.alt) || name,
      sortOrder: index,
    }));
    const { data: insertedImgs } = await supabase.from('ProductImage').insert(imgRows).select('*');
    createdImages = insertedImgs || [];

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
