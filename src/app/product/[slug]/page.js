'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { formatPrice, getStockStatus, getProductImage, getProductBackImage } from '@/lib/utils';
import ContactModal from '@/components/ContactModal';
import { ChevronRight, ArrowLeft, ShoppingBag, MessageSquare } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import tshirtColorData from '@/data/tshirt_colors.json';

function getOversizeImageForColor(colorName) {
  if (!colorName) return null;
  const col = colorName.toLowerCase().replace(/[^a-z0-9-]/g, ' ').trim();
  const oversizeMap = tshirtColorData?.oversizeUrls || {};

  // Direct match or partial match against all 22 colors
  for (const [key, url] of Object.entries(oversizeMap)) {
    if (col === key || col.includes(key) || key.includes(col)) {
      return url;
    }
  }
  // Specific aliases
  if (col.includes('black') || col.includes('hitam')) return oversizeMap['hitam'];
  if (col.includes('white') || col.includes('putih')) return oversizeMap['putih'];
  if (col.includes('grey') || col.includes('gray') || col.includes('abu') || col.includes('misty')) return oversizeMap['abu-muda'];
  if (col.includes('khaki') || col.includes('krem') || col.includes('cream')) return oversizeMap['cream'];
  if (col.includes('blue') || col.includes('navy')) return oversizeMap['navy'];
  if (col.includes('green') || col.includes('sage')) return oversizeMap['sage-green'];
  if (col.includes('merah') || col.includes('red')) return oversizeMap['merah'];
  if (col.includes('brown') || col.includes('cokelat') || col.includes('coklat')) return oversizeMap['coklat'];
  if (col.includes('purple') || col.includes('violet') || col.includes('ungu')) return oversizeMap['ungu'];
  if (col.includes('yellow') || col.includes('kuning')) return oversizeMap['kuning'];
  return null;
}

function getOversizeBackImageForColor(colorName) {
  if (!colorName) return null;
  const col = colorName.toLowerCase().replace(/[^a-z0-9-]/g, ' ').trim();
  const oversizeBackMap = tshirtColorData?.oversizeBackUrls || {};

  // Direct match or partial match against all 22 colors
  for (const [key, url] of Object.entries(oversizeBackMap)) {
    if (col === key || col.includes(key) || key.includes(col)) {
      return url;
    }
  }
  // Specific aliases
  if (col.includes('black') || col.includes('hitam')) return oversizeBackMap['hitam'];
  if (col.includes('white') || col.includes('putih')) return oversizeBackMap['putih'];
  if (col.includes('grey') || col.includes('gray') || col.includes('abu') || col.includes('misty')) return oversizeBackMap['abu-muda'];
  if (col.includes('khaki') || col.includes('krem') || col.includes('cream')) return oversizeBackMap['cream'];
  if (col.includes('blue') || col.includes('navy')) return oversizeBackMap['navy'];
  if (col.includes('green') || col.includes('sage')) return oversizeBackMap['sage-green'];
  if (col.includes('merah') || col.includes('red')) return oversizeBackMap['merah'];
  if (col.includes('brown') || col.includes('cokelat') || col.includes('coklat')) return oversizeBackMap['coklat'];
  if (col.includes('purple') || col.includes('violet') || col.includes('ungu')) return oversizeBackMap['ungu'];
  if (col.includes('yellow') || col.includes('kuning')) return oversizeBackMap['kuning'];
  return null;
}

