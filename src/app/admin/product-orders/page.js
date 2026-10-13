'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  User,
  Package,
  Clock,
  Hash,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Tag,
  Banknote,
  StickyNote,
} from 'lucide-react';
import { exportProductOrdersCsv } from '@/lib/spreadsheetExport';
import SpreadsheetConfigModal from '@/components/SpreadsheetConfigModal';
import { formatPrice } from '@/lib/utils';

const STATUS_CONFIG = {
  BARU: { label: 'Baru', color: '#3B82F6', bg: '#EFF6FF' },
  DIPROSES: { label: 'Diproses', color: '#F59E0B', bg: '#FFFBEB' },
  DIKIRIM: { label: 'Dikirim', color: '#8B5CF6', bg: '#F5F3FF' },
  SELESAI: { label: 'Selesai', color: '#10B981', bg: '#ECFDF5' },
  DIBATALKAN: { label: 'Dibatalkan', color: '#EF4444', bg: '#FEF2F2' },
};

const STATUS_OPTIONS = ['BARU', 'DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'];

export default function AdminProductOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusCounts, setStatusCounts] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [savingNotes, setSavingNotes] = useState(null);

  // Spreadsheet config state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [sheetWebhook, setSheetWebhook] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/product-orders?status=${statusFilter}&limit=100`);
      const data = await res.json();
      setOrders(data.orders || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      console.error('Fetch product orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load site settings to get productOrdersSheetWebhook
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data?.settings?.productOrdersSheetWebhook) {
        setSheetWebhook(data.settings.productOrdersSheetWebhook);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/product-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setDeletingOrder(orderId);
    try {
      const res = await fetch(`/api/product-orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirm(null);
        await fetchOrders();
      }
    } catch (err) {
      console.error('Delete order error:', err);
    } finally {
      setDeletingOrder(null);
    }
  };

  const handleSaveAdminNotes = async (orderId) => {
    setSavingNotes(orderId);
    try {
      await fetch(`/api/product-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: adminNotes[orderId] || '' }),
      });
      await fetchOrders();
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setSavingNotes(null);
    }
  };

  const handleSaveWebhook = async (newUrl) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productOrdersSheetWebhook: newUrl }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan URL');
    setSheetWebhook(newUrl);
  };

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      const order = orders.find((o) => o.id === orderId);
      if (order && !adminNotes[orderId] && adminNotes[orderId] !== '') {
        setAdminNotes((prev) => ({ ...prev, [orderId]: order.adminNotes || '' }));
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter by search
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.productName.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* TOOLBAR HEADER WITH SPREADSHEET CONFIG & EXPORT BUTTONS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#111' }}>
            Pesanan Produk (Shop)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#666', margin: '4px 0 0 0' }}>
            Data customer dan rekapan pesanan pakaian reguler dari katalog shop.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => exportProductOrdersCsv(filteredOrders)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Download data pesanan dalam format Excel CSV"
          >
            <Download size={15} />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setConfigModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: '#10B981',
              color: '#047857',
              backgroundColor: '#ECFDF5',
            }}
            title="Konfigurasi integrasi Google Sheets & Webhook"
          >
            <FileSpreadsheet size={15} />
            <span>Config Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* STATS PILLS */}
      <div className="co-stats-row">
        <button
          className={`co-stats-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          <span className="co-stats-pill-label">Semua</span>
          <span className="co-stats-pill-count">{statusCounts.ALL || 0}</span>
        </button>
        {STATUS_OPTIONS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              className={`co-stats-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
              style={statusFilter === status ? { borderColor: cfg.color, color: cfg.color } : {}}
            >
              <span className="co-stats-pill-label">{cfg.label}</span>
              <span
                className="co-stats-pill-count"
                style={statusFilter === status ? { backgroundColor: cfg.bg, color: cfg.color } : {}}
              >
                {statusCounts[status] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR */}
      <div className="co-search-bar">
        <div className="co-search-input-wrapper">
          <Search size={16} className="co-search-icon" />
          <input
            type="text"
            className="co-search-input"
            placeholder="Cari nomor PO, nama pemesan, no. WhatsApp, atau produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="co-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="co-search-result-count">{filteredOrders.length} pesanan produk</div>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="co-loading">
          <Loader2 size={24} className="spin-icon" />
          <span>Memuat data pesanan produk...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="co-empty">
          <ShoppingBag size={48} />
          <h3>Belum Ada Pesanan Produk</h3>
          <p>
            Pesanan dari pelanggan di halaman produk shop akan otomatis tersimpan dan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="co-orders-list">
          {filteredOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.BARU;
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className={`co-order-card ${isExpanded ? 'expanded' : ''}`}>
                {/* Order Header */}
                <div className="co-order-header" onClick={() => toggleExpand(order.id)}>
                  <div className="co-order-header-left">
                    <div className="co-order-number">
                      <Hash size={14} />
                      {order.orderNumber}
                    </div>
                    <div className="co-order-customer">
                      <User size={13} />
                      {order.customerName}
                    </div>
                    <div className="co-order-date">
                      <Clock size={13} />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="co-order-header-right">
                    <div className="co-order-summary-brief">
                      <span className="co-order-model-tag" style={{ color: '#111', fontWeight: 600 }}>
                        {order.productName}
                      </span>
                      <span className="co-order-qty-tag">{order.quantity} pcs</span>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: '#FF3D00',
                          padding: '2px 8px',
                          backgroundColor: '#FFF5F2',
                          borderRadius: '4px',
                        }}
                      >
                        {formatPrice(order.totalPrice || order.price * order.quantity)}
                      </span>
                    </div>
                    <span
                      className="co-order-status-badge"
                      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <button className="co-order-expand-btn">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="co-order-details">
                    {/* Customer Info */}
                    <div className="co-detail-section">
                      <h4 className="co-detail-section-title">
                        <User size={15} /> Informasi Customer
                      </h4>
                      <div className="co-detail-grid">
                        <div className="co-detail-item">
                          <span className="co-detail-label">
                            <User size={12} /> Nama Lengkap
                          </span>
                          <span className="co-detail-value">{order.customerName}</span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label">
                            <Phone size={12} /> WhatsApp
                          </span>
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="co-detail-value co-detail-link"
                          >
                            {order.customerPhone}
                          </a>
                        </div>
                        {order.customerEmail && (
                          <div className="co-detail-item">
                            <span className="co-detail-label">
                              <Mail size={12} /> Email
                            </span>
                            <a href={`mailto:${order.customerEmail}`} className="co-detail-value co-detail-link">
                              {order.customerEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Specs */}
                    <div className="co-detail-section">
                      <h4 className="co-detail-section-title">
                        <Package size={15} /> Detail Item Produk
                      </h4>
                      <div className="co-detail-grid">
                        <div className="co-detail-item">
                          <span className="co-detail-label">
                            <Tag size={12} /> Produk
                          </span>
                          <span className="co-detail-value">
                            {order.productName}{' '}
                            {order.productSlug && (
                              <Link
                                href={`/product/${order.productSlug}`}
                                target="_blank"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  fontSize: '0.75rem',
                                  color: '#2563EB',
                                  marginLeft: '4px',
                                }}
                              >
                                Lihat <ExternalLink size={10} />
                              </Link>
                            )}
                          </span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label">Ukuran</span>
                          <span className="co-detail-value">{order.size || '-'}</span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label">Warna</span>
                          <span className="co-detail-value">{order.color || '-'}</span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label">Jumlah</span>
                          <span className="co-detail-value">
                            <strong>{order.quantity}</strong> pcs
                          </span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label">
                            <Banknote size={13} style={{ color: '#059669' }} /> Harga Satuan (Rp)
                          </span>
                          <span className="co-detail-value">{formatPrice(order.price)}</span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label">
                            <Banknote size={13} style={{ color: '#059669' }} /> Total Pembayaran (Rp)
                          </span>
                          <span className="co-detail-value" style={{ color: '#FF3D00', fontWeight: 700 }}>
                            {formatPrice(order.totalPrice || order.price * order.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    {order.notes && (
                      <div className="co-detail-section">
                        <h4 className="co-detail-section-title">
                          <StickyNote size={15} /> Catatan dari Customer
                        </h4>
                        <div className="co-notes-box">
                          <StickyNote size={14} />
                          <p>{order.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="co-detail-section co-admin-actions-section">
                      <h4 className="co-detail-section-title">
                        <CheckCircle2 size={15} /> Kelola Status Pesanan
                      </h4>

                      {/* Status Change Buttons */}
                      <div className="co-status-change">
                        <span className="co-detail-label">Ubah Status:</span>
                        <div className="co-status-buttons">
                          {STATUS_OPTIONS.map((status) => {
                            const sCfg = STATUS_CONFIG[status];
                            const isCurrent = order.status === status;
                            return (
                              <button
                                key={status}
                                className={`co-status-btn ${isCurrent ? 'current' : ''}`}
                                style={
                                  isCurrent
                                    ? {
                                        backgroundColor: sCfg.bg,
                                        color: sCfg.color,
                                        borderColor: sCfg.color,
                                      }
                                    : {}
                                }
                                onClick={() => !isCurrent && handleStatusChange(order.id, status)}
                                disabled={isCurrent || updatingStatus === order.id}
                              >
                                {updatingStatus === order.id && (
                                  <Loader2 size={12} className="spin-icon" />
                                )}
                                {sCfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Admin Notes */}
                      <div className="co-admin-notes">
                        <label className="co-detail-label" htmlFor={`admin-notes-${order.id}`}>
                          Catatan Internal Admin:
                        </label>
                        <textarea
                          id={`admin-notes-${order.id}`}
                          className="form-input form-textarea"
                          placeholder="Tambahkan catatan nomor resi, konfirmasi pembayaran, dll..."
                          value={adminNotes[order.id] ?? order.adminNotes ?? ''}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          rows={2}
                        />
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleSaveAdminNotes(order.id)}
                          disabled={savingNotes === order.id}
                          style={{ marginTop: '8px' }}
                        >
                          {savingNotes === order.id ? 'Menyimpan...' : 'Simpan Catatan'}
                        </button>
                      </div>

                      {/* Delete */}
                      <div className="co-delete-area">
                        {deleteConfirm === order.id ? (
                          <div className="co-delete-confirm">
                            <AlertCircle size={16} />
                            <span>Yakin hapus pesanan produk ini?</span>
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: '#EF4444', color: '#FFF' }}
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deletingOrder === order.id}
                            >
                              {deletingOrder === order.id ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            className="co-delete-btn"
                            onClick={() => setDeleteConfirm(order.id)}
                          >
                            <Trash2 size={14} /> Hapus Pesanan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SPREADSHEET / EXCEL CONFIG MODAL */}
      <SpreadsheetConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        type="product"
        orders={filteredOrders}
        savedWebhookUrl={sheetWebhook}
        onSaveWebhook={handleSaveWebhook}
        onExportCsv={() => exportProductOrdersCsv(filteredOrders)}
      />
    </div>
  );
}
