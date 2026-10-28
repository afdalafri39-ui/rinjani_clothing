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

    // Extra guard for screens below 768px
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setError('Akses ditolak: Portal login hanya diizinkan melalui perangkat desktop (resolusi minimal 768px).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal. Periksa kembali username dan password.');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('rc_dashboard_loaded');
        sessionStorage.removeItem('rc_dashboard_refreshed');
      }

      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi server.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
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
            <ShieldAlert size={14} /> AKSES DIBATASI &bull; KHUSUS DESKTOP
          </div>
          <h1 className="login-restricted-title">
            Portal Tidak Dapat Dibuka di Perangkat HP
          </h1>
          <p className="login-restricted-desc">
            Demi keamanan data dan operasional manajemen inventaris serta pemrosesan pesanan kustom, portal administrator hanya dapat diakses melalui perangkat beresolusi layar minimal <strong>768 piksel</strong>.
          </p>
        </div>

        {/* Live Detected Screen Width */}
        <div className="login-screen-meter">
          <div className="login-screen-meter-label">
            <Monitor size={14} /> Lebar Layar Anda:
          </div>
          <div className="login-screen-meter-value">
            {screenWidth !== null ? `${screenWidth}px` : '< 768px'}{' '}
            <span className="login-screen-meter-target">(Syarat: &ge; 768px)</span>
          </div>
        </div>

        {/* Actionable Instructions */}
        <div>
          <div className="login-instructions-title">PANDUAN MEMBUKA PORTAL LOGIN</div>
          <div className="login-instruction-list">
            <div className="login-instruction-item">
              <div className="login-instruction-icon">
                <Laptop size={18} />
              </div>
              <div>
                <div className="login-instruction-heading">1. Buka di Laptop / PC Desktop (Disarankan)</div>
                <div className="login-instruction-text">
                  Gunakan browser di komputer atau laptop dengan layar standar desktop untuk kenyamanan operasional penuh.
                </div>
              </div>
            </div>

            <div className="login-instruction-item">
              <div className="login-instruction-icon">
                <Globe size={18} />
              </div>
              <div>
                <div className="login-instruction-heading">2. Aktifkan Fitur &ldquo;Situs Desktop&rdquo; di HP</div>
                <div className="login-instruction-text">
                  Jika mendesak dan tetap ingin mengakses dari browser ponsel:
                  <ul className="login-instruction-steps">
                    <li><strong>Chrome / Android:</strong> Ketuk menu titik tiga (&vellip;) di kanan atas &rarr; centang <strong>Situs Desktop</strong>.</li>
                    <li><strong>Safari / iOS:</strong> Ketuk ikon <strong>aA</strong> di bilah alamat &rarr; pilih <strong>Minta Situs Web Desktop</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="login-instruction-item">
              <div className="login-instruction-icon">
                <RotateCw size={18} />
              </div>
              <div>
                <div className="login-instruction-heading">3. Putar ke Mode Lanskap (Tablet / Layar Lebar)</div>
                <div className="login-instruction-text">
                  Jika menggunakan tablet atau ponsel dengan bentang layar luas, ubah orientasi ke horizontal (lanskap) hingga mencapai &ge; 768px.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions: Button Return to Homepage & Refresh */}
        <div className="login-restricted-actions">
          <Link
            href="/"
            className="btn btn-primary btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Home size={16} /> KEMBALI KE BERANDA
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-secondary btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RotateCw size={14} /> PERIKSA ULANG RESOLUSI
          </button>
        </div>
      </section>

      {/* ==============================================================
          2. DESKTOP VIEW FOR SCREENS >= 768PX
          Enforced instantly via CSS media query (@media min-width: 768px)
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

