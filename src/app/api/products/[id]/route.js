import { NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabase
      .from('Product')
      .select('*, category:Category(*), images:ProductImage(*), variants:ProductVariant(*)')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error) throw error;
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (Array.isArray(product.images)) {
      product.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Fetch product by id/slug error:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail produk' }, { status: 500 });
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

    const { data: existingProduct } = await supabase
      .from('Product')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      slug = generateSlug(name);
      const { data: duplicateSlug } = await supabase
        .from('Product')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .maybeSingle();
      if (duplicateSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updateFields = {
      name: name || existingProduct.name,
      slug,
      description: description !== undefined ? description : existingProduct.description,
      price: price !== undefined ? parseFloat(price) : existingProduct.price,
      categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
      material: material !== undefined ? material : existingProduct.material,
      weight: weight !== undefined ? weight : existingProduct.weight,
      featured: featured !== undefined ? !!featured : existingProduct.featured,
      status: status || existingProduct.status,
      updatedAt: new Date().toISOString(),
    };

    const { data: updatedProduct, error } = await supabase
      .from('Product')
      .update(updateFields)
      .eq('id', id)
      .select('*, category:Category(*)')
      .single();

    if (error) throw error;

    let updatedImages = [];
    if (images) {
      await supabase.from('ProductImage').delete().eq('productId', id);
      if (images.length > 0) {
        const imgRows = images.map((img, index) => ({
          id: generateId('img'),
          productId: id,
          url: typeof img === 'string' ? img : img.url,
          alt: (typeof img === 'object' && img.alt) || name || existingProduct.name,
          sortOrder: index,
        }));
        const { data: insImgs } = await supabase.from('ProductImage').insert(imgRows).select('*');
        updatedImages = insImgs || [];
      }
    } else {
      const { data: curImgs } = await supabase.from('ProductImage').select('*').eq('productId', id);
      updatedImages = curImgs || [];
    }

    let updatedVariants = [];
    if (variants) {
      await supabase.from('ProductVariant').delete().eq('productId', id);
      if (variants.length > 0) {
        const varRows = variants.map((v) => ({
          id: generateId('var'),
          productId: id,
          size: v.size || null,
          color: v.color || null,
          stock: parseInt(v.stock, 10) || 0,
          sku: v.sku || `${slug}-${v.size || ''}-${v.color || ''}`.toLowerCase().replace(/\s/g, '-'),
        }));
        const { data: insVars } = await supabase.from('ProductVariant').insert(varRows).select('*');
        updatedVariants = insVars || [];
      }
    } else {
      const { data: curVars } = await supabase.from('ProductVariant').select('*').eq('productId', id);
      updatedVariants = curVars || [];
    }

    return NextResponse.json({
      product: {
        ...updatedProduct,
        images: updatedImages,
        variants: updatedVariants,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    await supabase.from('ProductImage').delete().eq('productId', id);
    await supabase.from('ProductVariant').delete().eq('productId', id);
    const { error } = await supabase.from('Product').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}
