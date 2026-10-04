import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, getTotalStock, getStockStatus } from '@/lib/utils';
import { Plus, Package, Grid, Settings, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Dynamic

async function getDashboardStats() {
  try {
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    let outOfStockCount = 0;
    products.forEach((p) => {
      const stock = getTotalStock(p.variants);
      if (stock <= 0) outOfStockCount++;
    });

    return {
      totalProducts,
      totalCategories,
      outOfStockCount,
      recentProducts: products.slice(0, 5),
    };
  } catch (err) {
    console.error(err);
    return {
      totalProducts: 0,
      totalCategories: 0,
      outOfStockCount: 0,
      recentProducts: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      {/* STATS GRID */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">TOTAL PRODUK</div>
          <div className="admin-stat-value">{stats.totalProducts}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">STOK HABIS (SOLD OUT)</div>
          <div className="admin-stat-value" style={{ color: stats.outOfStockCount > 0 ? '#C53030' : 'inherit' }}>
            {stats.outOfStockCount}
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">TOTAL KATEGORI</div>
          <div className="admin-stat-value">{stats.totalCategories}</div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666', marginBottom: '16px' }}>
          AKSES CEPAT
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/admin/products/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> TAMBAH PRODUK BARU
          </Link>
          <Link href="/admin/categories" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Grid size={16} /> KELOLA KATEGORI
          </Link>
          <Link href="/admin/settings" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} /> PENGATURAN KONTAK
          </Link>
        </div>
      </div>

      {/* RECENT PRODUCTS TABLE */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">PRODUK TERBARU</div>
          <Link href="/admin/products" style={{ fontSize: '0.8125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            LIHAT SEMUA PRODUK <ArrowRight size={14} />
          </Link>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>GAMBAR</th>
              <th>NAMA PRODUK</th>
              <th>KATEGORI</th>
              <th>HARGA</th>
              <th>TOTAL STOK</th>
              <th>STATUS</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentProducts.map((p) => {
              const stock = getTotalStock(p.variants);
              const status = getStockStatus(stock);
              const img = p.images[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80';

              return (
                <tr key={p.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={p.name} className="admin-table-img" />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{p.slug}</div>
                  </td>
                  <td>{p.category?.name || '-'}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{stock} pcs</td>
                  <td>
                    <span className={status.className}>{status.label}</span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/products/${p.id}`} className="btn btn-secondary btn-sm">
                        EDIT
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
