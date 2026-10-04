export function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
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
