'use client';

import { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  Save,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  GOOGLE_APPS_SCRIPT_CUSTOM_ORDERS,
  GOOGLE_APPS_SCRIPT_PRODUCT_ORDERS,
} from '@/lib/spreadsheetExport';

export default function SpreadsheetConfigModal({
  isOpen,
  onClose,
  type = 'custom', // 'custom' or 'product'
  orders = [],
  savedWebhookUrl = '',
  onSaveWebhook,
  onExportCsv,
}) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { success: boolean, message: string }
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'guide' | 'export'

  const isCustom = type === 'custom';
  const title = isCustom ? 'Pesanan Custom' : 'Pesanan Produk';
  const scriptCode = isCustom
    ? GOOGLE_APPS_SCRIPT_CUSTOM_ORDERS
    : GOOGLE_APPS_SCRIPT_PRODUCT_ORDERS;

  useEffect(() => {
    if (isOpen) {
      const cached =
        typeof window !== 'undefined'
          ? localStorage.getItem(`rc_spreadsheet_webhook_${type}`) ||
            sessionStorage.getItem(`rc_spreadsheet_webhook_${type}`)
          : '';
      setWebhookUrl(savedWebhookUrl || cached || '');
      setSyncStatus(null);
      setCopied(false);
    }
  }, [isOpen, savedWebhookUrl, type]);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWebhookChange = (val) => {
    setWebhookUrl(val);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`rc_spreadsheet_webhook_${type}`, val);
        localStorage.setItem(`rc_spreadsheet_webhook_${type}`, val);
      } catch (err) {
        console.error('Storage error:', err);
      }
    }
  };

  const handleSave = async () => {
    const trimmed = webhookUrl.trim();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`rc_spreadsheet_webhook_${type}`, trimmed);
        sessionStorage.setItem(`rc_spreadsheet_webhook_${type}`, trimmed);
      } catch (err) {
        console.error(err);
      }
    }

    if (onSaveWebhook) {
      setSaving(true);
      setSyncStatus(null);
      try {
        await onSaveWebhook(trimmed);
        setSyncStatus({ success: true, message: 'URL Webhook berhasil disimpan & dijaga di memori sesi!' });
      } catch (err) {
        console.error(err);
        setSyncStatus({ success: false, message: 'Gagal menyimpan URL Webhook.' });
      } finally {
        setSaving(false);
      }
    } else {
      setSyncStatus({ success: true, message: 'URL Webhook berhasil disimpan di memori lokal & sesi!' });
    }
  };

  const handleSyncNow = async () => {
    const url = webhookUrl.trim();
    if (!url) {
      setSyncStatus({ success: false, message: 'Masukkan URL Webhook Google Sheets terlebih dahulu.' });
      return;
    }

    setSyncing(true);
    setSyncStatus(null);

    try {
      // Mengirim POST ke Google Apps Script Web App
      // Menggunakan mode 'no-cors' jika diperlukan, namun mengirim payload JSON
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(orders),
        mode: 'no-cors',
      });

      setSyncStatus({
        success: true,
        message: `Berhasil mengirim ${orders.length} data pesanan ke Google Sheets! Silakan periksa spreadsheet Anda.`,
      });
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus({
        success: false,
        message: `Terjadi kendala saat sinkronisasi: ${err.message || 'Periksa URL Webhook Anda.'}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="co-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="co-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        {/* Header */}
        <div className="co-modal-header">
          <div className="co-modal-title-group">
            <div className="co-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={20} style={{ color: '#10B981' }} />
              <span>Integrasi Spreadsheet / Excel</span>
            </div>
            <div className="co-modal-subtitle">
              Konfigurasi sinkronisasi & ekspor data <strong>{title}</strong>
            </div>
          </div>
          <button type="button" className="co-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-gray-200)',
            backgroundColor: '#F9FAFB',
            padding: '0 16px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            style={{
              padding: '12px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'sync' ? '2px solid #111' : '2px solid transparent',
              color: activeTab === 'sync' ? '#111' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} /> Sinkronisasi Google Sheets
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            style={{
              padding: '12px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'export' ? '2px solid #111' : '2px solid transparent',
              color: activeTab === 'export' ? '#111' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} /> Ekspor Excel / CSV
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '12px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'guide' ? '2px solid #111' : '2px solid transparent',
              color: activeTab === 'guide' ? '#111' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HelpCircle size={14} /> Panduan Setup Script
          </button>
        </div>

        {/* Modal Body */}
        <div className="co-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '20px' }}>
          {/* TAB 1: SYNC GOOGLE SHEETS */}
          {activeTab === 'sync' && (
            <div>
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <FileSpreadsheet size={22} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8125rem', color: '#065F46', lineHeight: 1.5 }}>
                  <strong>Sinkronisasi Otomatis ke Google Sheets</strong>
                  <br />
                  Data {title.toLowerCase()} dapat langsung disinkronkan ke dokumen Google Spreadsheet Anda
                  menggunakan Google Apps Script Web App.
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: '#333',
                  }}
                  htmlFor="sheet-webhook-input"
                >
                  URL Webhook Google Apps Script:
                </label>
                <input
                  id="sheet-webhook-input"
                  type="url"
                  className="form-input"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webhookUrl}
                  onChange={(e) => handleWebhookChange(e.target.value)}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>
                  Belum punya URL? Buka tab <strong>Panduan Setup Script</strong> untuk melihat cara membuatnya dalam 2 menit.
                </span>
              </div>

              {syncStatus && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: syncStatus.success ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${syncStatus.success ? '#BBF7D0' : '#FECACA'}`,
                    color: syncStatus.success ? '#15803D' : '#B91C1C',
                  }}
                >
                  {syncStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{syncStatus.message}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSave}
                  disabled={saving || syncing}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? <Loader2 size={14} className="spin-icon" /> : <Save size={14} />}
                  <span>Simpan URL Webhook</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSyncNow}
                  disabled={syncing || !webhookUrl.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {syncing ? <Loader2 size={14} className="spin-icon" /> : <RefreshCw size={14} />}
                  <span>Sinkronkan Sekarang ({orders.length} Pesanan)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT EXCEL / CSV */}
          {activeTab === 'export' && (
            <div>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '6px', color: '#111' }}>
                  Ekspor Data Offline (.CSV / Excel)
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#555', margin: 0, lineHeight: 1.5 }}>
                  Unduh seluruh daftar {title.toLowerCase()} dalam format file CSV dengan encoding UTF-8 BOM. File
                  ini dapat langsung dibuka di Microsoft Excel, Google Sheets, LibreOffice, atau software spreadsheet lainnya dengan tabel rapi tanpa karakter rusak.
                </p>
              </div>

              <div
                style={{
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '12px' }}>
                  Total data yang akan diekspor: <strong>{orders.length} baris pesanan</strong>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    if (onExportCsv) onExportCsv();
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Download size={16} /> UNDUH DATA EXCEL / CSV SEKARANG
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#444', lineHeight: 1.6, marginBottom: '16px' }}>
                Ikuti langkah mudah berikut untuk menghubungkan spreadsheet Google Sheets Anda secara gratis:
              </div>

              <ol
                style={{
                  fontSize: '0.8125rem',
                  color: '#333',
                  paddingLeft: '20px',
                  marginBottom: '20px',
                  lineHeight: 1.8,
                }}
              >
                <li>
                  Buka dokumen baru di{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2563EB', textDecoration: 'underline' }}
                  >
                    Google Sheets (sheets.new) <ExternalLink size={11} style={{ display: 'inline' }} />
                  </a>
                </li>
                <li>Pada menu bar atas Google Sheets, klik <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.</li>
                <li>Hapus kode bawaan, lalu salin dan tempel kode script di bawah ini.</li>
                <li>Klik tombol <strong>Deploy &gt; New deployment</strong> di pojok kanan atas.</li>
                <li>Pilih icon gerigi &gt; <strong>Web app</strong>.</li>
                <li>Atur <strong>Execute as: Me</strong> dan <strong>Who has access: Anyone</strong>.</li>
                <li>Klik <strong>Deploy</strong>, lalu salin <strong>Web App URL</strong> yang dihasilkan.</li>
                <li>Kembali ke tab <strong>Sinkronisasi</strong> dan tempelkan URL tersebut!</li>
              </ol>

              <div style={{ position: 'relative', marginTop: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#1E293B',
                    color: '#E2E8F0',
                    padding: '8px 12px',
                    borderRadius: '6px 6px 0 0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <span>Google Apps Script Kode ({title})</span>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: 'none',
                      color: '#FFF',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copied ? <Check size={12} style={{ color: '#4ADE80' }} /> : <Copy size={12} />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>

                <pre
                  style={{
                    margin: 0,
                    padding: '12px',
                    backgroundColor: '#0F172A',
                    color: '#94A3B8',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    maxHeight: '220px',
                    borderRadius: '0 0 6px 6px',
                    lineHeight: 1.5,
                  }}
                >
                  {scriptCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="co-modal-footer">
          <div style={{ fontSize: '0.75rem', color: '#666' }}>
            {type === 'custom' ? 'Pesanan Custom Apparel' : 'Pesanan Katalog Shop'}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
