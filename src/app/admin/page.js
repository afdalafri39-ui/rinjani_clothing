import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPrice, getTotalStock, getStockStatus } from '@/lib/utils';
import { Plus, Package, Grid, Settings, ArrowRight, ClipboardList, Shirt, User, Clock, ShoppingBag } from 'lucide-react';

export const revalidate = 0; // Dynamic

const STATUS_CONFIG = {
  BARU: { label: 'Baru', color: '#3B82F6', bg: '#EFF6FF' },
  DIPROSES: { label: 'Diproses', color: '#F59E0B', bg: '#FFFBEB' },
  MOCKUP: { label: 'Mockup', color: '#8B5CF6', bg: '#F5F3FF' },
  PRODUKSI: { label: 'Produksi', color: '#F97316', bg: '#FFF7ED' },
  SELESAI: { label: 'Selesai', color: '#10B981', bg: '#ECFDF5' },
  DIBATALKAN: { label: 'Dibatalkan', color: '#EF4444', bg: '#FEF2F2' },
};

async function getDashboardStats() {
  try {
    const [
      { count: totalProducts },
      { count: totalCategories },
      { data: productsData },
      { count: totalCustomOrders },
      { count: newCustomOrders },
      { count: inProgressOrders },
      { data: recentCustomOrders },
      { count: totalProductOrders },
      { count: newProductOrders },
      { count: inProgressProductOrders },
    ] = await Promise.all([
      supabase.from('Product').select('*', { count: 'exact', head: true }),
      supabase.from('Category').select('*', { count: 'exact', head: true }),
      supabase
        .from('Product')
        .select('*, category:Category(*), variants:ProductVariant(*), images:ProductImage(*)')
        .order('createdAt', { ascending: false }),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).eq('status', 'BARU'),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).in('status', ['DIPROSES', 'MOCKUP', 'PRODUKSI']),
      supabase.from('CustomOrder').select('*').order('createdAt', { ascending: false }).limit(5),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }).eq('status', 'BARU'),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }).in('status', ['DIPROSES', 'DIKIRIM']),
    ]);

    const products = productsData || [];
    let outOfStockCount = 0;
    products.forEach((p) => {
      const stock = getTotalStock(p.variants);
      if (stock <= 0) outOfStockCount++;
    });

    return {
      totalProducts: totalProducts || 0,
      totalCategories: totalCategories || 0,
      outOfStockCount,
      recentProducts: products.slice(0, 5),
      totalCustomOrders: totalCustomOrders || 0,
      newCustomOrders: newCustomOrders || 0,
      inProgressOrders: inProgressOrders || 0,
      recentCustomOrders: recentCustomOrders || [],
      totalProductOrders: totalProductOrders || 0,
      newProductOrders: newProductOrders || 0,
      inProgressProductOrders: inProgressProductOrders || 0,
    };
  } catch (err) {
    console.error(err);
    return {
      totalProducts: 0,
      totalCategories: 0,
      outOfStockCount: 0,
      recentProducts: [],
      totalCustomOrders: 0,
      newCustomOrders: 0,
      inProgressOrders: 0,
      recentCustomOrders: [],
      totalProductOrders: 0,
      newProductOrders: 0,
      inProgressProductOrders: 0,
    };
  }
}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      {/* STATS GRID */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
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

        <div className="admin-stat-card" style={{ borderLeft: '3px solid #3B82F6' }}>
          <div className="admin-stat-label">PESANAN CUSTOM</div>
          <div className="admin-stat-value" style={{ color: '#3B82F6' }}>{stats.totalCustomOrders}</div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
            {stats.newCustomOrders > 0 && (
              <span style={{ color: '#3B82F6', fontWeight: 600 }}>
                {stats.newCustomOrders} baru
              </span>
            )}
            {stats.newCustomOrders > 0 && stats.inProgressOrders > 0 && ' · '}
            {stats.inProgressOrders > 0 && (
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                {stats.inProgressOrders} diproses
              </span>
            )}
          </div>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '3px solid #10B981' }}>
          <div className="admin-stat-label">PESANAN PRODUK (SHOP)</div>
          <div className="admin-stat-value" style={{ color: '#10B981' }}>{stats.totalProductOrders}</div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
            {stats.newProductOrders > 0 && (
              <span style={{ color: '#10B981', fontWeight: 600 }}>
                {stats.newProductOrders} baru
              </span>
            )}
            {stats.newProductOrders > 0 && stats.inProgressProductOrders > 0 && ' · '}
            {stats.inProgressProductOrders > 0 && (
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                {stats.inProgressProductOrders} diproses
              </span>
            )}
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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/admin/custom-orders" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={16} /> PESANAN CUSTOM
            {stats.newCustomOrders > 0 && (
              <span style={{
                backgroundColor: '#EF4444',
                color: '#FFF',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px',
                marginLeft: '4px',
              }}>
                {stats.newCustomOrders}
              </span>
            )}
          </Link>
          <Link href="/admin/product-orders" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#10B981', color: '#047857' }}>
            <ShoppingBag size={16} /> PESANAN PRODUK
            {stats.newProductOrders > 0 && (
              <span style={{
                backgroundColor: '#10B981',
                color: '#FFF',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px',
                marginLeft: '4px',
              }}>
                {stats.newProductOrders}
              </span>
            )}
          </Link>
          <Link href="/admin/products/new" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> TAMBAH PRODUK BARU
          </Link>
          <Link href="/admin/categories" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Grid size={16} /> KELOLA KATEGORI
          </Link>
          <Link href="/admin/settings" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} /> PENGATURAN TOKO
          </Link>
        </div>
      </div>

      {/* RECENT CUSTOM ORDERS */}
      {stats.recentCustomOrders.length > 0 && (
        <div className="admin-table-container" style={{ marginBottom: '32px' }}>
          <div className="admin-table-header">
            <div className="admin-table-title">
              <ClipboardList size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
              PESANAN CUSTOM TERBARU
            </div>
            <Link href="/admin/custom-orders" style={{ fontSize: '0.8125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              LIHAT SEMUA <ArrowRight size={14} />
            </Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>NO. PESANAN</th>
                <th>PELANGGAN</th>
                <th>MODEL</th>
                <th>WARNA</th>
                <th>JUMLAH</th>
                <th>STATUS</th>
                <th>TANGGAL</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCustomOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.BARU;
                return (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {order.orderNumber}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} style={{ color: '#999' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shirt size={13} style={{ color: '#999' }} />
                        {order.garmentModel}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {order.colorHex && (
                          <span style={{
                            display: 'inline-block',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            backgroundColor: order.colorHex,
                            border: '1px solid rgba(0,0,0,0.1)',
                            flexShrink: 0,
                          }} />
                        )}
                        {order.color}
                      </div>
                    </td>
                    <td>
                      <strong>{order.totalQuantity}</strong> pcs
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 10px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        borderRadius: '3px',
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#666' }}>
                        <Clock size={12} />
                        {formatDateShort(order.createdAt)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
