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
  const [finalWaUrl, setFinalWaUrl] = useState('');
  const [finalWaMessage, setFinalWaMessage] = useState('');
  const [copied, setCopied] = useState(false);

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

  const targetPhone = settings?.whatsappNumber || '6281369876282';
  const message = generateOrderMessage(settings?.orderMessageTemplate, messageData);
  const waUrl = generateWhatsAppUrl(targetPhone, message);

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
      const d = customOrderData || {};
      const sleeveText = d.sleeve || (d.sleeveType === 'panjang' ? 'Lengan Panjang (+5k)' : 'Lengan Pendek');
      const garmentModelFormatted = d.garmentModel && !d.garmentModel.includes('Lengan')
        ? `${d.garmentModel} (${sleeveText})`
        : d.garmentModel || '';

      const surchargeNotes = [
        d.totalSleeveExtra > 0 ? `Tambahan Lengan Panjang: Rp ${d.totalSleeveExtra.toLocaleString('id-ID')}` : null,
        d.totalSizeExtra > 0 ? `Tambahan Size > XXL: Rp ${d.totalSizeExtra.toLocaleString('id-ID')}` : null,
      ].filter(Boolean).join(' | ');

      const combinedNotes = [
        d.notes || null,
        surchargeNotes ? `[Biaya Tambahan: ${surchargeNotes}]` : null,
      ].filter(Boolean).join(' | ');

      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || null,
          ...d,
          garmentModel: garmentModelFormatted,
          notes: combinedNotes || null,
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
      const customMessage = buildCustomOrderMessage(data.orderNumber);
      const customWaUrl = generateWhatsAppUrl(targetPhone, customMessage);
      setFinalWaUrl(customWaUrl);
      setFinalWaMessage(customMessage);

      try {
        window.open(customWaUrl, '_blank');
      } catch (errOpen) {
        console.error('Window open blocked:', errOpen);
      }
    } catch (err) {
      console.error('Submit custom order error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  const buildCustomOrderMessage = (orderNum) => {
    const d = customOrderData || {};
    const sizeStr = d.sizes && typeof d.sizes === 'object'
      ? Object.entries(d.sizes)
          .filter(([, q]) => q > 0)
          .map(([s, q]) => {
            const isAbove = ['3XL', '4XL', '5XL', 'XXXL', 'XXXXL'].includes(s);
            return `${s}${isAbove ? ' (+5k)' : ''}: ${q}pcs`;
          })
          .join(', ')
      : '-';

    const priceBreakdown = [];
    if (d.totalPrice) {
      if (d.totalBasePrice) {
        priceBreakdown.push(`• Harga Pakaian: Rp ${d.totalBasePrice.toLocaleString('id-ID')} (${d.fabric || 'Bahan Standar'})`);
      }
      if (d.isPrintingManual) {
        priceBreakdown.push(`• Biaya Cetak: Sablon Manual (Hubungi Admin - Min. 12 pcs)`);
      } else if (d.totalPrintingPrice > 0) {
        priceBreakdown.push(`• Biaya Cetak: +Rp ${d.totalPrintingPrice.toLocaleString('id-ID')}`);
      }
      if (d.totalSleeveExtra > 0) {
        const extraPerUnit = d.sleeveExtraPerPcs ? ` (+Rp ${d.sleeveExtraPerPcs.toLocaleString('id-ID')}/pcs)` : '';
        priceBreakdown.push(`• Tambahan Lengan Panjang: +Rp ${d.totalSleeveExtra.toLocaleString('id-ID')}${extraPerUnit}`);
      }
      if (d.totalSizeExtra > 0) {
        const extraPerUnit = d.sizeSurchargePerPcs ? ` (+Rp ${d.sizeSurchargePerPcs.toLocaleString('id-ID')}/pcs)` : ' (+5k/pcs)';
        priceBreakdown.push(`• Tambahan Ukuran 3XL–5XL: +Rp ${d.totalSizeExtra.toLocaleString('id-ID')}${extraPerUnit}`);
      }
      priceBreakdown.push(`• Total Estimasi: *Rp ${d.totalPrice.toLocaleString('id-ID')}*${d.isPrintingManual ? ' (+ Biaya Sablon Manual)' : ''}`);
    }

    return `Halo Rinjani Clothing,

Saya ingin memesan CUSTOM ORDER:

📋 No. Pesanan: ${orderNum}
👤 Nama: ${customerName}
📱 WhatsApp: ${customerPhone}

📦 SPESIFIKASI:
• Model: ${d.garmentModel || '-'}
• Warna: ${d.color || '-'}
• Kain: ${d.fabric || '-'}
• Lengan: ${d.sleeve || 'Lengan Pendek'}
• Cetak: ${d.printingMethod || '-'}
• Ukuran: ${sizeStr}
• Total: ${d.totalQuantity || 1} pcs

${priceBreakdown.length > 0 ? `💰 ESTIMASI BIAYA:\n${priceBreakdown.join('\n')}\n\n` : ''}${d.notes ? `📝 Catatan: ${d.notes}\n` : ''}${d.designFiles && d.designFiles.length > 0 ? `🎨 File Desain: ${d.designFiles.map((f) => (typeof f === 'string' ? f : f.name)).join(', ')}\n` : ''}
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
      const prodMessage = buildProductOrderMessage(data.orderNumber);
      const prodWaUrl = generateWhatsAppUrl(targetPhone, prodMessage);
      setFinalWaUrl(prodWaUrl);
      setFinalWaMessage(prodMessage);

      try {
        window.open(prodWaUrl, '_blank');
      } catch (errOpen) {
        console.error('Window open blocked:', errOpen);
      }
    } catch (err) {
      console.error('Submit product order error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  const buildProductOrderMessage = (orderNum) => {
    if (settings?.orderMessageTemplate) {
      return generateOrderMessage(settings.orderMessageTemplate, {
        product_name: productData.name,
        product_url: currentUrl,
        product_slug: productData.slug,
        price: productData.price,
        size: productData.selectedSize || '-',
        color: productData.selectedColor || '-',
        quantity: productData.quantity || 1,
        customer_name: customerName,
        customer_phone: customerPhone,
        order_number: orderNum,
        notes: customerNotes,
      });
    }

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
    setFinalWaUrl('');
    setFinalWaMessage('');
    setCopied(false);
    onClose();
  };

  const modalTitle = isCustomOrder
    ? 'Format Pemesanan Custom via WhatsApp'
    : isProductOrder
    ? 'Format Pemesanan Produk via WhatsApp'
    : 'Hubungi Admin via WhatsApp';

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
              <div className="custom-order-success-icon" style={{ color: '#10B981' }}>
                <CheckCircle size={48} />
              </div>
              <h4 className="custom-order-success-title">Pesanan Berhasil Disimpan!</h4>
              <p className="custom-order-success-desc">Nomor pesanan Anda:</p>
              <div className="custom-order-success-number" style={{ borderColor: '#10B981', color: '#047857' }}>
                {orderNumber}
              </div>
              <p className="custom-order-success-hint">
                Data pesanan telah tersimpan di sistem toko. Klik tombol di bawah untuk melanjutkan obrolan langsung dengan Admin di WhatsApp dengan format pesanan lengkap.
              </p>

              {finalWaUrl && (
                <a
                  href={finalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: '#25D366',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    fontWeight: '700',
                    marginTop: '16px',
                    textDecoration: 'none',
                  }}
                >
                  <MessageSquare size={18} /> BUKA CHAT WHATSAPP SEKARANG
                </a>
              )}

              {finalWaMessage && (
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => {
                    navigator.clipboard.writeText(finalWaMessage);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ marginTop: '8px', fontSize: '0.8125rem' }}
                >
                  {copied ? '✓ Format Pesan Berhasil Disalin!' : 'Salin Format Pesan WhatsApp'}
                </button>
              )}

              <button className="btn btn-full" onClick={handleClose} style={{ marginTop: '12px', background: 'transparent', border: '1px solid #ddd', color: '#666' }}>
                Tutup Jendela
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '20px' }}>
                Isi data diri Anda. Pesanan akan otomatis tersimpan di sistem dan diteruskan ke admin via WhatsApp dengan format pesanan lengkap.
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
                      <Loader2 size={16} className="spin-icon" /> MENYIMPAN PESANAN...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> KIRIM PESANAN KE WHATSAPP ADMIN
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
                Data telah tersimpan di sistem toko. Silakan klik tombol hijau di bawah untuk melanjutkan percakapan ke WhatsApp Admin.
              </p>

              {finalWaUrl && (
                <a
                  href={finalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: '#25D366',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    fontWeight: '700',
                    marginTop: '16px',
                    textDecoration: 'none',
                  }}
                >
                  <MessageSquare size={18} /> BUKA CHAT WHATSAPP SEKARANG
                </a>
              )}

              {finalWaMessage && (
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => {
                    navigator.clipboard.writeText(finalWaMessage);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ marginTop: '8px', fontSize: '0.8125rem' }}
                >
                  {copied ? '✓ Format Pesan Berhasil Disalin!' : 'Salin Format Pesan WhatsApp'}
                </button>
              )}

              <button className="btn btn-full" onClick={handleClose} style={{ marginTop: '12px', background: 'transparent', border: '1px solid #ddd', color: '#666' }}>
                Tutup Jendela
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
                  marginBottom: '16px',
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

              {/* 1-CLICK INSTANT ORDER VIA WHATSAPP (FORMAT OTOMATIS) */}
              <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                  <MessageSquare size={16} color="#25D366" /> FORMAT PEMESANAN WHATSAPP AKTIF
                </div>
                <p style={{ fontSize: '0.75rem', color: '#15803D', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  Format pesan pemesanan otomatis sudah siap dengan detail produk &amp; varian pilihan Anda.
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: '#25D366',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                  }}
                >
                  <Send size={15} /> ORDER LANGSUNG KE WHATSAPP (1 KLIK)
                </a>
              </div>

              <div style={{ textAlign: 'center', margin: '14px 0 12px', position: 'relative' }}>
                <span style={{ background: '#FFF', padding: '0 10px', fontSize: '0.75rem', color: '#888', position: 'relative', zIndex: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Atau Catat Kontak Untuk Invoice Toko
                </span>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #E5E7EB', zIndex: 0 }} />
              </div>

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
                      <Send size={16} /> SIMPAN &amp; FORWARD KE WHATSAPP
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
                {settings?.whatsappEnabled !== false && (
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
                      <div className="modal-option-title">WhatsApp Admin</div>
                      <div className="modal-option-desc">Order otomatis dengan format pesan siap kirim</div>
                    </div>
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
