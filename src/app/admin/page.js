import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getDashboardOrderStats } from '@/data/mockOrdersStore';
import { formatPrice, getTotalStock, getStockStatus, getProductImage } from '@/lib/utils';
import { ArrowRight, ClipboardList, Shirt, User, Clock, ShoppingBag } from 'lucide-react';
import DashboardExportButton from '@/components/DashboardExportButton';
import OrderPaymentBadge from '@/components/admin/OrderPaymentBadge';

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
  const fallbackOrders = getDashboardOrderStats();

  if (!isSupabaseConfigured()) {
    return {
      totalProducts: 8,
      totalCategories: 5,
      outOfStockCount: 0,
      recentProducts: [],
      ...fallbackOrders,
    };
  }

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
      { data: recentProductOrders },
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
      supabase.from('ProductOrder').select('*').order('createdAt', { ascending: false }).limit(5),
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
      totalCustomOrders: totalCustomOrders ?? fallbackOrders.totalCustomOrders,
      newCustomOrders: newCustomOrders ?? fallbackOrders.newCustomOrders,
      inProgressOrders: inProgressOrders ?? fallbackOrders.inProgressOrders,
      recentCustomOrders: (recentCustomOrders && recentCustomOrders.length > 0) ? recentCustomOrders : fallbackOrders.recentCustomOrders,
      totalProductOrders: totalProductOrders ?? fallbackOrders.totalProductOrders,
      newProductOrders: newProductOrders ?? fallbackOrders.newProductOrders,
      inProgressProductOrders: inProgressProductOrders ?? fallbackOrders.inProgressProductOrders,
      recentProductOrders: (recentProductOrders && recentProductOrders.length > 0) ? recentProductOrders : fallbackOrders.recentProductOrders,
    };
  } catch (err) {
    console.warn('Dashboard stats DB fetch failed, using fallback:', err.message);
    return {
      totalProducts: 8,
      totalCategories: 5,
      outOfStockCount: 0,
      recentProducts: [],
      ...fallbackOrders,
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
      {/* HEADER TOOLBAR DENGAN EXPORT SPREADSHEET */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-gray-200)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#111' }}>
            Dashboard Ringkasan
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#666', margin: '4px 0 0 0' }}>
            Ringkasan data operasional, statistik KPI toko, pesanan kustomisasi, dan inventaris stok.
          </p>
        </div>

        <DashboardExportButton stats={stats} />
      </div>

      {/* STATS GRID */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">TOTAL PRODUK</div>
          <div className="admin-stat-value">{stats.totalProducts}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">STOK HABIS</div>
          <div className="admin-stat-value" style={{ color: stats.outOfStockCount > 0 ? '#C53030' : 'inherit' }}>
            {stats.outOfStockCount}
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">PESANAN CUSTOM</div>
          <div className="admin-stat-value">{stats.totalCustomOrders}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">PESANAN PRODUK</div>
          <div className="admin-stat-value">{stats.totalProductOrders}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">TOTAL KATEGORI</div>
          <div className="admin-stat-value">{stats.totalCategories}</div>
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
                <th>PEMBAYARAN</th>
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
                      <OrderPaymentBadge order={order} />
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

      {/* RECENT PRODUCT ORDERS */}
      {stats.recentProductOrders && stats.recentProductOrders.length > 0 && (
        <div className="admin-table-container" style={{ marginBottom: '32px' }}>
          <div className="admin-table-header">
            <div className="admin-table-title">
              <ShoppingBag size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
              PESANAN PRODUK TERBARU
            </div>
            <Link href="/admin/product-orders" style={{ fontSize: '0.8125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              LIHAT SEMUA <ArrowRight size={14} />
            </Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>NO. PESANAN</th>
                <th>PELANGGAN</th>
                <th>PRODUK</th>
                <th>QTY</th>
                <th>TOTAL</th>
                <th>PEMBAYARAN</th>
                <th>STATUS</th>
                <th>TANGGAL</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentProductOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.BARU;
                const total = order.totalPrice || (order.price * order.quantity) || 0;
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
                      <div style={{ fontWeight: 500 }}>{order.productName}</div>
                      {(order.size || order.color) && (
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          {[order.size, order.color].filter(Boolean).join(' • ')}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{order.quantity}</strong> pcs
                    </td>
                    <td>
                      <strong style={{ color: '#FF3D00' }}>{formatPrice(total)}</strong>
                    </td>
                    <td>
                      <OrderPaymentBadge order={order} />
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
              const img = getProductImage(p);

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
