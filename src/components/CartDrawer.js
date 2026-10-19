'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Loader2,
  FileText,
  User,
  Phone,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, generateWhatsAppUrl } from '@/lib/utils';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    toastMessage,
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'form' | 'success'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastOrderInfo, setLastOrderInfo] = useState(null);

  // Fetch store settings for WhatsApp phone number
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error('Fetch settings error:', err));
  }, []);

  // Reset checkout step when drawer is closed
  useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => {
        setCheckoutStep('cart');
        setErrorMessage('');
      }, 300);
    }
  }, [isCartOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Build comprehensive WhatsApp order message
  const buildWhatsAppCartMessage = (name, phone, notes) => {
    const itemsText = cart
      .map((item, idx) => {
        const itemType = item.type === 'custom' ? 'CUSTOM ORDER' : 'PRODUK READY';
        const subtotal = (item.price || 0) * (item.quantity || 1);

        let details = '';
        if (item.type === 'custom') {
          const sizeInfo =
            item.sizes && typeof item.sizes === 'object'
              ? Object.entries(item.sizes)
                  .filter(([, q]) => q > 0)
                  .map(([s, q]) => `${s}: ${q}pcs`)
                  .join(', ')
              : item.selectedSize || '-';

          details = [
            `   • Warna: ${item.selectedColor || '-'}`,
            `   • Kain: ${item.fabric || '-'}`,
            `   • Cetak: ${item.printingMethod || '-'}`,
            `   • Ukuran: ${sizeInfo || '-'}`,
            item.notes ? `   • Catatan: ${item.notes}` : null,
            item.designFiles && item.designFiles.length > 0
              ? `   • File: ${item.designFiles.join(', ')}`
              : null,
          ]
            .filter(Boolean)
            .join('\n');
        } else {
          details = [
            `   • Ukuran: ${item.selectedSize || '-'}`,
            `   • Warna: ${item.selectedColor || '-'}`,
          ].join('\n');
        }

        return `${idx + 1}. *${item.name}* (${itemType})\n${details}\n   • Unit: ${item.quantity} pcs x ${formatPrice(item.price)} = *${formatPrice(subtotal)}*`;
      })
      .join('\n\n');

    return `Halo Rinjani Clothing,

Saya ingin memesan unit dari Keranjang Belanja Rinjani Clothing:

👤 Nama: ${name}
📱 WhatsApp: ${phone}
${notes ? `📝 Catatan Pengiriman: ${notes}\n` : ''}
📦 RINCIAN PESANAN (${totalItems} pcs):
----------------------------------------
${itemsText}
----------------------------------------
💰 TOTAL KESELURUHAN: *${formatPrice(totalPrice)}* (${totalItems} pcs)

Mohon konfirmasi pesanan dan ketersediaan stok/slot pengerjaan. Terima kasih!`;
  };

  // Submit orders to database and open WhatsApp
  const handleProceedToWhatsApp = async (e) => {
    e?.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('Nama lengkap pemesan wajib diisi.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Nomor WhatsApp aktif wajib diisi.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();
    const trimmedNotes = shippingNotes.trim();

    try {
      // Record orders in background for admin dashboard
      const recordedOrders = [];

      for (const item of cart) {
        if (item.type === 'custom') {
          try {
            const res = await fetch('/api/custom-orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerName: trimmedName,
                customerPhone: trimmedPhone,
                garmentModel: item.name,
                color: item.selectedColor || '-',
                colorHex: item.colorHex || null,
                fabric: item.fabric || '-',
                printingMethod: item.printingMethod || '-',
                sizes: item.sizes || { [item.selectedSize || 'All']: item.quantity },
                totalQuantity: item.quantity || 1,
                notes: item.notes || trimmedNotes || null,
                designFiles: item.designFiles || [],
              }),
            });
            const data = await res.json();
            if (data?.orderNumber) recordedOrders.push(data.orderNumber);
          } catch (err) {
            console.error('Record custom order err:', err);
          }
        } else {
          try {
            const rawPrice = item.price || 0;
            const qty = item.quantity || 1;
            const res = await fetch('/api/product-orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerName: trimmedName,
                customerPhone: trimmedPhone,
                productName: item.name,
                productSlug: item.slug || null,
                price: rawPrice,
                quantity: qty,
                size: item.selectedSize || '-',
                color: item.selectedColor || '-',
                totalPrice: rawPrice * qty,
                notes: trimmedNotes || null,
              }),
            });
            const data = await res.json();
            if (data?.orderNumber) recordedOrders.push(data.orderNumber);
          } catch (err) {
            console.error('Record product order err:', err);
          }
        }
      }

      // Generate WhatsApp URL
      const targetPhone = settings?.whatsappNumber || '6281369876282';
      const waMessage = buildWhatsAppCartMessage(trimmedName, trimmedPhone, trimmedNotes);
      const waUrl = generateWhatsAppUrl(targetPhone, waMessage);

      // Open WhatsApp chat in a new tab
      window.open(waUrl, '_blank');

      // Update state
      setLastOrderInfo({
        name: trimmedName,
        phone: trimmedPhone,
        totalItems,
        totalPrice,
      });

      // Clear cart
      clearCart();
      setCheckoutStep('success');
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden={!isCartOpen}
      />

      {/* Drawer Panel */}
      <aside
        className={`cart-drawer-panel ${isCartOpen ? 'open' : ''}`}
        aria-label="Keranjang Pesanan"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-wrap">
            <ShoppingBag size={20} />
            <h2 className="cart-drawer-title">KERANJANG PESANAN</h2>
            {totalItems > 0 && (
              <span className="cart-drawer-badge">{totalItems} pcs</span>
            )}
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Tutup Keranjang"
          >
            <X size={20} />
          </button>
        </div>

        {/* ============================================================ */}
        {/* 1. CART ITEMS LIST VIEW */}
        {/* ============================================================ */}
        {checkoutStep === 'cart' && (
          <>
            <div className="cart-drawer-body">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">
                    <ShoppingBag size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="cart-empty-title">Keranjang Anda Masih Kosong</h3>
                  <p className="cart-empty-desc">
                    Pilih produk siap pakai dari katalog shop atau sesuaikan spesifikasi pakaian custom untuk menyimpannya di sini.
                  </p>
                  <div className="cart-empty-actions">
                    <Link
                      href="/shop"
                      className="btn btn-secondary btn-full"
                      onClick={() => setIsCartOpen(false)}
                    >
                      JELAJAHI KATALOG SHOP
                    </Link>
                    <Link
                      href="/custom"
                      className="btn btn-primary btn-full"
                      onClick={() => setIsCartOpen(false)}
                    >
                      BUAT CUSTOM APPAREL
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((item) => {
                    const isCustom = item.type === 'custom';
                    const itemSubtotal = (item.price || 0) * (item.quantity || 1);

                    return (
                      <div key={item.id} className="cart-item-card">
                        {/* Thumbnail */}
                        <div className="cart-item-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              item.image ||
                              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80&fm=webp'
                            }
                            alt={item.name}
                            loading="lazy"
                          />
                          {isCustom && item.colorHex && (
                            <div
                              className="cart-item-color-tint"
                              style={{
                                backgroundColor: item.colorHex,
                                mixBlendMode: 'multiply',
                                opacity: 0.6,
                              }}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="cart-item-info">
                          <div className="cart-item-top">
                            <span
                              className={`cart-item-type-tag ${isCustom ? 'custom' : 'product'}`}
                            >
                              {isCustom ? 'CUSTOM ORDER' : 'PRODUK READY'}
                            </span>
                            <button
                              type="button"
                              className="cart-item-remove-btn"
                              onClick={() => removeFromCart(item.id)}
                              title="Hapus dari keranjang"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <h4 className="cart-item-name">{item.name}</h4>

                          {/* Specifics */}
                          <div className="cart-item-specs">
                            {isCustom ? (
                              <>
                                <div className="spec-line">
                                  <span>Warna: <strong>{item.selectedColor || '-'}</strong></span>
                                  <span>• Bahan: <strong>{item.fabric || '-'}</strong></span>
                                </div>
                                <div className="spec-line">
                                  <span>Metode: <strong>{item.printingMethod || '-'}</strong></span>
                                </div>
                                {item.sizes && typeof item.sizes === 'object' && (
                                  <div className="spec-sizes-breakdown">
                                    {Object.entries(item.sizes)
                                      .filter(([, q]) => q > 0)
                                      .map(([s, q]) => (
                                        <span key={s} className="size-pill">
                                          {s}: {q}pcs
                                        </span>
                                      ))}
                                  </div>
                                )}
                                {item.notes && (
                                  <div className="spec-note">
                                    📝 <em>{item.notes}</em>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="spec-line">
                                <span>Ukuran: <strong>{item.selectedSize || '-'}</strong></span>
                                <span>• Warna: <strong>{item.selectedColor || '-'}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Price & Stepper Row */}
                          <div className="cart-item-bottom">
                            <div className="cart-item-price-col">
                              <span className="cart-item-unit-price">
                                {formatPrice(item.price)} / pcs
                              </span>
                              <span className="cart-item-subtotal">
                                {formatPrice(itemSubtotal)}
                              </span>
                            </div>

                            <div className="cart-item-stepper">
                              <button
                                type="button"
                                className="stepper-action-btn"
                                onClick={() =>
                                  updateQuantity(item.id, (item.quantity || 1) - 1)
                                }
                                title="Kurangi 1 pcs"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="stepper-quantity">
                                {item.quantity || 1}
                              </span>
                              <button
                                type="button"
                                className="stepper-action-btn"
                                onClick={() =>
                                  updateQuantity(item.id, (item.quantity || 1) + 1)
                                }
                                title="Tambah 1 pcs"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with checkout action */}
            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-box">
                  <div className="cart-summary-row">
                    <span className="summary-label">Total Unit:</span>
                    <span className="summary-val">{totalItems} pcs</span>
                  </div>
                  <div className="cart-summary-row total-row">
                    <span className="summary-label">Total Estimasi:</span>
                    <span className="summary-val total-val">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="cart-wa-guarantee">
                  <ShieldCheck size={16} />
                  <span>Pemesanan diproses langsung via WhatsApp Admin resmi. Tanpa biaya admin tambahan.</span>
                </div>

                <div className="cart-footer-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-full cart-checkout-btn"
                    onClick={() => setCheckoutStep('form')}
                  >
                    <Send size={16} />
                    <span>CHECKOUT VIA WHATSAPP ({totalItems} PCS)</span>
                  </button>

                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={clearCart}
                  >
                    <RotateCcw size={13} /> Kosongkan Keranjang
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* 2. CUSTOMER FORM VIEW (QUICK NAME & WHATSAPP)                 */}
        {/* ============================================================ */}
        {checkoutStep === 'form' && (
          <form className="cart-drawer-form" onSubmit={handleProceedToWhatsApp}>
            <div className="cart-drawer-body">
              <div className="form-lead-card">
                <div className="form-lead-title">Konfirmasi Identitas Pemesan</div>
                <p className="form-lead-desc">
                  Isi data singkat berikut agar admin Rinjani Clothing dapat langsung memproses pesanan dan menghitung estimasi ongkir.
                </p>
              </div>

              {errorMessage && (
                <div className="cart-form-error">{errorMessage}</div>
              )}

              <div className="cart-form-group">
                <label htmlFor="customer-name" className="cart-form-label">
                  <User size={14} /> Nama Lengkap <span className="req">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  className="cart-form-input"
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="cart-form-group">
                <label htmlFor="customer-phone" className="cart-form-label">
                  <Phone size={14} /> Nomor WhatsApp Aktif <span className="req">*</span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  className="cart-form-input"
                  placeholder="Contoh: 081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="cart-form-group">
                <label htmlFor="shipping-notes" className="cart-form-label">
                  <FileText size={14} /> Kota / Alamat Pengiriman (Opsional)
                </label>
                <textarea
                  id="shipping-notes"
                  className="cart-form-textarea"
                  placeholder="Contoh: Mataram, Lombok Barat / JNE Express"
                  rows={2}
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                />
              </div>

              <div className="cart-mini-order-summary">
                <div className="mini-summary-row">
                  <span>Unit yang Dipesan:</span>
                  <strong>{totalItems} pcs</strong>
                </div>
                <div className="mini-summary-row">
                  <span>Total Estimasi Biaya:</span>
                  <strong>{formatPrice(totalPrice)}</strong>
                </div>
              </div>
            </div>

            <div className="cart-drawer-footer">
              <button
                type="submit"
                className="btn btn-primary btn-full cart-checkout-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Mempersiapkan Chat WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>KIRIM PESAN KE WHATSAPP ADMIN</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() => setCheckoutStep('cart')}
                disabled={submitting}
              >
                ← Kembali ke Daftar Item
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* 3. ORDER SUBMITTED SUCCESS VIEW                               */}
        {/* ============================================================ */}
        {checkoutStep === 'success' && (
          <div className="cart-drawer-success">
            <div className="cart-drawer-body success-body">
              <div className="success-icon-wrap">
                <CheckCircle size={56} color="#10b981" />
              </div>
              <h3 className="success-title">Pesanan Diteruskan ke WhatsApp!</h3>
              <p className="success-desc">
                Chat WhatsApp dengan Admin Rinjani Clothing telah dibuka di tab baru. Silakan kirimkan draft pesan yang telah disiapkan untuk konfirmasi pesanan Anda.
              </p>

              {lastOrderInfo && (
                <div className="success-summary-box">
                  <div className="success-row">
                    <span>Pemesan:</span>
                    <strong>{lastOrderInfo.name}</strong>
                  </div>
                  <div className="success-row">
                    <span>Total Unit:</span>
                    <strong>{lastOrderInfo.totalItems} pcs</strong>
                  </div>
                  <div className="success-row">
                    <span>Estimasi Biaya:</span>
                    <strong>{formatPrice(lastOrderInfo.totalPrice)}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="cart-drawer-footer">
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => setIsCartOpen(false)}
              >
                SELESAI & TUTUP KERANJANG
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Floating Toast Notification when item is added to cart */}
      {toastMessage && !isCartOpen && (
        <div className="cart-toast-notification">
          <div className="cart-toast-inner">
            <CheckCircle size={16} color="#10b981" />
            <span>{toastMessage}</span>
            <button
              type="button"
              className="cart-toast-btn"
              onClick={() => setIsCartOpen(true)}
            >
              Lihat Keranjang
            </button>
          </div>
        </div>
      )}
    </>
  );
}
