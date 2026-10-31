'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { formatPrice, getProductImage } from '@/lib/utils';

const POPULAR_SEARCHES = ['Kaos Polos', 'Mountain Tee', 'Oversize', 'Hoodie', 'Sablon DTF'];

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const caretRef = useRef(null);
  const router = useRouter();

  const updatePosition = () => {
    if (typeof window === 'undefined') return;
    const btn = document.querySelector('.header-search-btn');
    const modal = modalRef.current;
    if (!btn || !modal) return;

    const btnRect = btn.getBoundingClientRect();
    const isMobile = window.innerWidth <= 639;

    if (isMobile) {
      modal.style.top = `${Math.round(btnRect.bottom + 8)}px`;
      modal.style.left = '12px';
      modal.style.right = '12px';
      modal.style.width = 'auto';
      modal.style.maxWidth = 'none';

      const originX = Math.round(btnRect.left + btnRect.width / 2 - 12);
      modal.style.setProperty('--search-origin', `${originX}px -8px`);
      if (caretRef.current) {
        caretRef.current.style.left = `${originX}px`;
      }
    } else {
      const modalWidth = Math.min(500, window.innerWidth - 32);
      modal.style.width = `${modalWidth}px`;
      modal.style.maxWidth = '500px';
      modal.style.left = 'auto';
      modal.style.top = `${Math.round(btnRect.bottom + 8)}px`;

      // Position right edge under the search button area
      const idealRight = window.innerWidth - (btnRect.right + 12);
      const right = Math.max(16, Math.min(idealRight, window.innerWidth - modalWidth - 16));
      modal.style.right = `${Math.round(right)}px`;

      // Center of button relative to modal's left
      const modalLeft = window.innerWidth - right - modalWidth;
      const originX = Math.round(btnRect.left + btnRect.width / 2 - modalLeft);
      modal.style.setProperty('--search-origin', `${originX}px -8px`);
      if (caretRef.current) {
        caretRef.current.style.left = `${originX}px`;
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, { passive: true });
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        clearTimeout(timer);
      };
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Global ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        onClose();
        router.push(`/product/${results[selectedIndex].slug}`);
      } else if (query.trim()) {
        e.preventDefault();
        onClose();
        router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={overlayRef}
      className={`search-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Produk"
    >
      <div ref={modalRef} className="search-modal">
        {/* Pointer Caret pointing up to the search icon */}
        <div ref={caretRef} className="search-modal-caret" />

        <div className="search-modal-inner">
          {/* Header Search Input */}
          <div className="search-modal-header">
            <div className="search-icon-wrapper">
              {loading ? (
                <Loader2 size={18} className="search-spinner" />
              ) : (
                <Search size={18} />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              className="search-modal-input"
              placeholder="Cari produk (contoh: Mountain, Oversize)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClear}
                title="Hapus pencarian"
                aria-label="Hapus pencarian"
              >
                Hapus
              </button>
            )}
            <button
              type="button"
              className="search-close-btn"
              onClick={onClose}
              title="Tutup (ESC)"
              aria-label="Tutup pencarian"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="search-modal-body">
            {/* Quick suggestions when empty */}
            {!query.trim() && !loading && (
              <div className="search-quick-section">
                <div className="search-quick-header">
                  <Sparkles size={13} className="search-quick-icon" />
                  <span>Pencarian Populer</span>
                </div>
                <div className="search-quick-tags">
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="search-quick-tag"
                      onClick={() => {
                        setQuery(tag);
                        inputRef.current?.focus();
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="search-loading-state">
                <Loader2 size={18} className="search-spinner" />
                <span>Mencari produk...</span>
              </div>
            )}

            {/* Empty result state */}
            {!loading && query.trim() && results.length === 0 && (
              <div className="search-empty-state">
                <p className="search-empty-title">Tidak ada hasil ditemukan</p>
                <p className="search-empty-subtitle">
                  Tidak ada produk yang cocok dengan &quot;{query}&quot;. Coba kata kunci lain atau lihat katalog.
                </p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '14px', display: 'inline-flex' }}
                >
                  LIHAT KATALOG LENGKAP
                </Link>
              </div>
            )}

            {/* Results list */}
            {!loading && results.length > 0 && (
              <div className="search-results-list">
                {results.map((product, idx) => {
                  const mainImg = getProductImage(product);
                  const isSelected = idx === selectedIndex;
                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className={`search-result-item ${isSelected ? 'selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="search-result-img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mainImg} alt={product.name} />
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-name">{product.name}</div>
                        <div className="search-result-meta">
                          {product.category?.name && (
                            <span className="search-result-badge">{product.category.name}</span>
                          )}
                          <span className="search-result-price">{formatPrice(product.price)}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="search-result-arrow" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer Shortcuts */}
          <div className="search-modal-footer">
            <div className="search-shortcut-hint">
              <span><kbd>↑</kbd><kbd>↓</kbd> Navigasi</span>
              <span><kbd>↵</kbd> Buka</span>
              <span><kbd>ESC</kbd> Tutup</span>
            </div>
            {results.length > 0 && (
              <Link
                href={`/shop?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="search-view-all"
              >
                Lihat di Katalog ({results.length}) →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
