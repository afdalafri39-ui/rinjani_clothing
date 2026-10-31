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

          <div className="footer-col-katalog">
            <div className="footer-heading">KATALOG</div>
            <div className="footer-links">
              <Link href="/shop">Semua Produk</Link>
              <Link href="/shop?category=t-shirts">T-Shirts</Link>
              <Link href="/shop?category=oversize">Oversize Collection</Link>
              <Link href="/shop?category=hoodies">Hoodies</Link>
              <Link href="/shop?category=accessories">Accessories</Link>
            </div>
          </div>

          <div className="footer-col-layanan">
            <div className="footer-heading">LAYANAN</div>
            <div className="footer-links">
              <Link href="/custom">Custom Printing</Link>
              <Link href="/about">Brand Story</Link>
              <Link href="/contact">Hubungi Admin</Link>
              <Link href="/admin/login">Login Admin</Link>
            </div>
          </div>

          <div className="footer-col-sosial">
            <div className="footer-heading">SOSIAL</div>
            <div className="footer-social-links">
              <a
                href="http://instagram.com/rinjani.clothing"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram Rinjani Clothing"
                title="Instagram @rinjani.clothing"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://wa.me/6281369876282"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="WhatsApp Rinjani Clothing"
                title="WhatsApp +6281369876282"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.186 1.564 5.938l-1.564 5.822 5.976-1.568c1.706.942 3.669 1.48 5.756 1.48 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12zm0 21.6c-1.848 0-3.567-.504-5.045-1.381l-.361-.216-3.743.982 1-3.646-.237-.377c-.96-1.528-1.468-3.309-1.468-5.162 0-5.293 4.307-9.6 9.6-9.6 5.293 0 9.6 4.307 9.6 9.6 0 5.293-4.307 9.6-9.6 9.6z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>© {new Date().getFullYear()} Rinjani Clothing. All rights reserved.</div>
          <Link href="/admin/login" style={{ fontWeight: '500' }}>
            Portal Admin / Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
