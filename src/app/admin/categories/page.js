'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setLoading(true);
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setDisplayOrder(String(categories.length + 1));
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setDisplayOrder(String(cat.displayOrder));
    setActive(cat.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      displayOrder: parseInt(displayOrder, 10) || 0,
      active,
    };

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadCategories();
      } else {
        alert('Gagal menyimpan kategori.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCategories();
      } else {
        alert('Gagal menghapus kategori');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>MANAJEMEN KATEGORI PRODUK</h2>
          <p style={{ fontSize: '0.8125rem', color: '#666' }}>Kelola pengelompokan produk dan urutan tampilannya di navigasi.</p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> TAMBAH KATEGORI
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Memuat kategori...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>URUTAN</th>
                <th>NAMA KATEGORI</th>
                <th>SLUG</th>
                <th>DESKRIPSI</th>
                <th>JUMLAH PRODUK</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>#{cat.displayOrder}</strong></td>
                  <td><strong>{cat.name}</strong></td>
                  <td><code>/{cat.slug}</code></td>
                  <td>{cat.description || '-'}</td>
                  <td>{cat._count?.products || 0} produk</td>
                  <td>
                    <span className={`status-badge ${cat.active ? 'status-active' : 'status-draft'}`}>
                      {cat.active ? 'AKTIF' : 'NON-AKTIF'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(cat)}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CATEGORY FORM MODAL */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">NAMA KATEGORI *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Oversize Collection"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">DESKRIPSI KATEGORI</label>
              <textarea
                className="form-input"
                style={{ height: '80px' }}
                placeholder="Deskripsi singkat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">URUTAN TAMPIL (DISPLAY ORDER)</label>
              <input
                type="number"
                className="form-input"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Aktif (Tampilkan di navigasi website)
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                BATAL
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'MENYIMPAN...' : 'SIMPAN KATEGORI'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
