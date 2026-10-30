'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, AlertCircle, Shirt, CheckCircle2, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminCustomModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/custom-models');
      const data = await res.json();
      setModels(data.models || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/custom-models/${deleteModalId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setModels((prev) => prev.filter((m) => m.id !== deleteModalId));
        setDeleteModalId(null);
      } else {
        alert('Gagal menghapus model custom');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus model custom');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (model) => {
    try {
      const updatedActive = !model.active;
      const res = await fetch(`/api/custom-models/${model.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: updatedActive }),
      });

      if (res.ok) {
        setModels((prev) =>
          prev.map((m) => (m.id === model.id ? { ...m, active: updatedActive } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = Array.from(new Set(models.map((m) => m.category).filter(Boolean)));

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase())) ||
      m.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>KATALOG MODEL APPAREL CUSTOM</h2>
          <p style={{ fontSize: '0.8125rem', color: '#666' }}>
            Kelola model pakaian yang tampil di halaman konfigurator pesanan custom (dukungan multi-gambar, harga, & deskripsi).
          </p>
        </div>

        <Link
          href="/admin/custom-models/new"
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> TAMBAH MODEL CUSTOM BARU
        </Link>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <input
                type="text"
                className="admin-table-search"
                style={{ width: '100%', paddingLeft: '36px' }}
                placeholder="Cari nama model atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888',
                }}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto', minWidth: '160px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Memuat katalog model custom...
          </div>
        ) : filteredModels.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <Shirt size={48} style={{ margin: '0 auto 12px', color: '#ccc' }} />
            <p style={{ fontWeight: '500', marginBottom: '4px' }}>Tidak ada model pakaian ditemukan</p>
            <p style={{ fontSize: '0.8125rem' }}>Klik tombol Tambah Model Custom Baru untuk membuat model pertama.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Foto</th>
                  <th>Nama Model & Kategori</th>
                  <th>Deskripsi Singkat</th>
                  <th>Estimasi Harga</th>
                  <th>Galeri</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((m) => {
                  const mainImage = m.images?.[0] || m.image;
                  const imageCount = m.images?.length || 0;

                  return (
                    <tr key={m.id}>
                      <td>
                        <div
                          style={{
                            width: '48px',
                            height: '56px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #e5e5e5',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mainImage}
                            alt={m.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          Kategori: <strong>{m.category}</strong> • Min: {m.minOrder} pcs
                        </div>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: '#555',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {m.description || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#111' }}>
                          {formatPrice(m.price)}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#888' }}>per pcs</div>
                      </td>
                      <td>
                        <span
                          className="co-badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: imageCount > 1 ? '#EFF6FF' : '#F3F4F6',
                            color: imageCount > 1 ? '#1D4ED8' : '#374151',
                            borderColor: imageCount > 1 ? '#93C5FD' : '#E5E7EB',
                          }}
                        >
                          {imageCount} Foto
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(m)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: m.active ? '#10B981' : '#9CA3AF',
                          }}
                          title="Klik untuk ubah status aktif"
                        >
                          {m.active ? (
                            <>
                              <CheckCircle2 size={14} /> Aktif
                            </>
                          ) : (
                            <>
                              <XCircle size={14} /> Nonaktif
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Link
                            href={`/admin/custom-models/${m.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 10px' }}
                            title="Edit model"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 10px', color: '#EF4444' }}
                            onClick={() => setDeleteModalId(m.id)}
                            title="Hapus model"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="co-modal-backdrop" onClick={() => setDeleteModalId(null)}>
          <div
            className="co-modal-content"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                Hapus Model Custom?
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '24px' }}>
                Model pakaian ini akan dihapus dari konfigurator custom. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteModalId(null)}
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