function getRegulerImageForColor(colorName) {
  if (!colorName) return null;
  const col = colorName.toLowerCase().replace(/[^a-z0-9-]/g, ' ').trim();
  const regulerMap = tshirtColorData?.localUrls || {};

  for (const [key, url] of Object.entries(regulerMap)) {
    if (col === key || col.includes(key) || key.includes(col)) {
      return url;
    }
  }
  if (col.includes('black') || col.includes('hitam')) return regulerMap['hitam'];
  if (col.includes('white') || col.includes('putih')) return regulerMap['putih'];
  if (col.includes('grey') || col.includes('gray') || col.includes('abu') || col.includes('misty')) return regulerMap['abu-muda'];
  if (col.includes('khaki') || col.includes('krem') || col.includes('cream')) return regulerMap['cream'];
  if (col.includes('blue') || col.includes('navy')) return regulerMap['navy'];
  if (col.includes('green') || col.includes('sage')) return regulerMap['sage-green'];
  if (col.includes('merah') || col.includes('red')) return regulerMap['merah'];
  if (col.includes('brown') || col.includes('cokelat') || col.includes('coklat')) return regulerMap['coklat'];
  if (col.includes('purple') || col.includes('violet') || col.includes('ungu')) return regulerMap['ungu'];
  if (col.includes('yellow') || col.includes('kuning')) return regulerMap['kuning'];
  return null;
}

function getRegulerBackImageForColor(colorName) {
  if (!colorName) return null;
  const col = colorName.toLowerCase().replace(/[^a-z0-9-]/g, ' ').trim();
  const regulerBackMap = tshirtColorData?.regulerBackUrls || {};

  for (const [key, url] of Object.entries(regulerBackMap)) {
    if (col === key || col.includes(key) || key.includes(col)) {
      return url;
    }
  }
  if (col.includes('black') || col.includes('hitam')) return regulerBackMap['hitam'];
  if (col.includes('white') || col.includes('putih')) return regulerBackMap['putih'];
  if (col.includes('grey') || col.includes('gray') || col.includes('abu') || col.includes('misty')) return regulerBackMap['abu-muda'];
  if (col.includes('khaki') || col.includes('krem') || col.includes('cream')) return regulerBackMap['cream'];
  if (col.includes('blue') || col.includes('navy')) return regulerBackMap['navy'];
  if (col.includes('green') || col.includes('sage')) return regulerBackMap['sage-green'];
  if (col.includes('merah') || col.includes('red')) return regulerBackMap['merah'];
  if (col.includes('brown') || col.includes('cokelat') || col.includes('coklat')) return regulerBackMap['coklat'];
  if (col.includes('purple') || col.includes('violet') || col.includes('ungu')) return regulerBackMap['ungu'];
  if (col.includes('yellow') || col.includes('kuning')) return regulerBackMap['kuning'];
  return null;
}

