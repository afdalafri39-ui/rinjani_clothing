'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  DollarSign,
  FileText,
  Landmark,
  QrCode,
  Wallet,
  Banknote,
  Truck,
  Loader2,
  Check,
  X,
  Edit2,
  Upload,
  Image as ImageIcon,
  Eye,
  Download,
  ExternalLink,
  Paperclip,
  FileCheck,
} from 'lucide-react';
import {
  PAYMENT_METHODS,
  POPULAR_METHODS,
  PAYMENT_TYPES,
  getPaymentMethodInfo,
  formatPaymentDate,
  parsePaymentHistory,
  calculatePaymentSummary,
  formatFileSize,
  isImageFile,
  isPdfFile,
} from '@/lib/paymentUtils';
import { formatPrice } from '@/lib/utils';

export default function OrderPaymentHistory({
  order,
  orderType = 'product', // 'product' | 'custom'
  onUpdate,
}) {
  const [payments, setPayments] = useState(() => parsePaymentHistory(order));
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Target price override (terutama untuk custom order jika harga disepakati terpisah)
  const [isEditingTargetPrice, setIsEditingTargetPrice] = useState(false);
  const [customTargetPriceInput, setCustomTargetPriceInput] = useState(() => {
    return order.totalPrice || order.customAgreedPrice || '';
  });
  const [customTargetPrice, setCustomTargetPrice] = useState(() => {
    return order.totalPrice || order.customAgreedPrice || 0;
  });

  // Lightbox Modal Bukti Transfer
  const [activeProofModal, setActiveProofModal] = useState(null);

  // Form State Tambah Pembayaran
  const [selectedMethod, setSelectedMethod] = useState('BCA');
  const [customMethodName, setCustomMethodName] = useState('');
  const [paymentType, setPaymentType] = useState('LUNAS');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Upload Bukti Pembayaran State (di form tambah)
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileSize, setProofFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Upload Bukti Pembayaran State (langsung dari baris tabel)
  const rowFileInputRef = useRef(null);
  const [targetPaymentRowId, setTargetPaymentRowId] = useState(null);
  const [uploadingRowProofId, setUploadingRowProofId] = useState(null);

  // Sinkronisasi state saat data order berubah
  useEffect(() => {
    const parsed = parsePaymentHistory(order);
    setPayments(parsed);
    if (order.totalPrice || order.customAgreedPrice) {
      const price = Number(order.totalPrice || order.customAgreedPrice) || 0;
      setCustomTargetPrice(price);
      setCustomTargetPriceInput(price > 0 ? String(price) : '');
    }
  }, [order]);

  // Listener tombol ESC untuk menutup modal preview bukti transfer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeProofModal) {
        setActiveProofModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProofModal]);

  // Kalkulasi ringkasan pembayaran
  const summary = useMemo(() => {
    return calculatePaymentSummary(
      orderType === 'custom' && customTargetPrice > 0
        ? { ...order, totalPrice: customTargetPrice }
        : order,
      orderType === 'custom' && customTargetPrice > 0 ? customTargetPrice : null
    );
  }, [order, orderType, customTargetPrice, payments]);

  // Handle seleksi file bukti pembayaran di form
  const handleSelectProofFile = (file) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setFormError('Ukuran file bukti pembayaran maksimal 15MB.');
      return;
    }

    setProofFile(file);
    setProofFileName(file.name);
    setProofFileSize(file.size);
    setFormError('');

    // Generate client-side preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofPreview(e.target?.result || '');
      };
      reader.readAsDataURL(file);
    } else {
      setProofPreview('');
    }
  };

  const handleClearProof = () => {
    setProofFile(null);
    setProofPreview('');
    setProofFileName('');
    setProofFileSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-fill jumlah saat memilih jenis pembayaran atau buka form
  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setFormError('');
    handleClearProof();
    if (summary.balanceDue > 0) {
      setAmount(String(summary.balanceDue));
      setPaymentType(payments.length === 0 ? 'LUNAS' : 'PELUNASAN');
    } else {
      setAmount('');
      setPaymentType('LUNAS');
    }
  };

  const handleSelectPaymentType = (typeKey) => {
    setPaymentType(typeKey);
    if (typeKey === 'LUNAS' || typeKey === 'PELUNASAN') {
      if (summary.balanceDue > 0) {
        setAmount(String(summary.balanceDue));
      }
    } else if (typeKey === 'DP') {
      const half = summary.targetPrice > 0 ? Math.round(summary.targetPrice / 2) : 0;
      if (half > 0) {
        setAmount(String(half));
      }
    }
  };

  const handleQuickAmount = (val) => {
    setAmount(String(Math.round(val)));
  };

  // Simpan riwayat pembayaran baru ke API & LocalStorage
  const handleSavePayment = async (e) => {
    e.preventDefault();
    setFormError('');

    const parsedAmount = parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
    if (parsedAmount <= 0) {
      setFormError('Nominal pembayaran harus lebih besar dari Rp 0.');
      return;
    }

    if ((selectedMethod === 'BANK_LAIN' || selectedMethod === 'LAINNYA') && !customMethodName.trim()) {
      setFormError('Harap tuliskan nama bank atau metode pembayaran.');
      return;
    }

    setSaving(true);

    try {
      let uploadedProofUrl = '';
      let savedProofFileName = proofFileName;
      let savedProofFileSize = proofFileSize;

      // 1. Upload file bukti transfer jika ada
      if (proofFile) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', proofFile);

          const uploadRes = await fetch('/api/upload-payment-proof', {
            method: 'POST',
            body: uploadFormData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedProofUrl = uploadData.url || uploadData.dataUrl || '';
            savedProofFileName = uploadData.fileName || proofFileName;
            savedProofFileSize = uploadData.fileSize || proofFileSize;
          } else {
            // Fallback ke dataUrl lokal agar bukti transfer tidak hilang
            console.warn('Upload API gagal, menggunakan dataURL preview sebagai fallback');
            uploadedProofUrl = proofPreview || '';
          }
        } catch (uploadErr) {
          console.warn('Upload network error, menggunakan dataURL preview:', uploadErr);
          uploadedProofUrl = proofPreview || '';
        }
      }

      const newPaymentRecord = {
        id: `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        method: selectedMethod,
        customMethodName: customMethodName.trim() || undefined,
        type: paymentType,
        amount: parsedAmount,
        referenceNumber: referenceNumber.trim() || undefined,
        note: note.trim() || undefined,
        proofUrl: uploadedProofUrl || undefined,
        proofFileName: savedProofFileName || undefined,
        proofFileSize: savedProofFileSize || undefined,
        createdAt: new Date().toISOString(),
      };

      const updatedPayments = [...payments, newPaymentRecord];

      // Simpan ke LocalStorage segera sebagai cadangan
      if (typeof window !== 'undefined' && order.id) {
        localStorage.setItem(`rc_payment_history_${order.id}`, JSON.stringify(updatedPayments));
      }

      // Simpan ke database via PATCH API
      const endpoint = orderType === 'custom' ? `/api/custom-orders/${order.id}` : `/api/product-orders/${order.id}`;

      const bodyPayload = {
        paymentHistory: updatedPayments,
      };

      if (orderType === 'custom' && customTargetPrice > 0) {
        bodyPayload.totalPrice = customTargetPrice;
      }

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.warn('Gagal simpan ke backend, tetap menggunakan local state:', data.error);
      }

      // Update state lokal
      setPayments(updatedPayments);
      setShowAddForm(false);
      handleClearProof();
      setCustomMethodName('');
      setReferenceNumber('');
      setNote('');
      setSaveSuccessMessage('Riwayat pembayaran dan bukti transfer berhasil disimpan!');
      setTimeout(() => setSaveSuccessMessage(''), 3500);

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error saving payment record:', err);
      setShowAddForm(false);
      setSaveSuccessMessage('Riwayat pembayaran tersimpan (Lokal)!');
      setTimeout(() => setSaveSuccessMessage(''), 3500);
      if (onUpdate) onUpdate();
    } finally {
      setSaving(false);
    }
  };

  // Upload bukti transfer langsung dari baris tabel pembayaran yang sudah ada
  const handleOpenRowProofUpload = (paymentId) => {
    setTargetPaymentRowId(paymentId);
    if (rowFileInputRef.current) {
      rowFileInputRef.current.value = '';
      rowFileInputRef.current.click();
    }
  };

  const handleRowFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const paymentId = targetPaymentRowId;
    if (!file || !paymentId) return;

    setUploadingRowProofId(paymentId);

    try {
      let uploadedUrl = '';
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload-payment-proof', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrl = data.url || data.dataUrl || '';
        }
      } catch (uploadErr) {
        console.warn('Direct upload error, falling back to dataUrl:', uploadErr);
      }

      // Fallback jika API gagal
      if (!uploadedUrl && file.type.startsWith('image/')) {
        uploadedUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      if (!uploadedUrl) {
        alert('Gagal mengupload file bukti pembayaran.');
        return;
      }

      const updatedPayments = payments.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            proofUrl: uploadedUrl,
            proofFileName: file.name,
            proofFileSize: file.size,
          };
        }
        return p;
      });

      if (typeof window !== 'undefined' && order.id) {
        localStorage.setItem(`rc_payment_history_${order.id}`, JSON.stringify(updatedPayments));
      }

      const endpoint = orderType === 'custom' ? `/api/custom-orders/${order.id}` : `/api/product-orders/${order.id}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentHistory: updatedPayments }),
      });

      setPayments(updatedPayments);
      setSaveSuccessMessage('Bukti transfer berhasil diperbarui!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating row payment proof:', err);
      alert('Terjadi kesalahan saat menyimpan bukti transfer.');
    } finally {
      setUploadingRowProofId(null);
      setTargetPaymentRowId(null);
    }
  };

  // Hapus bukti transfer dari suatu catatan pembayaran
  const handleRemoveProofFromPayment = async (paymentId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus file bukti pembayaran ini?')) return;

    const updatedPayments = payments.map((p) => {
      if (p.id === paymentId) {
        const copy = { ...p };
        delete copy.proofUrl;
        delete copy.proofFileName;
        delete copy.proofFileSize;
        return copy;
      }
      return p;
    });

    try {
      if (typeof window !== 'undefined' && order.id) {
        localStorage.setItem(`rc_payment_history_${order.id}`, JSON.stringify(updatedPayments));
      }

      const endpoint = orderType === 'custom' ? `/api/custom-orders/${order.id}` : `/api/product-orders/${order.id}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentHistory: updatedPayments }),
      });

      setPayments(updatedPayments);
      if (activeProofModal?.id === paymentId) {
        setActiveProofModal(null);
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error removing payment proof:', err);
    }
  };

  // Hapus seluruh catatan pembayaran
  const handleDeletePayment = async (paymentId) => {
    setDeletingId(paymentId);
    const updatedPayments = payments.filter((p) => p.id !== paymentId);

    try {
      if (typeof window !== 'undefined' && order.id) {
        localStorage.setItem(`rc_payment_history_${order.id}`, JSON.stringify(updatedPayments));
      }

      const endpoint = orderType === 'custom' ? `/api/custom-orders/${order.id}` : `/api/product-orders/${order.id}`;

      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentHistory: updatedPayments }),
      });

      setPayments(updatedPayments);
      setDeleteConfirmId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting payment record:', err);
      setPayments(updatedPayments);
      setDeleteConfirmId(null);
      if (onUpdate) onUpdate();
    } finally {
      setDeletingId(null);
    }
  };

  // Simpan kesepakatan harga khusus (Custom Order)
  const handleSaveCustomTargetPrice = async () => {
    const parsed = parseFloat(String(customTargetPriceInput).replace(/[^0-9.]/g, '')) || 0;
    setCustomTargetPrice(parsed);
    setIsEditingTargetPrice(false);

    try {
      const endpoint = `/api/custom-orders/${order.id}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalPrice: parsed }),
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error saving agreed target price:', err);
    }
  };

  return (
    <div className="co-payment-history-widget" style={{ marginTop: '16px', marginBottom: '16px' }}>
      {/* Hidden file input for table row direct attachment */}
      <input
        ref={rowFileInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleRowFileSelected}
      />

      {/* HEADER SECTION */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={16} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
              Riwayat &amp; Bukti Pembayaran Customer
            </span>
            <span
              style={{
                marginLeft: '8px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: summary.statusConfig.bg,
                color: summary.statusConfig.color,
                border: `1px solid ${summary.statusConfig.border}`,
              }}
            >
              {summary.statusConfig.label}
            </span>
          </div>
        </div>

        {!showAddForm && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleOpenAddForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Plus size={14} />
            <span>+ Catat Pembayaran &amp; Upload Bukti</span>
          </button>
        )}
      </div>

      {/* NOTIFIKASI BERHASIL */}
      {saveSuccessMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: '#ECFDF5',
            color: '#047857',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            marginBottom: '12px',
            border: '1px solid #A7F3D0',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* FINANCIAL SUMMARY BOX */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          marginBottom: '14px',
        }}
      >
        {/* Total Tagihan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
              Total Tagihan
            </span>
            {orderType === 'custom' && !isEditingTargetPrice && (
              <button
                type="button"
                onClick={() => setIsEditingTargetPrice(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: 0,
                }}
                title="Sesuaikan kesepakatan harga pesanan"
              >
                <Edit2 size={10} /> Ubah
              </button>
            )}
          </div>

          {isEditingTargetPrice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <input
                type="number"
                className="form-input"
                style={{ padding: '2px 6px', fontSize: '0.8125rem', height: '26px' }}
                placeholder="Rp kesepakatan"
                value={customTargetPriceInput}
                onChange={(e) => setCustomTargetPriceInput(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="btn btn-sm"
                style={{ padding: '2px 6px', height: '26px', backgroundColor: '#10B981', color: '#fff' }}
                onClick={handleSaveCustomTargetPrice}
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 6px', height: '26px' }}
                onClick={() => setIsEditingTargetPrice(false)}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>
              {summary.targetPrice > 0 ? (
                formatPrice(summary.targetPrice)
              ) : (
                <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                  {orderType === 'custom' ? 'Belum ditentukan' : 'Rp 0'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sudah Dibayar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
            Sudah Dibayar
          </span>
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: summary.totalPaid > 0 ? '#059669' : '#6B7280',
            }}
          >
            {formatPrice(summary.totalPaid)}
            {summary.targetPrice > 0 && summary.percentPaid > 0 && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#059669', marginLeft: '6px' }}>
                ({summary.percentPaid}%)
              </span>
            )}
          </div>
        </div>

        {/* Sisa Tagihan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
            Sisa Tagihan
          </span>
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: summary.balanceDue > 0 ? '#DC2626' : '#059669',
            }}
          >
            {summary.targetPrice > 0 ? (
              summary.balanceDue === 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                  <CheckCircle2 size={15} /> Lunas Penuh
                </span>
              ) : (
                formatPrice(summary.balanceDue)
              )
            ) : summary.totalPaid > 0 ? (
              <span style={{ color: '#059669' }}>Terbayar {formatPrice(summary.totalPaid)}</span>
            ) : (
              '-'
            )}
          </div>
        </div>

        {/* Metode Terdaftar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
            Metode Pembayaran
          </span>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
            {summary.methodsSummary || 'Belum Ada'}
          </div>
        </div>
      </div>

      {/* FORM INPUT CATAT PEMBAYARAN BARU & UPLOAD BUKTI */}
      {showAddForm && (
        <form
          onSubmit={handleSavePayment}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #3B82F6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Catat Pembayaran &amp; Bukti Transfer Customer
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {formError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                borderRadius: '4px',
                fontSize: '0.75rem',
                marginBottom: '12px',
                border: '1px solid #FECACA',
              }}
            >
              <AlertCircle size={14} />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Pilih Metode Pembayaran (Chips Grid) */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Metode Pembayaran (Lewat apa customer membayar?):
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              {POPULAR_METHODS.map((key) => {
                const info = PAYMENT_METHODS[key];
                const isSelected = selectedMethod === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(key);
                      if (key !== 'BANK_LAIN' && key !== 'LAINNYA') {
                        setCustomMethodName('');
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? info.bg : '#F9FAFB',
                      color: isSelected ? info.color : '#4B5563',
                      border: isSelected ? `2px solid ${info.color}` : '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {key === 'BCA' || key === 'MANDIRI' || key === 'BRI' || key === 'BNI' || key === 'BSI' || key === 'BANK_LAIN' ? (
                      <Landmark size={12} />
                    ) : key === 'QRIS' ? (
                      <QrCode size={12} />
                    ) : key === 'TUNAI' ? (
                      <Banknote size={12} />
                    ) : key === 'COD' ? (
                      <Truck size={12} />
                    ) : (
                      <Wallet size={12} />
                    )}
                    <span>{info.shortLabel || info.label}</span>
                    {isSelected && <Check size={11} />}
                  </button>
                );
              })}
            </div>

            {/* Input custom nama bank / metode lain jika dipilih */}
            {(selectedMethod === 'BANK_LAIN' || selectedMethod === 'LAINNYA') && (
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={
                    selectedMethod === 'BANK_LAIN'
                      ? 'Tulis nama bank, misal: Bank Danamon / Permata'
                      : 'Tulis nama metode pembayaran'
                  }
                  value={customMethodName}
                  onChange={(e) => setCustomMethodName(e.target.value)}
                  style={{ fontSize: '0.8125rem' }}
                  required
                />
              </div>
            )}
          </div>

          {/* 2. Jenis Pembayaran & Nominal */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            {/* Jenis Pembayaran */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Jenis Pembayaran:
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Object.keys(PAYMENT_TYPES).map((typeKey) => {
                  const t = PAYMENT_TYPES[typeKey];
                  const isSel = paymentType === typeKey;
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => handleSelectPaymentType(typeKey)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: isSel ? 700 : 500,
                        backgroundColor: isSel ? t.bg : '#F9FAFB',
                        color: isSel ? t.color : '#6B7280',
                        border: isSel ? `1.5px solid ${t.color}` : '1px solid #E5E7EB',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {t.badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nominal (Rp) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                  Nominal Dibayar (Rp): <span style={{ color: '#DC2626' }}>*</span>
                </label>
                {summary.balanceDue > 0 && (
                  <span style={{ fontSize: '0.6875rem', color: '#6B7280' }}>
                    Sisa: {formatPrice(summary.balanceDue)}
                  </span>
                )}
              </div>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
                required
              />

              {/* Quick Amount Chips */}
              {summary.targetPrice > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {summary.balanceDue > 0 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(summary.balanceDue)}
                      style={{
                        fontSize: '0.6875rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        cursor: 'pointer',
                      }}
                    >
                      Sisa Tagihan ({formatPrice(summary.balanceDue)})
                    </button>
                  )}
                  {summary.targetPrice > 0 && summary.targetPrice / 2 > 0 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(summary.targetPrice / 2)}
                      style={{
                        fontSize: '0.6875rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#FFFBEB',
                        color: '#D97706',
                        border: '1px solid #FDE68A',
                        cursor: 'pointer',
                      }}
                    >
                      DP 50% ({formatPrice(summary.targetPrice / 2)})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. UPLOAD FILE BUKTI PEMBAYARAN (SCREENSHOT STRUK TRANSFER) */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              <Paperclip size={14} style={{ color: '#2563EB' }} />
              <span>Upload Bukti Pembayaran / Screenshot Transfer Customer:</span>
              <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 400 }}>
                (JPG, PNG, WEBP, atau PDF)
              </span>
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSelectProofFile(file);
              }}
            />

            {!proofFile ? (
              <div
                className={`payment-proof-dropzone ${isDragging ? 'drag-active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleSelectProofFile(file);
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Upload size={18} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#1E293B', fontWeight: 600 }}>
                    Klik untuk pilih screenshot atau drag &amp; drop ke sini
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                    Struk transfer m-Banking (BCA/Mandiri/BRI), bukti scan QRIS, atau slip ATM
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: '8px',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  {proofPreview ? (
                    <img
                      src={proofPreview}
                      alt="Preview Bukti"
                      style={{
                        width: '42px',
                        height: '42px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #86EFAC',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '6px',
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileCheck size={20} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#166534',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={proofFileName}
                    >
                      {proofFileName}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#15803D' }}>
                      {formatFileSize(proofFileSize)} • Siap diunggah
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none',
                      border: '1px solid #BBF7D0',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '0.6875rem',
                      color: '#15803D',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={handleClearProof}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                    title="Hapus file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Tanggal, Referensi, dan Catatan */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            {/* Tanggal & Waktu */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Tanggal &amp; Jam Pembayaran:
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
                required
              />
            </div>

            {/* Nomor Referensi / Pengirim */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Nama Pengirim / No. Ref (Opsional):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: a/n Budi Santoso / Ref BCA-889"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>

            {/* Catatan */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Catatan Tambahan (Opsional):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Sudah dicek di mutasi m-Banking"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                handleClearProof();
              }}
              disabled={saving}
              style={{
                padding: '9px 20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Menyimpan &amp; Mengunggah...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Simpan Pembayaran</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* PAYMENT HISTORY TABLE / LIST */}
      {payments.length === 0 ? (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#F9FAFB',
            border: '1px dashed #D1D5DB',
            borderRadius: '6px',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '0.8125rem',
          }}
        >
          <CreditCard size={24} style={{ color: '#9CA3AF', marginBottom: '4px' }} />
          <div>Belum ada catatan pembayaran untuk pesanan ini.</div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
            Klik <strong>+ Catat Pembayaran &amp; Upload Bukti</strong> di atas untuk menyimpan metode dan screenshot transfer pelanggan.
          </div>
        </div>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8125rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563' }}>TANGGAL</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563' }}>METODE PEMBAYARAN</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563' }}>JENIS</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563' }}>NOMINAL</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563' }}>PENGIRIM / REF</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563' }}>BUKTI TRANSFER</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563' }}>CATATAN</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const methodInfo = getPaymentMethodInfo(p.method, p.customMethodName);
                const typeInfo = PAYMENT_TYPES[p.type] || PAYMENT_TYPES.LUNAS;
                const hasProof = Boolean(p.proofUrl);
                const isUploadingThisRow = uploadingRowProofId === p.id;

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Tanggal */}
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#374151' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} style={{ color: '#9CA3AF' }} />
                        <span>{formatPaymentDate(p.date)}</span>
                      </div>
                    </td>

                    {/* Metode Pembayaran */}
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: methodInfo.bg,
                          color: methodInfo.color,
                          border: `1px solid ${methodInfo.border}`,
                        }}
                      >
                        {methodInfo.label}
                      </span>
                    </td>

                    {/* Jenis Pembayaran */}
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: typeInfo.bg,
                          color: typeInfo.color,
                        }}
                      >
                        {typeInfo.badge}
                      </span>
                    </td>

                    {/* Nominal */}
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#111' }}>
                      {formatPrice(p.amount)}
                    </td>

                    {/* Pengirim / Ref */}
                    <td style={{ padding: '10px 12px', color: '#4B5563', fontSize: '0.75rem' }}>
                      {p.referenceNumber || '-'}
                    </td>

                    {/* BUKTI TRANSFER SCREENSHOT */}
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      {isUploadingThisRow ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontSize: '0.75rem' }}>
                          <Loader2 size={13} className="spin-icon" />
                          <span>Mengupload...</span>
                        </div>
                      ) : hasProof ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="payment-proof-thumb-btn"
                            onClick={() => setActiveProofModal(p)}
                            title="Klik untuk melihat bukti transfer screenshot ukuran penuh"
                          >
                            {isImageFile(p.proofUrl) ? (
                              <img
                                src={p.proofUrl}
                                alt="Thumbnail"
                                className="payment-proof-thumb-img"
                              />
                            ) : (
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '4px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#2563EB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <FileText size={14} />
                              </div>
                            )}
                            <span style={{ fontWeight: 600 }}>Lihat Bukti</span>
                            <Eye size={12} style={{ color: '#2563EB' }} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenRowProofUpload(p.id)}
                          style={{
                            background: 'none',
                            border: '1px dashed #CBD5E1',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '0.6875rem',
                            color: '#64748B',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Lampirkan foto struk / transfer"
                        >
                          <Upload size={11} />
                          <span>+ Upload Bukti</span>
                        </button>
                      )}
                    </td>

                    {/* Catatan */}
                    <td style={{ padding: '10px 12px', color: '#6B7280', fontSize: '0.75rem' }}>
                      {p.note || '-'}
                    </td>

                    {/* Aksi Hapus */}
                    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {deleteConfirmId === p.id ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(p.id)}
                            disabled={deletingId === p.id}
                            style={{
                              padding: '7px 14px',
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              backgroundColor: '#EF4444',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.3)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {deletingId === p.id ? 'Menghapus...' : 'Ya, Hapus'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            style={{
                              padding: '7px 14px',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#EF4444',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Hapus riwayat pembayaran ini"
                        >
                          <Trash2 size={14} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* LIGHTBOX MODAL PREVIEW BUKTI TRANSFER UKURAN PENUH */}
      {activeProofModal && (
        <div
          className="payment-proof-modal-overlay"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="payment-proof-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
                    Bukti Transfer Pembayaran
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: getPaymentMethodInfo(activeProofModal.method, activeProofModal.customMethodName).bg,
                      color: getPaymentMethodInfo(activeProofModal.method, activeProofModal.customMethodName).color,
                      border: `1px solid ${getPaymentMethodInfo(activeProofModal.method, activeProofModal.customMethodName).border}`,
                    }}
                  >
                    {getPaymentMethodInfo(activeProofModal.method, activeProofModal.customMethodName).label}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                  Pesanan: <strong>{order.orderNumber}</strong> • Customer: <strong>{order.customerName}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveProofModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                }}
                title="Tutup (ESC)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image / Preview Content */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                maxHeight: '60vh',
                overflow: 'auto',
              }}
            >
              {isImageFile(activeProofModal.proofUrl) ? (
                <img
                  src={activeProofModal.proofUrl}
                  alt="Bukti Transfer Customer"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '56vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#FFFFFF', padding: '32px' }}>
                  <FileText size={48} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>File Dokumen Bukti Pembayaran</div>
                  <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '4px' }}>
                    {activeProofModal.proofFileName || 'Dokumen PDF / Bukti Pembayaran'}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Details Bar */}
            <div
              style={{
                padding: '12px 18px',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Nominal:</span>
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
                  {formatPrice(activeProofModal.amount)}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Tanggal:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {formatPaymentDate(activeProofModal.date)}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Pengirim / Ref:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {activeProofModal.referenceNumber || '-'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Ukuran File:</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {formatFileSize(activeProofModal.proofFileSize) || '-'}
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <button
                  type="button"
                  onClick={() => handleRemoveProofFromPayment(activeProofModal.id)}
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1.5px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Trash2 size={15} />
                  <span>Hapus Bukti</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href={activeProofModal.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 600, borderRadius: '6px' }}
                >
                  <ExternalLink size={14} />
                  <span>Buka Tab Baru</span>
                </a>

                <a
                  href={activeProofModal.proofUrl}
                  download={activeProofModal.proofFileName || `bukti_transfer_${order.orderNumber}.jpg`}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', padding: '8px 18px', fontSize: '0.8125rem', fontWeight: 600, borderRadius: '6px' }}
                >
                  <Download size={14} />
                  <span>Unduh File</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveProofModal(null)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 600, borderRadius: '6px' }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
