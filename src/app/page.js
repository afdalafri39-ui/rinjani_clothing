import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60; // SSR with 60s revalidation

async function getHomepageData() {
  try {
    const { data: featuredData } = await supabase
      .from('Product')
      .select('*, category:Category(*), images:ProductImage(*), variants:ProductVariant(*)')
      .eq('status', 'ACTIVE')
      .eq('featured', true)
      .limit(4);

    const { data: newArrivalsData } = await supabase
      .from('Product')
      .select('*, category:Category(*), images:ProductImage(*), variants:ProductVariant(*)')
      .eq('status', 'ACTIVE')
      .order('createdAt', { ascending: false })
      .limit(8);

    const { data: categoriesData } = await supabase
      .from('Category')
      .select('*')
      .eq('active', true)
      .order('displayOrder', { ascending: true })
      .limit(3);

    const sortImages = (list) => {
      if (!list) return [];
      list.forEach((p) => {
        if (Array.isArray(p.images)) {
          p.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        }
      });
      return list;
    };

    return {
      featuredProducts: sortImages(featuredData) || [],
      newArrivals: sortImages(newArrivalsData) || [],
      categories: categoriesData || [],
    };
  } catch (err) {
    console.error('Error loading homepage data:', err);
    return { featuredProducts: [], newArrivals: [], categories: [] };
  }
}

const HERO_BG_IMAGE =
  process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-assets/background.webp`
    : '/background.webp';

export default async function Home() {
  const { featuredProducts, newArrivals } = await getHomepageData();

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_BG_IMAGE}
            alt="Rinjani Clothing Hero"
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.8)' }}>
            NEW COLLECTION 2026
          </div>
          <h1 className="hero-title">MADE FOR THE JOURNEY</h1>
          <p className="hero-subtitle">
            Pakaian harian berbahan premium terinspirasi dari alam, petualangan, dan kultur kontemporer.
          </p>
          <Link href="/shop" className="btn">
            EXPLORE COLLECTION
          </Link>
        </div>
      </section>

      {/* 2. BRAND STATEMENT */}
      <section className="brand-statement">
        <div className="container">
          <div className="section-label">FILOSOFI RINJANI</div>
          <h2 className="brand-statement-title">
            SIMPLISITAS & DAYA TAHAN PADA SETIAP DETAIL.
          </h2>
          <div className="brand-statement-cta">
          </div>
          <p className="brand-statement-text">
            Kami meyakini pakaian bukan sekadar tampilan, melainkan teman dalam setiap perjalanan. Rinjani Clothing mengombinasikan desain minimalis, potongan ergonomis, dan daya tahan material terbaik.
          </p>

          {/* ALUR PEMESANAN CUSTOM */}
          <div style={{ maxWidth: '800px', margin: 'var(--space-9) auto 0', textAlign: 'left' }}>
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
              <div className="section-label">ALUR PEMESANAN</div>
              <h3 className="section-title" style={{ fontSize: '1.75rem' }}>CARA MEMESAN CUSTOM APPAREL</h3>
            </div>

            <div className="custom-steps">
              <div className="custom-step">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Konfigurasi Spesifikasi</h4>
                  <p className="custom-step-desc">
                    Pilih model baju, warna, jenis kain, dan metode cetak menggunakan konfigurator kami. Tentukan ukuran dan jumlah pesanan.
                  </p>
                </div>
              </div>

              <div className="custom-step">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Kirim Desain ke Admin</h4>
                  <p className="custom-step-desc">
                    Kirimkan file desain Anda (format AI, PSD, PNG transparan) beserta detail spesifikasi ke WhatsApp admin kami.
                  </p>
                </div>
              </div>

              <div className="custom-step">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Konfirmasi Mockup & Harga</h4>
                  <p className="custom-step-desc">
                    Tim kami membuatkan visual preview (mockup) dan estimasi biaya terbaik sesuai dengan kuantitas pesanan Anda.
                  </p>
                </div>
              </div>

              <div className="custom-step">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Produksi & Pengiriman</h4>
                  <p className="custom-step-desc">
                    Setelah konfirmasi dan DP, barang masuk tahap produksi lalu dikirim ke seluruh Indonesia.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
              <Link href="/custom" className="btn btn-primary">
                MULAI PESANAN CUSTOM
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OFFICIAL PRODUCT RINJANI CLOTHING */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="section-label">KATALOG PRODUK</div>
              <h2 className="section-title">OFFCIAL PRODUCT </h2>
            </div>
            <Link href="/shop" className="btn btn-secondary">
              LIHAT SEMUA
            </Link>
          </div>

          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CUSTOM PRINTING BANNER */}
      <section className="custom-cta">
        <div className="custom-cta-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1400&q=80&fm=webp"
            alt="Custom Printing Service"
          />
        </div>
        <div className="custom-cta-overlay" />
        <div className="custom-cta-content">
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.8)' }}>
            CUSTOM APPAREL
          </div>
          <h2 className="custom-cta-title">CUSTOM SABLON & PRODUKSI KOLEKSI</h2>
          <p className="custom-cta-text">
            Menerima pemesanan sablon kaos custom untuk komunitas, brand, event, maupun seragam dengan metode DTF, DTG, dan Sablon Manual kualitas standar distro.
          </p>
          <Link href="/custom" className="btn">
            PELAJARI LAYANAN CUSTOM
          </Link>
        </div>
      </section>
    </div>
  );
}
