'use client';

import { useState, useRef, useEffect } from 'react';
import { FileSpreadsheet, Download, ChevronDown, Check, Loader2, Calendar, FileText } from 'lucide-react';
import {
  exportDashboardSummaryCsv,
  exportCustomOrdersCsv,
  exportProductOrdersCsv,
  getFormattedDateInfo,
} from '@/lib/spreadsheetExport';

export default function DashboardExportButton({ stats }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [successLabel, setSuccessLabel] = useState('');
  const dropdownRef = useRef(null);

  const dateInfo = getFormattedDateInfo();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerFeedback = (label) => {
    setSuccessLabel(label);
    setTimeout(() => {
      setSuccessLabel('');
    }, 3000);
  };

  const handleExportDashboard = (format = 'excel') => {
    setExporting(true);
    setDropdownOpen(false);
    try {
      exportDashboardSummaryCsv(stats, format);
      triggerFeedback(format === 'excel' ? 'Excel Dashboard terunduh!' : 'CSV Dashboard terunduh!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Terjadi kesalahan saat mengunduh data dashboard.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCustomOrders = async (format = 'excel') => {
    setExporting(true);
    setDropdownOpen(false);
    try {
      const res = await fetch('/api/custom-orders?status=ALL&limit=1000');
      const data = await res.json();
      const orders = data.orders || stats?.recentCustomOrders || [];
      exportCustomOrdersCsv(orders, format);
      triggerFeedback('Pesanan Custom terunduh!');
    } catch (err) {
      console.error('Export custom orders error:', err);
      alert('Gagal mengambil data pesanan custom.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportProductOrders = async (format = 'excel') => {
    setExporting(true);
    setDropdownOpen(false);
    try {
      const res = await fetch('/api/product-orders?status=ALL&limit=1000');
      const data = await res.json();
      const orders = data.orders || [];
      exportProductOrdersCsv(orders, format);
      triggerFeedback('Pesanan Produk terunduh!');
    } catch (err) {
      console.error('Export product orders error:', err);
      alert('Gagal mengambil data pesanan produk.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Main Export Button (Default: Excel bergaris rapi kesamping) */}
        <button
          type="button"
          onClick={() => handleExportDashboard('excel')}
          disabled={exporting}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: successLabel ? '#ECFDF5' : '#FFFFFF',
            borderColor: successLabel ? '#10B981' : '#CBD5E1',
            color: successLabel ? '#047857' : '#0F172A',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: '6px 0 0 6px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease',
            cursor: exporting ? 'not-allowed' : 'pointer',
          }}
          title={`Unduh Laporan Dashboard Tabel Excel Rapi (Kolom Kesamping) Periode ${dateInfo.numericDate}`}
        >
          {exporting ? (
            <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : successLabel ? (
            <Check size={16} style={{ color: '#10B981' }} />
          ) : (
            <FileSpreadsheet size={16} style={{ color: '#059669' }} />
          )}

          <span>{successLabel || (exporting ? 'Menyiapkan...' : 'Export Excel (Tabel Rapi)')}</span>
        </button>

        {/* Chevron Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={exporting}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 9px',
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0',
            backgroundColor: '#FFFFFF',
            borderColor: '#CBD5E1',
            color: '#475569',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            cursor: exporting ? 'not-allowed' : 'pointer',
          }}
          title="Pilih Format & Opsi Ekspor Lainnya"
        >
          <ChevronDown
            size={14}
            style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '320px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header Baris Tanggal Kesamping */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>
              <Calendar size={13} style={{ color: '#059669' }} />
              <span>PERIODE: {dateInfo.numericDate} ({dateInfo.monthYearText})</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '2px' }}>
              Format tabel horizontal kesamping (tanpa baris menurun)
            </div>
          </div>

          <div style={{ padding: '6px' }}>
            {/* OPSI 1: EXCEL (.XLS) DASHBOARD */}
            <button
              type="button"
              onClick={() => handleExportDashboard('excel')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <FileSpreadsheet size={16} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                  Excel Rekap Dashboard (.xls)
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                  Tabel bergaris rapi, header warna, kolom kesamping
                </div>
              </div>
            </button>

            {/* OPSI 2: CSV DASHBOARD */}
            <button
              type="button"
              onClick={() => handleExportDashboard('csv')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <FileText size={16} style={{ color: '#0284C7', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                  CSV Rekap Dashboard (.csv)
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                  Format universal untuk Google Sheets / Excel
                </div>
              </div>
            </button>

            <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 6px' }} />

            {/* OPSI 3: PESANAN CUSTOM */}
            <button
              type="button"
              onClick={() => handleExportCustomOrders('excel')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Download size={16} style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                  Tabel Pesanan Custom Konveksi
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                  19 kolom horizontal: customer, spek, ukuran, qty
                </div>
              </div>
            </button>

            {/* OPSI 4: PESANAN PRODUK */}
            <button
              type="button"
              onClick={() => handleExportProductOrders('excel')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Download size={16} style={{ color: '#D97706', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                  Tabel Pesanan Produk (Shop)
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                  16 kolom horizontal: customer, produk, harga, total
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
