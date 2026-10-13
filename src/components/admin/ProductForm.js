'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function ProductForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [material, setMaterial] = useState(initialData?.material || 'Cotton Combed 30s');
  const [weight, setWeight] = useState(initialData?.weight || '180g');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE');

  // Images state
  const [images, setImages] = useState(
    initialData?.images?.map((img) => img.url) || [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants state
  const [variants, setVariants] = useState(
    initialData?.variants?.map((v) => ({
      size: v.size || 'M',
      color: v.color || 'Black',
      stock: v.stock || 10,
      sku: v.sku || '',
    })) || [
      { size: 'S', color: 'Black', stock: 10, sku: '' },
      { size: 'M', color: 'Black', stock: 15, sku: '' },
      { size: 'L', color: 'Black', stock: 12, sku: '' },
      { size: 'XL', color: 'Black', stock: 8, sku: '' },
    ]
  );

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { size: 'L', color: 'Black', stock: 10, sku: '' },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !price) {
      setError('Nama produk dan harga wajib diisi');
      setLoading(false);
      return;
    }

    const payload = {
      name,
      price: parseFloat(price),
      categoryId: categoryId || null,
      description,
      material,
      weight,
      featured,
      status,
      images: images.map((url) => ({ url })),
      variants: variants.map((v) => ({
        size: v.size,
        color: v.color,
        stock: parseInt(v.stock, 10) || 0,
        sku: v.sku,
      })),
    };

    try {
      const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan produk.');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} /> KEMBALI
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          {isEdit ? `Edit Produk: ${initialData?.name}` : 'Tambah Produk Baru'}
        </h2>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FFF5F5', color: '#C53030', border: '1px solid #C53030', marginBottom: '24px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="admin-form-grid">
        {/* NAMA PRODUK */}
        <div className="form-group">
          <label className="form-label">NAMA PRODUK *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Rinjani Mountain Tee"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* HARGA */}
        <div className="form-group">
          <label className="form-label">HARGA (RUPIAH / RP) *</label>
          <input
            type="number"
            className="form-input"
            placeholder="125000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
          <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', display: 'block' }}>
            Tampil sebagai: <strong>{formatPrice(parseFloat(price) || 0)}</strong>
          </span>
        </div>

        {/* KATEGORI */}
        <div className="form-group">
          <label className="form-label">KATEGORI</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS & FEATURED */}
        <div className="form-group">
          <label className="form-label">STATUS PUBLIKASI</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingTop: '8px' }}>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE (Tampil di website)</option>
              <option value="DRAFT">DRAFT (Sembunyi)</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Tampilkan di Featured Hero
            </label>
          </div>
        </div>

        {/* MATERIAL */}
        <div className="form-group">
          <label className="form-label">BAHAN / MATERIAL</label>
          <input
            type="text"
            className="form-input"
            placeholder="Cotton Combed 30s"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
        </div>

        {/* GRAMASI / BERAT */}
        <div className="form-group">
          <label className="form-label">GRAMASI / BERAT</label>
          <input
            type="text"
            className="form-input"
            placeholder="180g"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        {/* DESKRIPSI PRODUK */}
        <div className="form-group admin-form-full">
          <label className="form-label">DESKRIPSI PRODUK</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Tuliskan deskripsi produk, kecocokan pemakaian, dan keunggulan bahan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* GAMBAR PRODUK */}
        <div className="form-group admin-form-full" style={{ borderTop: '1px solid #E5E5E2', paddingTop: '24px', marginTop: '16px' }}>
          <label className="form-label">GAMBAR PRODUK (URL GAMBAR)</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddImage}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> TAMBAH URL GAMBAR
            </button>
          </div>

          <div className="image-preview-grid">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="image-preview-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={`Preview ${idx + 1}`} />
                <div
                  className="image-preview-remove"
                  onClick={() => handleRemoveImage(idx)}
                  title="Hapus gambar"
                >
                  <Trash2 size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VARIAN & STOK TABLE */}
        <div className="form-group admin-form-full" style={{ borderTop: '1px solid #E5E5E2', paddingTop: '24px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label className="form-label">VARIAN UKURAN, WARNA & STOK</label>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Tentukan kuantitas stok aktual untuk setiap varian produk.</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddVariant}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> TAMBAH BARIS VARIAN
            </button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>UKURAN</th>
                <th>WARNA</th>
                <th>STOK (PCS)</th>
                <th>SKU (OPTIONAL)</th>
                <th>HAPUS</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                      placeholder="S, M, L, XL"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                      placeholder="Black, White"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.8125rem', width: '100px' }}
                      placeholder="10"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                      placeholder="SKU-123"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveVariant(idx)}
                      disabled={variants.length <= 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.push('/admin/products')}
          disabled={loading}
        >
          BATAL
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'MENYIMPAN...' : isEdit ? 'SIMPAN PERUBAHAN' : 'BUAT PRODUK'}
        </button>
      </div>
    </form>
  );
}