function getLongSleeveImageForColor(colorName) {
  if (!colorName) return null;
  const col = colorName.toLowerCase().replace(/[^a-z0-9-]/g, ' ').trim();
  const longSleeveMap = tshirtColorData?.longSleeveUrls || {};

  // Direct match or partial match against all 22 colors
  for (const [key, url] of Object.entries(longSleeveMap)) {
    if (col === key || col.includes(key) || key.includes(col)) {
      return url;
    }
  }
  // Specific aliases
  if (col.includes('black') || col.includes('hitam')) return longSleeveMap['hitam'];
  if (col.includes('white') || col.includes('putih')) return longSleeveMap['putih'];
  if (col.includes('grey') || col.includes('gray') || col.includes('abu') || col.includes('misty')) return longSleeveMap['abu-muda'];
  if (col.includes('khaki') || col.includes('krem') || col.includes('cream')) return longSleeveMap['cream'];
  if (col.includes('blue') || col.includes('navy')) return longSleeveMap['navy'];
  if (col.includes('green') || col.includes('sage')) return longSleeveMap['sage-green'];
  if (col.includes('merah') || col.includes('red')) return longSleeveMap['merah'];
  if (col.includes('brown') || col.includes('cokelat') || col.includes('coklat')) return longSleeveMap['coklat'];
  if (col.includes('purple') || col.includes('violet') || col.includes('ungu')) return longSleeveMap['ungu'];
  if (col.includes('yellow') || col.includes('kuning')) return longSleeveMap['kuning'];
  return null;
}

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          const p = data.product;
          setProduct(p);
          const mainImg = getProductImage(p);
          setSelectedImage(mainImg);

          // Extract unique sizes and colors from variants
          const sizes = Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean)));
          const colors = Array.from(new Set(p.variants.map((v) => v.color).filter(Boolean)));

          if (sizes.length > 0) setSelectedSize(sizes[0]);
          if (colors.length > 0) {
            const initialColor = colors[0];
            setSelectedColor(initialColor);
            const isOversize = (slug || '').includes('oversize') || (p.category?.slug || '').includes('oversize');
            const isReguler = (slug || '').includes('reguler') || (slug || '').includes('regular') || (slug || '').includes('rinjani') || (slug || '').includes('urban') || (p.category?.slug || '').includes('t-shirts') || (p.category?.name || '').toLowerCase().includes('t-shirt');
            const isLongSleeve = (slug || '').includes('long-sleeve') || (slug || '').includes('longsleeve') || (p.category?.slug || '').includes('long-sleeve');
            if (isOversize) {
              const matched = getOversizeImageForColor(initialColor);
              if (matched) setSelectedImage(matched);
            } else if (isReguler) {
              const matched = getRegulerImageForColor(initialColor);
              if (matched) setSelectedImage(matched);
            } else if (isLongSleeve) {
              const matched = getLongSleeveImageForColor(initialColor);
              if (matched) setSelectedImage(matched);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="container product-detail">
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          Memuat detail produk...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-detail">
        <div className="empty-state">
          <h2 className="empty-state-title">Produk tidak ditemukan</h2>
          <p className="empty-state-text">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
          <Link href="/shop" className="btn btn-secondary">
            KEMBALI KE KATALOG
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current variant stock
  const currentVariant = product.variants?.find(
    (v) =>
      (!selectedSize || v.size === selectedSize) &&
      (!selectedColor || v.color === selectedColor)
  );

  const availableStock = currentVariant
    ? currentVariant.stock
    : product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

  const stockStatus = getStockStatus(availableStock);

  const availableSizes = Array.from(new Set(product.variants?.map((v) => v.size).filter(Boolean)));
  const availableColors = Array.from(new Set(product.variants?.map((v) => v.color).filter(Boolean)));

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const isOversize = (slug || '').includes('oversize') || (product?.category?.slug || '').includes('oversize');
    const isReguler = (slug || '').includes('reguler') || (slug || '').includes('regular') || (slug || '').includes('rinjani') || (slug || '').includes('urban') || (product?.category?.slug || '').includes('t-shirts') || (product?.category?.name || '').toLowerCase().includes('t-shirt');
    const isLongSleeve = (slug || '').includes('long-sleeve') || (slug || '').includes('longsleeve') || (product?.category?.slug || '').includes('long-sleeve');

    if (isOversize) {
      const front = getOversizeImageForColor(color);
      if (front) setSelectedImage(front);
    } else if (isReguler) {
      const front = getRegulerImageForColor(color);
      if (front) setSelectedImage(front);
    } else if (isLongSleeve) {
      const matched = getLongSleeveImageForColor(color);
      if (matched) setSelectedImage(matched);
    }
  };

  const isOversize = (slug || '').includes('oversize') || (product?.category?.slug || '').includes('oversize');
  const isReguler = (slug || '').includes('reguler') || (slug || '').includes('regular') || (slug || '').includes('rinjani') || (slug || '').includes('urban') || (product?.category?.slug || '').includes('t-shirts') || (product?.category?.name || '').toLowerCase().includes('t-shirt');
  const currentFrontImg = isOversize
    ? (getOversizeImageForColor(selectedColor) || selectedImage)
    : isReguler
    ? (getRegulerImageForColor(selectedColor) || selectedImage)
    : selectedImage;
  const currentBackImg = isOversize
    ? getOversizeBackImageForColor(selectedColor)
    : isReguler
    ? getRegulerBackImageForColor(selectedColor)
    : getProductBackImage(product, selectedImage);
  const hasBackView = Boolean(currentBackImg);

  const productDataForModal = {
    name: product.name,
    slug: product.slug,
    price: formatPrice(product.price),
    rawPrice: product.price,
    selectedSize,
    selectedColor,
    quantity,
  };

  return (
    <div className="container product-detail">
      {/* BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#666', marginBottom: '32px' }}>
        <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Shop
        </Link>
        <ChevronRight size={14} />
        <span>{product.category?.name || 'Katalog'}</span>
        <ChevronRight size={14} />
        <span style={{ color: '#111', fontWeight: '500' }}>{product.name}</span>
      </div>

      <div className="product-detail-grid">
        {/* GALLERY */}
        <div className="product-gallery">
          <div
            className={`product-gallery-main ${hasBackView ? 'has-hover-back' : ''}`}
            onMouseEnter={() => {
              if (hasBackView) setIsHoveringImage(true);
            }}
            onMouseLeave={() => {
              setIsHoveringImage(false);
            }}
          >
            {/* Front View */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentFrontImg || selectedImage}
              alt={`${product.name} - Tampak Depan`}
              className={`product-gallery-img product-gallery-img-front ${isHoveringImage && hasBackView ? 'is-hover-faded' : ''}`}
            />

            {/* Back View (Animated automatically on cursor hover) */}
            {hasBackView && currentBackImg && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentBackImg}
                alt={`${product.name} - Tampak Belakang`}
                className={`product-gallery-img product-gallery-img-back ${isHoveringImage ? 'is-active' : ''}`}
              />
            )}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="product-info">
          {product.category && (
            <div className="product-info-category">{product.category.name}</div>
          )}

          <h1 className="product-info-name">{product.name}</h1>
          <div className="product-info-price">{formatPrice(product.price)}</div>

          <div className="product-info-desc">
            {product.description || 'Pakaian kualitas premium Rinjani Clothing.'}
          </div>

          <div className="product-info-divider" />

          {/* SIZE SELECTION */}
          {availableSizes.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div className="product-option-label">UKURAN: {selectedSize}</div>
              <div className="product-sizes">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLOR SELECTION */}
          {availableColors.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div className="product-option-label">WARNA: {selectedColor}</div>
              <div className="product-colors">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => handleColorSelect(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div style={{ marginBottom: '24px' }}>
            <div className="product-option-label">JUMLAH</div>
            <div className="quantity-selector">
              <button
                className="quantity-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <div className="quantity-display">{quantity}</div>
              <button
                className="quantity-btn"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS (TAMBAH KE KERANJANG & PESAN LANGSUNG) */}
          <div className="product-cta" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-full btn-lg"
              onClick={(e) => {
                if (availableStock <= 0) return;
                addToCart(
                  {
                    type: 'product',
                    id: `prod_${product.slug}_${selectedSize || 'all'}_${selectedColor || 'all'}`,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    quantity,
                    selectedSize,
                    selectedColor,
                    image: selectedImage,
                  },
                  e
                );
              }}
              disabled={availableStock <= 0}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ShoppingBag size={18} />
              <span>+ TAMBAH KE KERANJANG</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-full btn-lg"
              onClick={() => setIsModalOpen(true)}
              disabled={availableStock <= 0}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <MessageSquare size={18} />
              <span>{availableStock <= 0 ? 'STOK HABIS (SOLD OUT)' : 'PESAN VIA WHATSAPP (FORMAT OTOMATIS)'}</span>
            </button>
          </div>

          {/* SPECIFICATIONS & META */}
          <div className="product-meta">
            <div className="product-meta-item">
              <span className="product-meta-label">Status Stok:</span>
              <span className={stockStatus.className}>{stockStatus.label}</span>
            </div>

            {product.material && (
              <div className="product-meta-item">
                <span className="product-meta-label">Material:</span>
                <span>{product.material}</span>
              </div>
            )}

            {product.weight && (
              <div className="product-meta-item">
                <span className="product-meta-label">Gramasi/Berat:</span>
                <span>{product.weight}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTACT SELECTION MODAL */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productData={productDataForModal}
      />
    </div>
  );
}
