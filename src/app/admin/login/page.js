'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import LogoRC from '@/components/LogoRC';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal. Periksa kembali email dan password.');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi server.');
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('admin@rinjani.com');
    setPassword('admin123');
  };

  return (
    <div className="login-page">
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
            <ArrowLeft size={16} /> Kembali ke Website
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
            <label className="form-label" htmlFor="email">
              EMAIL ADMIN
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="admin@rinjani.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
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

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E5E2', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>
            Akun Akun Default Admin:
          </div>
          <div
            onClick={handleUseDemo}
            style={{
              padding: '8px 12px',
              backgroundColor: '#F1F1EF',
              fontSize: '0.75rem',
              cursor: 'pointer',
              border: '1px dashed #A3A3A0',
              color: '#111',
              fontWeight: '500',
            }}
            title="Klik untuk mengisi otomatis"
          >
            <code>admin@rinjani.com</code> / <code>admin123</code> (Klik untuk isi otomatis)
          </div>
        </div>
      </div>
    </div>
  );
}
