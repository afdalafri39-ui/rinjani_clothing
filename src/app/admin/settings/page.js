'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle2, MessageSquare, Globe, Mail, MapPin, Banknote } from 'lucide-react';
import { generateOrderMessage } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Settings State
  const [brandName, setBrandName] = useState('Rinjani Clothing');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [orderMessageTemplate, setOrderMessageTemplate] = useState('');
  const [currency, setCurrency] = useState('IDR');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setBrandName(s.brandName || 'Rinjani Clothing');
          setWhatsappNumber(s.whatsappNumber || '');
          setWhatsappEnabled(s.whatsappEnabled !== false);
          setTelegramUsername(s.telegramUsername || '');
          setTelegramEnabled(false);
          setInstagramUrl(s.instagramUrl || '');
          setEmail(s.email || '');
          setAddress(s.address || '');
          setOrderMessageTemplate(s.orderMessageTemplate || '');
          setCurrency(s.currency || 'IDR');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    const payload = {
      brandName,
      whatsappNumber,
      whatsappEnabled,
      telegramUsername,
      telegramEnabled,
      instagramUrl,
      email,
      address,
      orderMessageTemplate,
      currency,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg('Pengaturan berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert('Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi server');
    } finally {
      setSaving(false);
    }
  };

  const samplePreviewMessage = generateOrderMessage(orderMessageTemplate, {
    product_name: 'Rinjani Mountain Tee',
    product_url: 'https://rinjani.com/product/rinjani-mountain-tee',
    product_slug: 'rinjani-mountain-tee',
    price: 'Rp 125.000',
    size: 'L',
    color: 'Black',
    quantity: 1,
  });

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat pengaturan toko...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>PENGATURAN TOKO & KANAL KOMUNIKASI</h2>
          <p style={{ fontSize: '0.8125rem', color: '#666' }}>Konfigurasi nomor WhatsApp, alamat toko, dan template pesan otomatis customer.</p>
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} /> {saving ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN'}
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#F0FFF4', color: '#2F855A', border: '1px solid #2F855A', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* SECTION 1: WHATSAPP */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h3 className="settings-section-title">1. KONFIGURASI WHATSAPP ADMIN</h3>
            <p className="settings-section-desc">Nomor ini digunakan saat customer mengklik tombol WhatsApp atau HUBUNGI ADMIN pada produk.</p>
          </div>

          <div className="settings-section-body">
            {/* WHATSAPP */}
            <div style={{ padding: '16px', border: '1px solid #E5E5E2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                  <MessageSquare size={18} color="#25D366" /> WHATSAPP ADMIN
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  />
                  Aktifkan WhatsApp
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">NOMOR WHATSAPP (FORMAT INTERNASIONAL TANPA +)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="6281369876282"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: '#888' }}>Contoh: Gunakan 6281369876282 (bukan 081369876282).</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: TEMPLATE PESAN OTOMATIS */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h3 className="settings-section-title">2. TEMPLATE PESAN ORDER (AUTOMATIC MESSAGE TEMPLATE)</h3>
            <p className="settings-section-desc">Format pesan yang akan terisi otomatis saat customer membuka obrolan WhatsApp.</p>
          </div>

          <div className="settings-section-body">
            <div className="form-group">
              <label className="form-label">ISI TEMPLATE PESAN</label>
              <textarea
                className="form-input form-textarea"
                style={{ height: '160px', fontFamily: 'monospace', fontSize: '0.875rem' }}
                value={orderMessageTemplate}
                onChange={(e) => setOrderMessageTemplate(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                Variabel yang didukung: <code>{'{{product_name}}'}</code>, <code>{'{{product_url}}'}</code>, <code>{'{{size}}'}</code>, <code>{'{{color}}'}</code>, <code>{'{{quantity}}'}</code>, <code>{'{{price}}'}</code>.
              </div>
            </div>

            {/* PREVIEW HASIL */}
            <div style={{ padding: '16px', backgroundColor: '#F7F6F2', border: '1px solid #E5E5E2' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.06em', color: '#666', marginBottom: '8px' }}>
                SIMULASI PREVIEW PESAN WHATSAPP:
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-family)', fontSize: '0.875rem', color: '#111', margin: 0 }}>
                {samplePreviewMessage}
              </pre>
            </div>
          </div>
        </div>

        {/* SECTION 3: INFORMASI BRAND & PROFIL */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h3 className="settings-section-title">3. PROFIL TOKO & ALAMAT</h3>
          </div>

          <div className="settings-section-body">
            <div className="form-group">
              <label className="form-label">NAMA BRAND</label>
              <input
                type="text"
                className="form-input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LINK INSTAGRAM</label>
              <input
                type="url"
                className="form-input"
                placeholder="http://instagram.com/rinjani.clothing"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">EMAIL SUPPORT</label>
              <input
                type="email"
                className="form-input"
                placeholder="hello@rinjaniclothing.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ALAMAT TOKO / HEADQUARTER</label>
              <textarea
                className="form-input"
                style={{ height: '80px' }}
                placeholder="Jl. Rinjani No. 1, Lombok..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: MATA UANG & KURS */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h3 className="settings-section-title">4. MATA UANG & KURS (CURRENCY)</h3>
            <p className="settings-section-desc">Format mata uang yang digunakan untuk seluruh harga katalog pakaian dan pesanan.</p>
          </div>

          <div className="settings-section-body">
            <div className="form-group">
              <label className="form-label">MATA UANG TOKO</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="IDR">Rupiah Indonesia (IDR / Rp) - Standar Indonesia</option>
              </select>
            </div>

            <div style={{ padding: '14px 16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Banknote size={20} style={{ color: '#16A34A' }} />
              <div style={{ fontSize: '0.8125rem', color: '#166534' }}>
                Format saat ini: <strong>Rupiah (Rp)</strong>. Seluruh harga pada website publik dan admin ditampilkan menggunakan simbol <strong>Rp</strong> (contoh: <code>Rp 125.000</code>).
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN TOKO'}
          </button>
        </div>
      </form>
    </div>
  );
}
