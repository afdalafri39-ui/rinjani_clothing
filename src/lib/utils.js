export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return 'Rp 0';
  const num = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.-]+/g, '')) || 0;
  return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
}

export function getStockStatus(totalStock) {
  if (totalStock === 0) return { label: 'SOLD OUT', className: 'stock-sold-out' };
  if (totalStock <= 5) return { label: 'LIMITED', className: 'stock-limited' };
  return { label: 'AVAILABLE', className: 'stock-available' };
}

export function getTotalStock(variants) {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

export function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateOrderMessage(template, data = {}) {
  const fallbackTemplate = `Halo Rinjani Clothing,

Saya ingin memesan:

Produk: {{product_name}}
Ukuran: {{size}}
Warna: {{color}}
Jumlah: {{quantity}} pcs
Harga: {{price}}

Link produk:
{{product_url}}`;

  let message = (template || fallbackTemplate).replace(/\r\n/g, '\n');

  const variables = {
    '{{product_name}}': data.product_name || '',
    '{{product_url}}': data.product_url || '',
    '{{product_slug}}': data.product_slug || '',
    '{{price}}': data.price || '',
    '{{size}}': data.size || '',
    '{{color}}': data.color || '',
    '{{quantity}}': data.quantity !== undefined ? String(data.quantity) : '1',
    '{{customer_name}}': data.customer_name || '',
    '{{customer_phone}}': data.customer_phone || '',
    '{{order_number}}': data.order_number || '',
    '{{notes}}': data.notes || '',
  };

  for (const [key, value] of Object.entries(variables)) {
    if (value) {
      message = message.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    } else {
      // Remove line containing empty variable
      message = message.replace(new RegExp(`.*${key.replace(/[{}]/g, '\\$&')}.*\\n?`, 'g'), '');
    }
  }

  // If customer info or order number exists but was not part of template, append neatly
  const extraLines = [];
  if (data.order_number && !template?.includes('{{order_number}}')) {
    extraLines.push(`📋 No. Pesanan: ${data.order_number}`);
  }
  if (data.customer_name && !template?.includes('{{customer_name}}')) {
    extraLines.push(`👤 Nama: ${data.customer_name}`);
  }
  if (data.customer_phone && !template?.includes('{{customer_phone}}')) {
    extraLines.push(`📱 WhatsApp: ${data.customer_phone}`);
  }
  if (data.notes && !template?.includes('{{notes}}')) {
    extraLines.push(`📝 Catatan: ${data.notes}`);
  }

  if (extraLines.length > 0) {
    message = `${message}\n\n---\nData Pemesan:\n${extraLines.join('\n')}`;
  }

  return message.replace(/\n{3,}/g, '\n\n').trim();
}

export function generateWhatsAppUrl(phone, message) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Koleksi gambar apparel & streetwear acak berkualitas tinggi (WebP format)
export const RANDOM_APPAREL_IMAGES = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80&fm=webp', // White Tee
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80&fm=webp', // Black Graphic Tee
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80&fm=webp', // Black Artwork Tee
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80&fm=webp', // Grey Hoodie
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80&fm=webp', // Dark Long Sleeve
  'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80&fm=webp', // Navy Polo Shirt
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80&fm=webp', // Minimal Cream Sweatshirt
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80&fm=webp', // Cap Streetwear
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80&fm=webp', // Outdoor Jacket
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80&fm=webp', // Flannel Casual
  'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=800&q=80&fm=webp', // Sport Jersey
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80&fm=webp', // Raglan Vintage
  'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=800&q=80&fm=webp', // Black Basic
  'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80&fm=webp', // Streetwear Bold
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80&fm=webp', // Hoodie Outdoor
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80&fm=webp', // Urban Knit
  'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&q=80&fm=webp', // Casual White
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80&fm=webp', // Street Style
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80&fm=webp', // Clothing Hanger
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80&fm=webp', // Streetwear Modern
];

export function getRandomApparelImage() {
  const index = Math.floor(Math.random() * RANDOM_APPAREL_IMAGES.length);
  return RANDOM_APPAREL_IMAGES[index];
}

