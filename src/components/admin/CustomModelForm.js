'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Upload, Check, Star, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const DEFAULT_CATEGORIES = ['T-Shirt', 'Polo', 'Hoodie', 'Jersey', 'Long Sleeve', 'Raglan', 'Tank Top', 'Outerwear', 'Kemeja'];

export default function CustomModelForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'T-Shirt');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState(initialData?.price ?? 55000);
  const [minOrder, setMinOrder] = useState(initialData?.minOrder ?? 12);
  const [description, setDescription] = useState(initialData?.description || '');
  const [active, setActive] = useState(initialData?.active ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);

  // Images state (array of URLs or data URLs)
  const [images, setImages] = useState(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80']
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle adding URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  // Handle file uploads (converts to dataUrl)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama model pakaian wajib diisi.');
      return;
    }
    if (images.length === 0) {
      setError('Minimal masukkan 1 gambar untuk katalog.');
      return;
    }

    setLoading(true);

    const effectiveCategory = category === 'OTHER' ? customCategory.trim() || 'Lainnya' : category;

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      category: effectiveCategory,
      description: description.trim(),
      price: parseFloat(price) || 0,
      minOrder: parseInt(minOrder, 10) || 12,
      active,
      sortOrder: parseInt(sortOrder, 10) || 0,
      images,
    };

    try {
      const url = isEdit ? `/api/custom-models/${initialData.id}` : '/api/custom-models';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan model custom.');
      }

      router.push('/admin/custom-models');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/custom-models"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> KEMBALI KE DAFTAR KATALOG CUSTOM
        </Link>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
          {isEdit ? `Edit Model: ${initialData?.name}` : 'Tambah Katalog Model Custom Baru'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Kelola model pakaian yang tampil pada konfigurator halaman Custom Apparel (dukungan multi-gambar, harga, & deskripsi).
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #EF4444',
            color: '#B91C1C',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>
                Informasi Utama Model Pakaian
              </h3>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">
                  Nama Model Pakaian <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: T-Shirt Oversize, Hoodie Pullover..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!isEdit && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, '')
                          .replace(/\s+/g, '-')
                      );
                    }
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Kategori Pakaian</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="OTHER">+ Kategori Kustom</option>
                  </select>
                </div>

                {category === 'OTHER' && (
                  <div className="form-group">
                    <label className="form-label">Nama Kategori Baru</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Masukkan kategori..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Slug URL (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="t-shirt-oversize"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Detail Harga Dasar (Rp/pcs)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="55000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="500"
                  />
                  <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                    Tampil sebagai: <strong>{formatPrice(parseFloat(price) || 0)}</strong>
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Minimal Pemesanan (pcs)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="12"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Singkat Pakaian</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  placeholder="Jelaskan karakteristik potongan, kenyamanan bahan, dan kecocokan untuk sablon/koleksi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* MULTI IMAGE SECTION */}
            <div className="admin-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                  Foto & Gambar Katalog ({images.length} Gambar)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  Mendukung multi-gambar dalam satu katalog
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '16px' }}>
                Gambar pertama otomatis dijadikan <strong>Foto Utama (Cover)</strong>. Anda dapat mengunggah gambar dari komputer atau memasukkan URL gambar.
              </p>

              {/* Upload & Add Bar */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: '220px' }}
                  placeholder="Tempel URL gambar (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddImageUrl}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Tambah URL
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Upload size={16} /> Upload Gambar
                </button>
              </div>

              {/* Images Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '14px',
                }}
              >
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      aspectRatio: '4/5',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: index === 0 ? '2px solid #000' : '1px solid #e5e5e5',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      background: '#f5f5f5',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Preview ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {index === 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          backgroundColor: '#000',
                          color: '#fff',
                          fontSize: '0.625rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        UTAMA
                      </div>
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        padding: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {index !== 0 ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(index)}
                          title="Jadikan Gambar Utama"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.6875rem',
                            gap: '4px',
                          }}
                        >
                          <Star size={13} fill="#fff" />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.6875rem', color: '#fff', paddingLeft: '4px' }}>
                          Cover
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        title="Hapus Gambar"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {images.length === 0 && (
                <div
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    border: '2px dashed #e5e5e5',
                    borderRadius: '12px',
                    color: '#888',
                  }}
                >
                  <ImageIcon size={32} style={{ marginBottom: '8px', color: '#ccc' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Belum ada gambar yang dimasukkan.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>
                Status & Publikasi
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>Aktif di Konfigurator</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Ditampilkan di pilihan model pakaian /custom
                    </div>
                  </div>
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Urutan Tampilan (Sort Order)</label>
                <input
                  type="number"
                  className="form-input"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  min="0"
                />
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  Angka lebih kecil tampil lebih awal
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginBottom: '10px' }}
              >
                {loading ? 'Menyimpan...' : isEdit ? 'SIMPAN PERUBAHAN' : 'TERBITKAN MODEL BARU'}
              </button>

              <Link
                href="/admin/custom-models"
                className="btn btn-secondary btn-full"
                style={{ textAlign: 'center' }}
              >
                Batal
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
