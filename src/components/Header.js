'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const isHomepage = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isAdmin) return null;

  const headerClass = `header header-solid ${
    isHomepage ? (isScrolled ? 'header-visible' : 'header-hidden') : 'header-visible'
  }`;

  return (
    <>
      <header className={headerClass}>
        <div className="header-inner">
          <div className="header-logo">
            <Link href="/" className="header-logo-link">
              <img
                src="/logo-brand.png"
                alt="Rinjani Clothing"
                className="header-logo-img"
              />
              <span className="header-logo-text">Rinjani Clothing</span>
            </Link>
          </div>

          <div className="header-right">
            <nav className="header-nav">
              <Link href="/shop" className={pathname.startsWith('/shop') ? 'active' : ''}>
                Shop
              </Link>
              <Link href="/custom" className={pathname === '/custom' ? 'active' : ''}>
                Custom
              </Link>
              <Link href="/about" className={pathname === '/about' ? 'active' : ''}>
                About
              </Link>
              <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>
                Contact
              </Link>
            </nav>

            <button
              className="header-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari Produk"
            >
              <Search size={20} />
            </button>

            <button
              className="header-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu Mobile"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="header-logo">RINJANI</div>
          <button
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} /> CLOSE
          </button>
        </div>

        <div className="mobile-menu-body">
          <div className="mobile-menu-section">
            <div className="mobile-menu-section-title">NAVIGASI</div>
            <Link href="/" className="mobile-menu-link">
              Home
            </Link>
            <Link href="/shop" className="mobile-menu-link">
              Shop Catalog
            </Link>
            <Link href="/custom" className="mobile-menu-link">
              Custom Printing
            </Link>
            <Link href="/about" className="mobile-menu-link">
              Brand Story
            </Link>
            <Link href="/contact" className="mobile-menu-link">
              Hubungi Kami
            </Link>
          </div>

          <div className="mobile-menu-section" style={{ marginTop: '32px' }}>
            <div className="mobile-menu-section-title">KATEGORI</div>
            <Link href="/shop?category=t-shirts" className="mobile-menu-sub-link">
              T-Shirts
            </Link>
            <Link href="/shop?category=oversize" className="mobile-menu-sub-link">
              Oversize
            </Link>
            <Link href="/shop?category=long-sleeve" className="mobile-menu-sub-link">
              Long Sleeve
            </Link>
            <Link href="/shop?category=hoodies" className="mobile-menu-sub-link">
              Hoodies
            </Link>
            <Link href="/shop?category=accessories" className="mobile-menu-sub-link">
              Accessories
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
