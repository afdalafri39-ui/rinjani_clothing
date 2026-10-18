'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, User } from 'lucide-react';
import LogoRC from '@/components/LogoRC';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
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
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal. Periksa kembali username dan password.');
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
