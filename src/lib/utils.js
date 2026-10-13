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

export function generateOrderMessage(template, data) {
  if (!template) {
    return `Halo Rinjani Clothing,\n\nSaya ingin memesan:\n\nProduk: ${data.product_name || ''}\nUkuran: ${data.size || ''}\nWarna: ${data.color || ''}\nJumlah: ${data.quantity || 1}\n\nLink produk:\n${data.product_url || ''}`;
  }
  
  let message = template;
  const variables = {
    '{{product_name}}': data.product_name || '',
    '{{product_url}}': data.product_url || '',
    '{{product_slug}}': data.product_slug || '',
    '{{price}}': data.price || '',
    '{{size}}': data.size || '',
    '{{color}}': data.color || '',
    '{{quantity}}': data.quantity || '1',
  };
  
  for (const [key, value] of Object.entries(variables)) {
    if (value) {
      message = message.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    } else {
      // Remove line containing empty variable
      message = message.replace(new RegExp(`.*${key.replace(/[{}]/g, '\\$&')}.*\\n?`, 'g'), '');
    }
  }
  
  return message.trim();
}

export function generateWhatsAppUrl(phone, message) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateTelegramUrl(username) {
  const cleanUsername = username.replace('@', '');
  return `https://t.me/${cleanUsername}`;
}

// Koleksi gambar apparel & streetwear acak berkualitas tinggi
export const RANDOM_APPAREL_IMAGES = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', // White Tee
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', // Black Graphic Tee
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', // Black Artwork Tee
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', // Grey Hoodie
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', // Dark Long Sleeve
  'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80', // Navy Polo Shirt
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', // Minimal Cream Sweatshirt
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', // Cap Streetwear
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', // Outdoor Jacket
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80', // Flannel Casual
  'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=800&q=80', // Sport Jersey
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80', // Raglan Vintage
  'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=800&q=80', // Black Basic
  'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80', // Streetwear Bold
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80', // Hoodie Outdoor
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', // Urban Knit
  'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&q=80', // Casual White
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', // Street Style
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', // Clothing Hanger
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', // Streetwear Modern
];

export function getRandomApparelImage() {
  const index = Math.floor(Math.random() * RANDOM_APPAREL_IMAGES.length);
  return RANDOM_APPAREL_IMAGES[index];
}

export function getProductImage(product) {
  if (!product) return getRandomApparelImage();

  const firstImg =
    product.images?.[0]?.url ||
    (typeof product.image === 'string' ? product.image : null);

  const slug = (product.slug || product.name || '').toLowerCase();

  // Kustomisasi visual sesuai nama/kategori produk awal
  if (slug.includes('cap') || slug.includes('topi')) {
    return 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80';
  }
  if (slug.includes('hoodie')) {
    return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80';
  }
  if (slug.includes('long-sleeve') || slug.includes('long sleeve')) {
    return 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80';
  }
  if (slug.includes('wilderness')) {
    return 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80';
  }
  if (slug.includes('urban')) {
    return 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80';
  }
  if (slug.includes('summit')) {
    return 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80';
  }
  if (slug.includes('rinjani')) {
    return 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80';
  }
  if (slug.includes('polo')) {
    return 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80';
  }

  // Jika produk sudah memiliki gambar sendiri yang bukan duplikat lama
  if (
    firstImg &&
    firstImg !==
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'
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
