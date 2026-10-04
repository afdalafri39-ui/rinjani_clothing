'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className={`search-overlay ${isOpen ? 'open' : ''}`}>
      <div className="search-overlay-header">
        <Search size={24} color="#666" />
        <input
          ref={inputRef}
          type="text"
          className="search-overlay-input"
          placeholder="Cari produk (contoh: Mountain, Oversize, Hoodie)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-overlay-close" onClick={onClose}>
          TUTUP [ESC]
        </button>
      </div>

      <div className="search-results">
        {loading && <div style={{ color: '#666' }}>Mencari produk...</div>}

        {!loading && query && results.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-title">Tidak ada hasil ditemukan</p>
            <p className="empty-state-text">Coba kata kunci lain atau lihat katalog lengkap kami.</p>
            <Link href="/shop" onClick={onClose} className="btn btn-secondary">
              LIHAT KATALOG
            </Link>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <div className="section-label" style={{ marginBottom: '24px' }}>
              HASIL PENCARIAN ({results.length})
            </div>
            <div className="product-grid">
              {results.map((product) => {
                const mainImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80';
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="product-card"
                  >
                    <div className="product-card-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mainImg} alt={product.name} />
                    </div>
                    <div className="product-card-name">{product.name}</div>
                    <div className="product-card-price">{formatPrice(product.price)}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
