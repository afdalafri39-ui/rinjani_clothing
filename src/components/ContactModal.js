'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, User, Phone, Mail, Send, CheckCircle, Loader2, ShoppingBag, FileText } from 'lucide-react';
import { generateOrderMessage, generateWhatsAppUrl } from '@/lib/utils';

export default function ContactModal({ isOpen, onClose, productData = null, customOrderData = null }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  // Customer form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const isCustomOrder = !!customOrderData;
  const isProductOrder = !isCustomOrder && !!productData;

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSubmitted(false);
      setOrderNumber('');
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          setSettings(data.settings);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch settings error:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const messageData = productData
    ? {
        product_name: productData.name,
        product_url: currentUrl,
        product_slug: productData.slug,
        price: productData.price,
        size: productData.selectedSize || '-',
        color: productData.selectedColor || '-',
        quantity: productData.quantity || 1,
      }
    : {
        product_name: 'Tanya Produk / Informasi',
        product_url: currentUrl,
      };

  const message = generateOrderMessage(settings?.orderMessageTemplate, messageData);
  const waUrl = settings?.whatsappNumber
    ? generateWhatsAppUrl(settings.whatsappNumber, message)
    : '#';

  // Handle custom order submission
  const handleCustomOrderSubmit = async () => {
    if (!customerName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Nomor WhatsApp wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || null,
          ...customOrderData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan pesanan custom.');
        setSubmitting(false);
        return;
      }

      setOrderNumber(data.orderNumber);
      setSubmitted(true);
      setSubmitting(false);

      // Build custom order WhatsApp message
      if (settings?.whatsappNumber) {
        const customMessage = buildCustomOrderMessage(data.orderNumber);
        const customWaUrl = generateWhatsAppUrl(settings.whatsappNumber, customMessage);
        window.open(customWaUrl, '_blank');
      }
    } catch (err) {
      console.error('Submit custom order error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  const buildCustomOrderMessage = (orderNum) => {
    const d = customOrderData;
    const sizeStr = d.sizes && typeof d.sizes === 'object'
      ? Object.entries(d.sizes).filter(([, q]) => q > 0).map(([s, q]) => `${s}: ${q}pcs`).join(', ')
      : '-';

    return `Halo Rinjani Clothing,

Saya ingin memesan CUSTOM ORDER:

📋 No. Pesanan: ${orderNum}
👤 Nama: ${customerName}
📱 WhatsApp: ${customerPhone}

📦 SPESIFIKASI:
• Model: ${d.garmentModel || '-'}
• Warna: ${d.color || '-'}
• Kain: ${d.fabric || '-'}
• Cetak: ${d.printingMethod || '-'}
• Ukuran: ${sizeStr}
• Total: ${d.totalQuantity || 1} pcs

${d.notes ? `📝 Catatan: ${d.notes}\n` : ''}${d.designFiles && d.designFiles.length > 0 ? `🎨 File Desain: ${d.designFiles.map((f) => (typeof f === 'string' ? f : f.name)).join(', ')}\n` : ''}
Mohon konfirmasi pesanan saya. Terima kasih!`;
  };

  // Handle product order submission
  const handleProductOrderSubmit = async () => {
    if (!customerName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Nomor WhatsApp wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const rawPrice = productData.rawPrice || 0;
      const qty = productData.quantity || 1;
      const totalAmount = rawPrice * qty;

      const res = await fetch('/api/product-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || null,
          productName: productData.name,
          productSlug: productData.slug,
          price: rawPrice,
          quantity: qty,
          size: productData.selectedSize || '-',
          color: productData.selectedColor || '-',
          totalPrice: totalAmount,
          notes: customerNotes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan pesanan produk.');
        setSubmitting(false);
        return;
      }

      setOrderNumber(data.orderNumber);
      setSubmitted(true);
      setSubmitting(false);

      // Build product order WhatsApp message
      if (settings?.whatsappNumber) {
        const prodMessage = buildProductOrderMessage(data.orderNumber);
        const prodWaUrl = generateWhatsAppUrl(settings.whatsappNumber, prodMessage);
        window.open(prodWaUrl, '_blank');
      }
    } catch (err) {
      console.error('Submit product order error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  const buildProductOrderMessage = (orderNum) => {
    return `Halo Rinjani Clothing,

Saya ingin memesan PRODUK:

📋 No. Pesanan: ${orderNum}
👤 Nama: ${customerName}
📱 WhatsApp: ${customerPhone}
${customerEmail ? `✉️ Email: ${customerEmail}\n` : ''}
📦 RINCIAN PRODUK:
• Produk: ${productData.name}
• Ukuran: ${productData.selectedSize || '-'}
• Warna: ${productData.selectedColor || '-'}
• Jumlah: ${productData.quantity || 1} pcs
• Harga Satuan: ${productData.price || '-'}

${customerNotes ? `📝 Catatan: ${customerNotes}\n` : ''}🔗 Link: ${currentUrl}

Mohon konfirmasi ketersediaan & informasi pembayaran. Terima kasih!`;
  };

  const handleClose = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerNotes('');
    setError('');
    setSubmitted(false);
    setOrderNumber('');
    onClose();
  };

  const modalTitle = isCustomOrder
    ? 'Konfirmasi Pesanan Custom'
    : isProductOrder
    ? 'Form Pemesanan Produk'
    : 'Hubungi Admin';

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={isCustomOrder || isProductOrder ? { maxWidth: '490px' } : {}}
      >
        <div className="modal-header">
          <h3 className="modal-title">{modalTitle}</h3>
          <button className="modal-close" onClick={handleClose} aria-label="Tutup Modal">
            <X size={20} />
          </button>
        </div>

        {/* 1. CUSTOM ORDER */}
        {isCustomOrder ? (
          submitted ? (
            <div className="custom-order-success">
              <div className="custom-order-success-icon">
                <CheckCircle size={48} />
              </div>
              <h4 className="custom-order-success-title">Pesanan Berhasil Dikirim!</h4>
              <p className="custom-order-success-desc">Nomor pesanan Anda:</p>
              <div className="custom-order-success-number">{orderNumber}</div>
              <p className="custom-order-success-hint">
                Simpan nomor ini untuk tracking pesanan Anda. Admin akan segera menghubungi Anda melalui WhatsApp.
              </p>
              <button className="btn btn-primary btn-full" onClick={handleClose} style={{ marginTop: '16px' }}>
                TUTUP
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '20px' }}>
                Isi data diri Anda. Pesanan akan otomatis tersimpan dan diteruskan ke admin via WhatsApp.
              </p>

              <div className="custom-order-form">
                <div className="custom-order-field">
                  <label className="custom-order-label" htmlFor="co-name">
                    <User size={14} /> Nama Lengkap <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    id="co-name"
                    type="text"
                    className="form-input"
                    placeholder="Masukkan nama lengkap"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="custom-order-field">
                  <label className="custom-order-label" htmlFor="co-phone">
                    <Phone size={14} /> Nomor WhatsApp <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    className="form-input"
                    placeholder="Contoh: 08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="custom-order-field">
                  <label className="custom-order-label" htmlFor="co-email">
                    <Mail size={14} /> Email <span style={{ color: '#999', fontWeight: 400 }}>(opsional)</span>
                  </label>
                  <input
                    id="co-email"
                    type="email"
                    className="form-input"
                    placeholder="email@contoh.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {error && <div className="custom-order-error">{error}</div>}

                <button
                  className="btn btn-primary btn-full"
                  onClick={handleCustomOrderSubmit}
                  disabled={submitting}
                  style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin-icon" /> MENYIMPAN...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> KIRIM PESANAN VIA WHATSAPP
                    </>
                  )}
                </button>
              </div>
            </>
          )
        ) : isProductOrder ? (
          /* 2. PRODUCT ORDER (FROM SHOP) */
          submitted ? (
            <div className="custom-order-success">
              <div className="custom-order-success-icon" style={{ color: '#10B981' }}>
                <CheckCircle size={48} />
              </div>
              <h4 className="custom-order-success-title">Pesanan Berhasil Dicatat!</h4>
              <p className="custom-order-success-desc">Nomor pesanan produk Anda:</p>
              <div className="custom-order-success-number" style={{ borderColor: '#10B981', color: '#047857' }}>
                {orderNumber}
              </div>
              <p className="custom-order-success-hint">
                Data telah tersimpan di sistem toko dan chat WhatsApp sedang diarahkan ke admin untuk verifikasi.
              </p>
              <button className="btn btn-primary btn-full" onClick={handleClose} style={{ marginTop: '16px' }}>
                TUTUP
              </button>
            </div>
          ) : (
            <>
              {/* Product Brief Card */}
              <div
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShoppingBag size={16} style={{ color: '#FF3D00' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111' }}>
                    {productData.name}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '0.8125rem',
                    color: '#666',
                  }}
                >
                  {productData.selectedSize && (
                    <span>Ukuran: <strong style={{ color: '#111' }}>{productData.selectedSize}</strong></span>
                  )}
                  {productData.selectedColor && (
                    <span>Warna: <strong style={{ color: '#111' }}>{productData.selectedColor}</strong></span>
                  )}
                  <span>Jumlah: <strong style={{ color: '#111' }}>{productData.quantity || 1} pcs</strong></span>
                  <span>Harga: <strong style={{ color: '#FF3D00' }}>{productData.price}</strong></span>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '16px' }}>
                Lengkapi kontak Anda untuk pencatatan invoice &amp; konfirmasi pemesanan:
              </p>

              <div className="custom-order-form">
                <div className="custom-order-field">
                  <label className="custom-order-label" htmlFor="po-name">
                    <User size={14} /> Nama Lengkap <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    id="po-name"
                    type="text"
                    className="form-input"
                    placeholder="Masukkan nama lengkap Anda"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="custom-order-field">
                  <label className="custom-order-label" htmlFor="po-phone">
                    <Phone size={14} /> Nomor WhatsApp <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    id="po-phone"
                    type="tel"
                    className="form-input"
                    placeholder="Contoh: 08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="custom-order-field">
                  <label className="custom-order-label" htmlFor="po-email">
                    <Mail size={14} /> Email <span style={{ color: '#999', fontWeight: 400 }}>(opsional)</span>
                  </label>
                  <input
                    id="po-email"
                    type="email"
                    className="form-input"
                    placeholder="email@contoh.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="custom-order-field">
                  <label className="custom-order-label" htmlFor="po-notes">
                    <FileText size={14} /> Catatan Tambahan <span style={{ color: '#999', fontWeight: 400 }}>(opsional)</span>
                  </label>
                  <textarea
                    id="po-notes"
                    className="form-input form-textarea"
                    placeholder="Alamat pengiriman / catatan khusus..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    disabled={submitting}
                    rows={2}
                  />
                </div>

                {error && <div className="custom-order-error">{error}</div>}

                <button
                  className="btn btn-primary btn-full"
                  onClick={handleProductOrderSubmit}
                  disabled={submitting}
                  style={{
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin-icon" /> MENYIMPAN...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> ORDER SEKARANG VIA WHATSAPP
                    </>
                  )}
                </button>
              </div>
            </>
          )
        ) : (
          /* 3. GENERAL INQUIRY */
          <>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '20px' }}>
              Pilih kanal komunikasi untuk melakukan pemesanan atau bertaut langsung dengan customer service kami.
            </p>

            {loading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#666' }}>
                Memuat kanal komunikasi...
              </div>
            ) : (
              <div className="modal-options">
                {settings?.whatsappEnabled && settings?.whatsappNumber && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-option"
                  >
                    <div className="modal-option-icon" style={{ backgroundColor: '#25D366', color: '#FFF' }}>
                      <MessageSquare size={20} />
                    </div>
                    <div className="modal-option-text">
                      <div className="modal-option-title">WhatsApp</div>
                      <div className="modal-option-desc">Order otomatis lewat WhatsApp chat</div>
                    </div>
                  </a>
                )}

                {!settings?.whatsappEnabled && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                    Tidak ada kanal komunikasi aktif saat ini.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
