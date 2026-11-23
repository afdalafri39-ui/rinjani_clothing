'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  User,
  Home,
  ShieldAlert,
  Monitor,
  Laptop,
  Globe,
  RotateCw,
} from 'lucide-react';
import LogoRC from '@/components/LogoRC';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(null);
  const [bypassMobileBlock, setBypassMobileBlock] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('rc_dashboard_loaded');
      sessionStorage.removeItem('rc_dashboard_refreshed');
    }

    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setScreenWidth(window.innerWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Extra guard for screens below 768px (hanya jika pengguna belum menekan bypass)
    if (!bypassMobileBlock && typeof window !== 'undefined' && window.innerWidth < 768) {
      setError('Akses ditolak: Portal login dioptimalkan untuk layar minimal 768px. Klik "Tetap Buka Form Login di HP" di bawah jika ingin melanjutkan.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.warn('Response bukan JSON:', jsonErr);
      }

      if (!res.ok) {
        setError(data.error || `Server merespons kode ${res.status}. Silakan coba lagi.`);
        setLoading(false);
        return;
      }

      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('rc_admin_token', data.token);
      }

      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        window.location.href = '/admin';
      } else {
        router.push('/admin');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kendala jaringan saat menghubungi server. Silakan muat ulang halaman dan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${bypassMobileBlock ? 'mobile-allowed' : ''}`}>
      {/* ==============================================================
          1. RESTRICTION VIEW FOR MOBILE / DEVICES UNDER 768PX
          Enforced instantly via CSS media query (@media max-width: 767.98px)
          ============================================================== */}
      <section className="login-restricted-screen" aria-label="Akses portal login dibatasi di perangkat seluler">
        <div className="login-brand" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <LogoRC width={60} height={56} />
          </div>
          <div className="login-brand-name">RINJANI CLOTHING</div>
          <div className="login-brand-role">PORTAL ADMINISTRATOR</div>
        </div>

        <div className="login-restricted-header">
          <div className="login-restricted-badge">
            <ShieldAlert size={14} />
            <span>AKSES DIBATASI &bull; KHUSUS DESKTOP</span>
          </div>
          <h1 className="login-restricted-title">
            Portal Dioptimalkan untuk Layar Desktop
          </h1>
          <p className="login-restricted-desc">
            Demi kenyamanan manajemen inventaris, statistik grafik, dan pesanan, portal administrator disarankan diakses melalui layar minimal <strong>768 piksel</strong>. Namun Anda tetap dapat melanjutkan masuk di perangkat ini.
          </p>
        </div>

        {/* Live Detected Screen Width */}
        <div className="login-screen-meter">
          <div className="login-screen-meter-label">
            <Monitor size={14} /> Lebar Layar Anda:
          </div>
          <div className="login-screen-meter-value">
            {screenWidth !== null ? `${screenWidth}px` : '< 768px'}{' '}
            <span className="login-screen-meter-target">(Standar: &ge; 768px)</span>
          </div>
        </div>

        {/* Actions: Button Bypass, Return to Homepage & Refresh */}
        <div className="login-restricted-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setBypassMobileBlock(true)}
            className="btn btn-primary btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#111827', borderColor: '#111827', color: '#FFF', fontWeight: '600' }}
          >
            <Laptop size={16} /> TETAP BUKA FORM LOGIN DI HP
          </button>
          <Link
            href="/"
            className="btn btn-secondary btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Home size={16} /> KEMBALI KE BERANDA
          </Link>
        </div>
      </section>

      {/* ==============================================================
          2. DESKTOP VIEW FOR SCREENS >= 768PX (OR MOBILE BYPASSED)
          ============================================================== */}
      <div className="login-card">
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: '#666',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>

        <div className="login-brand">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <LogoRC width={72} height={67} />
          </div>
          <div className="login-brand-name">RINJANI CLOTHING</div>
          <div className="login-brand-role">PORTAL LOGIN ADMINISTRATOR</div>
        </div>

        {bypassMobileBlock && (
          <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '4px', fontSize: '0.8125rem', color: '#92400E', lineHeight: '1.4' }}>
            📱 <strong>Mode Akses Ponsel Aktif:</strong> Gunakan mode horizontal (lanskap) jika tabel inventaris terasa sempit.
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              USERNAME / EMAIL ADMIN
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'MEMPROSES MASUK...' : 'MASUK DASHBOARD ADMIN'}
          </button>
        </form>
      </div>
    </div>
  );
}

