'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, AlertCircle } from 'lucide-react';
import { formatPrice, getTotalStock, getStockStatus } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));

    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    fetch('/api/products?allStatus=true')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${deleteModalId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== deleteModalId));
        setDeleteModalId(null);
      } else {
        alert('Gagal menghapus produk');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus produk');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.category?.slug === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>KATALOG PRODUK INVENTARIS</h2>
          <p style={{ fontSize: '0.8125rem', color: '#666' }}>Kelola stok, varian ukuran/warna, dan status publikasi produk.</p>
        </div>

        <Link href="/admin/products/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> TAMBAH PRODUK BARU
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
                placeholder="Cari nama produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 32px 8px 12px', fontSize: '0.8125rem' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Memuat daftar produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-state-title">Tidak ada produk ditemukan</h3>
            <p className="empty-state-text">Coba ubah kata kunci pencarian atau tambah produk baru.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>GAMBAR</th>
                <th>PRODUK</th>
                <th>KATEGORI</th>
                <th>HARGA</th>
                <th>STOK TOTAL</th>
                <th>VARIAN</th>
                <th>VISIBILITAS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const stock = getTotalStock(p.variants);
                const stockStatus = getStockStatus(stock);
                const img = p.images[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80';

                return (
                  <tr key={p.id}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={p.name} className="admin-table-img" />
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.featured && (
                        <span style={{ fontSize: '0.625rem', backgroundColor: '#111', color: '#FFF', padding: '2px 6px', marginLeft: '8px', borderRadius: '2px' }}>
                          FEATURED
                        </span>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>/{p.slug}</div>
                    </td>
                    <td>{p.category?.name || '-'}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>
                      <span className={stockStatus.className}>{stock} pcs</span>
                    </td>
                    <td>{p.variants?.length || 0} varian</td>
                    <td>
                      <span className={`status-badge ${p.status === 'ACTIVE' ? 'status-active' : 'status-draft'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link href={`/admin/products/${p.id}`} className="btn btn-secondary btn-sm">
                          <Edit size={14} /> Edit
                        </Link>
                        <button
                          onClick={() => setDeleteModalId(p.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <div className={`confirm-overlay ${deleteModalId ? 'open' : ''}`}>
        <div className="confirm-dialog">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C53030' }}>
            <AlertCircle size={20} />
            <h3 className="confirm-title">Hapus Produk?</h3>
          </div>
          <p className="confirm-text">
            Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="confirm-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setDeleteModalId(null)}
              disabled={deleting}
            >
              BATAL
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'MENGHAPUS...' : 'YA, HAPUS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
