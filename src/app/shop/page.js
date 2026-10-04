'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch products when query params change
  useEffect(() => {
    setLoading(true);
    let url = '/api/products?';
    if (currentCategory !== 'all') url += `category=${currentCategory}&`;
    if (currentSort) url += `sort=${currentSort}&`;
    if (currentSearch) url += `search=${encodeURIComponent(currentSearch)}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentCategory, currentSort, currentSearch]);

  const handleCategoryChange = (catSlug) => {
    const params = new URLSearchParams(searchParams);
    if (catSlug === 'all') {
      params.delete('category');
    } else {
      params.set('category', catSlug);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="container shop-header">
      <div className="section-header">
        <div className="section-label">RINJANI CATALOG</div>
        <h1 className="section-title">ALL PRODUCTS</h1>
        <p className="section-desc">
          Jelajahi koleksi pakaian berkualitas tinggi Rinjani Clothing. Hubungi admin untuk informasi stok dan pemesanan cepat.
        </p>
      </div>

      <div className="shop-filters">
        <div className="shop-category-filters">
          <button
            className={`filter-chip ${currentCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            Semua ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-chip ${currentCategory === cat.slug ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="shop-sort">
          <label htmlFor="sort-select">URUTKAN:</label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={handleSortChange}
          >
            <option value="newest">Terbaru</option>
            <option value="price-asc">Harga: Rendah ke Tinggi</option>
            <option value="price-desc">Harga: Tinggi ke Rendah</option>
            <option value="name-asc">Nama A - Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-card">
              <div className="product-card-image skeleton" style={{ minHeight: '300px' }} />
              <div className="skeleton-text skeleton" />
              <div className="skeleton-text-sm skeleton" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">Produk tidak ditemukan</h3>
          <p className="empty-state-text">
            Belum ada produk untuk kategori atau pencarian yang dipilih.
          </p>
          <button onClick={() => handleCategoryChange('all')} className="btn btn-secondary">
            LIHAT SEMUA PRODUK
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container shop-header">Memuat katalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
