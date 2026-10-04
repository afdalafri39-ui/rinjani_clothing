'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, Grid, Settings, LogOut, LayoutDashboard, Menu, X, ExternalLink } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/login');
        setLoading(false);
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoginPage) return children;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ fontWeight: '500', color: '#666' }}>Memverifikasi sesi admin...</div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Produk', href: '/admin/products', icon: Package },
    { label: 'Kelola Kategori', href: '/admin/categories', icon: Grid },
    { label: 'Pengaturan Toko', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-name">RINJANI</div>
          <div className="admin-sidebar-brand-role">INVENTORY SYSTEM</div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section">
            <div className="admin-sidebar-section-title">MENU UTAMA</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="admin-sidebar-section" style={{ marginTop: '24px' }}>
            <div className="admin-sidebar-section-title">PUBLIC WEBSITE</div>
            <Link href="/" target="_blank" className="admin-sidebar-link">
              <ExternalLink size={18} />
              <span>Buka Website</span>
            </Link>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ fontSize: '0.8125rem', fontWeight: '500', marginBottom: '8px' }}>
            {user?.name || 'Admin'}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogOut size={14} /> KELUAR
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="admin-content">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="admin-topbar-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />} MENU
            </button>
            <h1 className="admin-topbar-title">
              {pathname === '/admin' && 'Dashboard Overview'}
              {pathname.startsWith('/admin/products') && 'Manajemen Inventaris Produk'}
              {pathname === '/admin/categories' && 'Manajemen Kategori'}
              {pathname === '/admin/settings' && 'Pengaturan Kontak & Toko'}
            </h1>
          </div>

          <div style={{ fontSize: '0.8125rem', color: '#666' }}>
            User: <strong>{user?.email}</strong>
          </div>
        </div>

        <div className="admin-body">{children}</div>
      </div>
    </div>
  );
}
