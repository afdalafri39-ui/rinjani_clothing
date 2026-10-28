'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, Filter, Eye, Trash2, X, ChevronDown, ChevronUp, Phone, Mail, User, Shirt, Palette, Layers, Printer, FileText, StickyNote, Clock, Hash, CheckCircle2, AlertCircle, Package, Loader2, Download, FileImage, FileSpreadsheet } from 'lucide-react';
import { exportCustomOrdersCsv } from '@/lib/spreadsheetExport';
import SpreadsheetConfigModal from '@/components/SpreadsheetConfigModal';

const STATUS_CONFIG = {
  BARU: { label: 'Baru', color: '#3B82F6', bg: '#EFF6FF' },
  DIPROSES: { label: 'Diproses', color: '#F59E0B', bg: '#FFFBEB' },
  MOCKUP: { label: 'Mockup', color: '#8B5CF6', bg: '#F5F3FF' },
  PRODUKSI: { label: 'Produksi', color: '#F97316', bg: '#FFF7ED' },
  SELESAI: { label: 'Selesai', color: '#10B981', bg: '#ECFDF5' },
  DIBATALKAN: { label: 'Dibatalkan', color: '#EF4444', bg: '#FEF2F2' },
};

const STATUS_OPTIONS = ['BARU', 'DIPROSES', 'MOCKUP', 'PRODUKSI', 'SELESAI', 'DIBATALKAN'];