export function getProductImage(product) {
  if (!product) return getRandomApparelImage();

  let firstImg =
    product.images?.[0]?.url ||
    (typeof product.image === 'string' ? product.image : null);

  if (firstImg && firstImg.includes('images.unsplash.com') && !firstImg.includes('fm=webp')) {
    firstImg = `${firstImg}&fm=webp`;
  }

  const slug = (product.slug || product.name || '').toLowerCase();

  // Kustomisasi visual sesuai nama/kategori produk awal
  if (slug.includes('cap') || slug.includes('topi')) {
    return 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80&fm=webp';
  }
  if (slug.includes('hoodie')) {
    return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80&fm=webp';
  }
  if (slug.includes('long-sleeve') || slug.includes('long sleeve')) {
    return '/products/long-sleeve/long-sleeve-hitam.webp';
  }
  if (slug.includes('oversize')) {
    return '/products/t-shirt-oversize/tshirt-oversize-hitam.jpg';
  }
  if (slug.includes('summit')) {
    return '/products/t-shirt-oversize/tshirt-oversize-cream.jpg';
  }
  if (slug.includes('rinjani')) {
    return '/products/t-shirt-reguler/tshirt-reguler-salmon.webp';
  }
  if (slug.includes('urban')) {
    return '/products/t-shirt-reguler/tshirt-reguler-hitam.webp';
  }
  if (slug.includes('polo')) {
    return 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80&fm=webp';
  }

  // Jika produk sudah memiliki gambar sendiri yang bukan duplikat lama
  if (
    firstImg &&
    !firstImg.includes('photo-1521572267360-ee0c2909d518')
  ) {
    return firstImg;
  }

  // Hash deterministik untuk katalog baru yang belum punya gambar spesifik
  const seed = product.id || product.slug || product.name || 'default';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % RANDOM_APPAREL_IMAGES.length;
  return RANDOM_APPAREL_IMAGES[index];
}

export function getProductBackImage(product, mainImage) {
  if (!product && !mainImage) return null;

  const resolvedMain = mainImage || getProductImage(product);
  if (!resolvedMain) return null;

  // 1. If main image is an oversize front image, resolve directly to its matching back image
  if (resolvedMain.includes('tshirt-oversize-') && !resolvedMain.includes('-back.')) {
    const match = resolvedMain.match(/tshirt-oversize-([a-z0-9-]+?)(?:-back)?\.(?:webp|jpg|png|jpeg)/i);
    const col = match ? match[1] : 'hitam';
    if (resolvedMain.includes('/site-assets/t-shirt-oversize/')) {
      return `https://sqmkpznnvpkdecwwizam.supabase.co/storage/v1/object/public/site-assets/t-shirt-oversize/tshirt-oversize-${col}-back.jpg`;
    }
    return `/products/t-shirt-oversize/tshirt-oversize-${col}-back.jpg`;
  }

  // 2. If main image is a regular front image, resolve directly to its matching back image
  if (resolvedMain.includes('tshirt-reguler-') && !resolvedMain.includes('-back.')) {
    const match = resolvedMain.match(/tshirt-reguler-([a-z0-9-]+?)(?:-back)?\.(?:webp|jpg|png|jpeg)/i);
    const col = match ? match[1] : 'salmon';
    if (resolvedMain.includes('/site-assets/t-shirt-reguler/')) {
      return `https://sqmkpznnvpkdecwwizam.supabase.co/storage/v1/object/public/site-assets/t-shirt-reguler/tshirt-reguler-${col}-back.webp`;
    }
    return `/products/t-shirt-reguler/tshirt-reguler-${col}-back.webp`;
  }

  // 3. If product has images array and contains a back/belakang image
  if (product?.images && Array.isArray(product.images)) {
    const backImg = product.images.find(img => {
      const url = (img?.url || '').toLowerCase();
      const alt = (img?.alt || '').toLowerCase();
      return url.includes('-back') || url.includes('belakang') || alt.includes('belakang') || alt.includes('back');
    });
    if (backImg?.url) return backImg.url;
  }

  // 4. If product name / slug / category contains oversize
  const slug = (product?.slug || product?.name || '').toLowerCase();
  const categorySlug = (product?.category?.slug || product?.category?.name || '').toLowerCase();
  const isOversize = slug.includes('oversize') || categorySlug.includes('oversize');

  if (isOversize) {
    if (slug.includes('summit')) {
      return '/products/t-shirt-oversize/tshirt-oversize-cream-back.jpg';
    }
    return '/products/t-shirt-oversize/tshirt-oversize-hitam-back.jpg';
  }

  // 5. If product is regular t-shirt
  const isReguler = slug.includes('reguler') || slug.includes('regular') || slug.includes('rinjani') || slug.includes('urban') || categorySlug === 't-shirts';
  if (isReguler) {
    if (slug.includes('rinjani')) {
      return '/products/t-shirt-reguler/tshirt-reguler-salmon-back.webp';
    }
    return '/products/t-shirt-reguler/tshirt-reguler-hitam-back.webp';
  }

  // 6. Fallback: if product has a second image in images array, show it on hover
  if (product?.images && Array.isArray(product.images) && product.images.length > 1) {
    const secondImg = product.images[1]?.url;
    if (secondImg && secondImg !== resolvedMain) {
      return secondImg;
    }
  }

  return null;
}
