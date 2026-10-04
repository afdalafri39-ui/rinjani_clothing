'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { formatPrice, getStockStatus } from '@/lib/utils';
import ContactModal from '@/components/ContactModal';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          const p = data.product;
          setProduct(p);
          if (p.images && p.images.length > 0) {
            setSelectedImage(p.images[0].url);
          } else {
            setSelectedImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80');
          }

          // Extract unique sizes and colors from variants
          const sizes = Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean)));
          const colors = Array.from(new Set(p.variants.map((v) => v.color).filter(Boolean)));

          if (sizes.length > 0) setSelectedSize(sizes[0]);
          if (colors.length > 0) setSelectedColor(colors[0]);
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

  const productDataForModal = {
    name: product.name,
    slug: product.slug,
    price: formatPrice(product.price),
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
          <div className="product-gallery-main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} alt={product.name} />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="product-gallery-thumbs">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className={`product-gallery-thumb ${selectedImage === img.url ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || product.name} />
                </div>
              ))}
            </div>
          )}
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
                    onClick={() => setSelectedColor(color)}
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

          {/* HUBUNGI ADMIN CTA */}
          <div className="product-cta">
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => setIsModalOpen(true)}
              disabled={availableStock <= 0}
            >
              {availableStock <= 0 ? 'STOK HABIS (SOLD OUT)' : 'HUBUNGI ADMIN UNTUK MEMESAN'}
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
