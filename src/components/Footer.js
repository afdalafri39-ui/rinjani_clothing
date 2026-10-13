'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoRC from '@/components/LogoRC';

export default function Footer() {
  const pathname = usePathname();

  // Don't render public footer on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogoRC width={24} height={22} />
              <span>RINJANI CLOTHING</span>
            </div>
            <p className="footer-brand-text">
              Everyday apparel inspired by movement, nature, and urban culture. Crafted with high quality materials and minimal aesthetic.
            </p>
          </div>

          <div>
            <div className="footer-heading">KATALOG</div>
            <div className="footer-links">
              <Link href="/shop">Semua Produk</Link>
              <Link href="/shop?category=t-shirts">T-Shirts</Link>
              <Link href="/shop?category=oversize">Oversize Collection</Link>
              <Link href="/shop?category=hoodies">Hoodies</Link>
              <Link href="/shop?category=accessories">Accessories</Link>
            </div>
          </div>

          <div>
            <div className="footer-heading">LAYANAN</div>
            <div className="footer-links">
              <Link href="/custom">Custom Printing</Link>
              <Link href="/about">Brand Story</Link>
              <Link href="/contact">Hubungi Admin</Link>
              <Link href="/admin/login">Login Admin</Link>
            </div>
          </div>

          <div>
            <div className="footer-heading">SOSIAL</div>
            <div className="footer-links">
              <a href="http://instagram.com/rinjani.clothing" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://wa.me/6281369876282" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>© {new Date().getFullYear()} Rinjani Clothing. All rights reserved.</div>
          <Link href="/admin/login" style={{ color: 'var(--color-gray-600)', fontWeight: '500' }}>
            Portal Admin / Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