export default function AdminCustomOrdersPage() {
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
  const [previewModal, setPreviewModal] = useState(null);

  // Spreadsheet config state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [sheetWebhook, setSheetWebhook] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rc_spreadsheet_webhook_custom');
      if (saved) setSheetWebhook(saved);
    }
  }, []);

  const handleSaveWebhook = (url) => {
    setSheetWebhook(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rc_spreadsheet_webhook_custom', url);
    }
  };

  const downloadFileAsPng = (fileUrl, fileName) => {
    if (!fileUrl) {
      alert('File gambar tidak tersedia untuk diunduh.');
      return;
    }

    let downloadName = fileName || 'desain-custom.png';
    if (!/\.(png|jpe?g|webp|svg)$/i.test(downloadName)) {
      downloadName += '.png';
    } else if (!/\.png$/i.test(downloadName)) {
      downloadName = downloadName.replace(/\.[^/.]+$/, '.png');
    }

    if (fileUrl.startsWith('data:image/svg+xml') || fileUrl.endsWith('.svg')) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1200;
        canvas.height = img.naturalHeight || 1200;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = fileUrl;
      return;
    }

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewModal) {
        setPreviewModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModal]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/custom-orders?status=${statusFilter}&limit=100`);
      const data = await res.json();
      setOrders(data.orders || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data?.settings?.customOrdersSheetWebhook) {
        setSheetWebhook(data.settings.customOrdersSheetWebhook);
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

  const handleSaveWebhook = async (newUrl) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customOrdersSheetWebhook: newUrl }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan URL');
    setSheetWebhook(newUrl);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/custom-orders/${orderId}`, {
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
      const res = await fetch(`/api/custom-orders/${orderId}`, { method: 'DELETE' });
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
      await fetch(`/api/custom-orders/${orderId}`, {
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

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      // Pre-fill admin notes
      const order = orders.find(o => o.id === orderId);
      if (order && !adminNotes[orderId] && adminNotes[orderId] !== '') {
        setAdminNotes(prev => ({ ...prev, [orderId]: order.adminNotes || '' }));
      }
    }
  };

  const parseSizes = (sizesStr) => {
    try {
      return JSON.parse(sizesStr || '{}');
    } catch {
      return {};
    }
  };

  const parseDesignFiles = (filesStr) => {
    try {
      const parsed = JSON.parse(filesStr || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => {
        if (typeof item === 'string') {
          const isData = item.startsWith('data:') || item.startsWith('/') || item.startsWith('http');
          return {
            name: item.split('/').pop() || 'desain.png',
            url: isData ? item : null,
            type: 'image/png',
            isImage: true,
          };
        }
        return {
          name: item.name || 'desain.png',
          size: item.size || null,
          type: item.type || 'image/png',
          url: item.dataUrl || item.url || null,
          isImage: item.isImage ?? (!item.name?.endsWith('.pdf')),
        };
      });
    } catch {
      return [];
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
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.garmentModel.toLowerCase().includes(q)
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
            Pesanan Custom Order
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#666', margin: '4px 0 0 0' }}>
            Data customer dan spesifikasi pakaian konveksi dari formulir kustomisasi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => exportCustomOrdersCsv(filteredOrders)}
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
        {STATUS_OPTIONS.map(status => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              className={`co-stats-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
              style={statusFilter === status ? { borderColor: cfg.color, color: cfg.color } : {}}
            >
              <span className="co-stats-pill-label">{cfg.label}</span>
              <span className="co-stats-pill-count" style={statusFilter === status ? { backgroundColor: cfg.bg, color: cfg.color } : {}}>
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
            placeholder="Cari nomor pesanan, nama, atau no. telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="co-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="co-search-result-count">
          {filteredOrders.length} pesanan
        </div>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="co-loading">
          <Loader2 size={24} className="spin-icon" />
          <span>Memuat data pesanan...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="co-empty">
          <ClipboardList size={48} />
          <h3>Belum Ada Pesanan Custom</h3>
          <p>Pesanan dari halaman custom order akan muncul di sini secara otomatis.</p>
        </div>
      ) : (
        <div className="co-orders-list">
          {filteredOrders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.BARU;
            const isExpanded = expandedOrder === order.id;
            const sizes = parseSizes(order.sizes);
            const files = parseDesignFiles(order.designFiles);
            const sizeEntries = Object.entries(sizes).filter(([, q]) => q > 0);

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
                      <span className="co-order-model-tag">{order.garmentModel}</span>
                      <span className="co-order-qty-tag">{order.totalQuantity} pcs</span>
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
                        <User size={15} /> Informasi Pelanggan
                      </h4>
                      <div className="co-detail-grid">
                        <div className="co-detail-item">
                          <span className="co-detail-label"><User size={12} /> Nama</span>
                          <span className="co-detail-value">{order.customerName}</span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label"><Phone size={12} /> WhatsApp</span>
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
                            <span className="co-detail-label"><Mail size={12} /> Email</span>
                            <a href={`mailto:${order.customerEmail}`} className="co-detail-value co-detail-link">
                              {order.customerEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Specs */}
                    <div className="co-detail-section">
                      <h4 className="co-detail-section-title">
                        <Shirt size={15} /> Spesifikasi Pesanan
                      </h4>
                      <div className="co-detail-grid">
                        <div className="co-detail-item">
                          <span className="co-detail-label"><Shirt size={12} /> Model</span>
                          <span className="co-detail-value">{order.garmentModel}</span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label"><Palette size={12} /> Warna</span>
                          <span className="co-detail-value">
                            {order.colorHex && (
                              <span
                                className="co-color-dot"
                                style={{ backgroundColor: order.colorHex }}
                              />
                            )}
                            {order.color}
                          </span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label"><Layers size={12} /> Kain</span>
                          <span className="co-detail-value">
                            {order.fabric}
                            {order.fabricWeight && <span className="co-detail-sub">({order.fabricWeight})</span>}
                          </span>
                        </div>
                        <div className="co-detail-item">
                          <span className="co-detail-label"><Printer size={12} /> Cetak</span>
                          <span className="co-detail-value">{order.printingMethod}</span>
                        </div>
                      </div>

                      {/* Sizes */}
                      {sizeEntries.length > 0 && (
                        <div className="co-sizes-display">
                          <span className="co-detail-label" style={{ marginBottom: '8px', display: 'block' }}>Ukuran & Jumlah:</span>
                          <div className="co-sizes-tags">
                            {sizeEntries.map(([size, qty]) => {
                              const isAbove = ['3XL', '4XL', '5XL', 'XXXL', 'XXXXL'].includes(String(size).toUpperCase().trim());
                              return (
                                <span
                                  key={size}
                                  className="co-size-tag"
                                  style={isAbove ? { borderColor: '#fde68a', background: '#fffbeb' } : {}}
                                >
                                  {size} <strong>×{qty}</strong>
                                  {isAbove && <small style={{ color: '#d97706', fontWeight: 700, marginLeft: 4 }}>(+5k)</small>}
                                </span>
                              );
                            })}
                            <span className="co-size-total">Total: <strong>{order.totalQuantity} pcs</strong></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes & Files */}
                    {(order.notes || files.length > 0) && (
                      <div className="co-detail-section">
                        <h4 className="co-detail-section-title">
                          <FileText size={15} /> Catatan & File Desain
                        </h4>
                        {order.notes && (
                          <div className="co-notes-box">
                            <StickyNote size={14} />
                            <p>{order.notes}</p>
                          </div>
                        )}
                        {files.length > 0 && (
                          <div className="co-files-grid">
                            {files.map((file, i) => (
                              <div key={i} className="co-file-card">
                                <div
                                  className="co-file-card-preview"
                                  onClick={() => file.url && setPreviewModal({ file, order })}
                                  style={{ cursor: file.url ? 'pointer' : 'default' }}
                                  title={file.url ? 'Klik untuk overview' : file.name}
                                >
                                  {file.url && file.isImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={file.url} alt={file.name} className="co-file-card-img" />
                                  ) : (
                                    <FileImage size={24} className="co-file-card-icon" />
                                  )}
                                  {file.url && (
                                    <div className="co-file-card-overlay">
                                      <Eye size={14} />
                                      <span>Lihat</span>
                                    </div>
                                  )}
                                </div>

                                <div className="co-file-card-details">
                                  <div className="co-file-card-name" title={file.name}>{file.name}</div>
                                  {file.size && <div className="co-file-card-size">{(file.size / 1024).toFixed(1)} KB</div>}

                                  <div className="co-file-card-actions">
                                    {file.url ? (
                                      <>
                                        <button
                                          type="button"
                                          className="co-btn-overview"
                                          onClick={() => setPreviewModal({ file, order })}
                                          title="Lihat file langsung di website"
                                        >
                                          <Eye size={12} /> Overview
                                        </button>
                                        <button
                                          type="button"
                                          className="co-btn-download"
                                          onClick={() => downloadFileAsPng(file.url, file.name)}
                                          title="Download file sebagai PNG"
                                        >
                                          <Download size={12} /> Download PNG
                                        </button>
                                      </>
                                    ) : (
                                      <span className="co-file-no-preview">Hanya nama file</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="co-detail-section co-admin-actions-section">
                      <h4 className="co-detail-section-title">
                        <CheckCircle2 size={15} /> Kelola Pesanan
                      </h4>

                      {/* Status Change */}
                      <div className="co-status-change">
                        <span className="co-detail-label">Ubah Status:</span>
                        <div className="co-status-buttons">
                          {STATUS_OPTIONS.map(status => {
                            const sCfg = STATUS_CONFIG[status];
                            const isCurrent = order.status === status;
                            return (
                              <button
                                key={status}
                                className={`co-status-btn ${isCurrent ? 'current' : ''}`}
                                style={isCurrent ? { backgroundColor: sCfg.bg, color: sCfg.color, borderColor: sCfg.color } : {}}
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
                          Catatan Admin:
                        </label>
                        <textarea
                          id={`admin-notes-${order.id}`}
                          className="form-input form-textarea"
                          placeholder="Tambahkan catatan internal untuk pesanan ini..."
                          value={adminNotes[order.id] ?? order.adminNotes ?? ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
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
                            <span>Yakin hapus pesanan ini?</span>
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
      {/* OVERVIEW MODAL */}
      {previewModal && (
        <div className="co-modal-backdrop" onClick={() => setPreviewModal(null)}>
          <div className="co-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="co-modal-header">
              <div className="co-modal-title-group">
                <div className="co-modal-title">
                  <FileImage size={18} />
                  <span>{previewModal.file.name}</span>
                </div>
                <div className="co-modal-subtitle">
                  Pesanan <strong>#{previewModal.order.orderNumber}</strong> • {previewModal.order.customerName}
                </div>
              </div>
              <button
                type="button"
                className="co-modal-close"
                onClick={() => setPreviewModal(null)}
                aria-label="Tutup overview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="co-modal-body">
              <div className="co-modal-image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewModal.file.url}
                  alt={previewModal.file.name}
                  className="co-modal-image"
                />
              </div>
            </div>

            <div className="co-modal-footer">
              <div className="co-modal-info">
                <span className="co-order-model-tag">{previewModal.order.garmentModel}</span>
                <span className="co-order-model-tag">{previewModal.order.color}</span>
                <span className="co-order-model-tag">{previewModal.order.printingMethod}</span>
                <span className="co-order-qty-tag">{previewModal.order.totalQuantity} pcs</span>
              </div>
              <div className="co-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreviewModal(null)}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadFileAsPng(previewModal.file.url, previewModal.file.name)}
                >
                  <Download size={14} /> Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* SPREADSHEET / EXCEL CONFIG MODAL */}
      <SpreadsheetConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        type="custom"
        orders={filteredOrders}
        savedWebhookUrl={sheetWebhook}
        onSaveWebhook={handleSaveWebhook}
        onExportCsv={() => exportCustomOrdersCsv(filteredOrders)}
      />
    </div>
  );
}
