import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';

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

export default async function Home() {
  const { featuredProducts, newArrivals } = await getHomepageData();

  return (
    <div>
      {/* 1. HERO SLIDESHOW SECTION */}
      <HeroSlideshow />

      {/* 2. BRAND STATEMENT */}
      <section className="brand-statement">
        <div className="container">
          <div className="section-label reveal-on-scroll">FILOSOFI RINJANI</div>
          <h2 className="brand-statement-title reveal-on-scroll reveal-delay-1">
            SIMPLISITAS & DAYA TAHAN PADA SETIAP DETAIL.
          </h2>
          <div className="brand-statement-cta">
          </div>
          <p className="brand-statement-text reveal-on-scroll reveal-delay-2">
            Kami meyakini pakaian bukan sekadar tampilan, melainkan teman dalam setiap perjalanan. Rinjani Clothing mengombinasikan desain minimalis, potongan ergonomis, dan daya tahan material terbaik.
          </p>

          {/* ALUR PEMESANAN CUSTOM */}
          <div style={{ maxWidth: '800px', margin: 'var(--space-9) auto 0', textAlign: 'left' }}>
            <div className="section-header reveal-on-scroll" style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
              <div className="section-label">ALUR PEMESANAN</div>
              <h3 className="section-title" style={{ fontSize: '1.75rem' }}>CARA MEMESAN CUSTOM APPAREL</h3>
            </div>

            <div className="custom-steps reveal-stagger">
              <div className="custom-step reveal-on-scroll">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Konfigurasi Spesifikasi</h4>
                  <p className="custom-step-desc">
                    Pilih model baju, warna, jenis kain, dan metode cetak menggunakan konfigurator kami. Tentukan ukuran dan jumlah pesanan.
                  </p>
                </div>
              </div>

              <div className="custom-step reveal-on-scroll">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Kirim Desain ke Admin</h4>
                  <p className="custom-step-desc">
                    Kirimkan file desain Anda (format AI, PSD, PNG transparan) beserta detail spesifikasi ke WhatsApp admin kami.
                  </p>
                </div>
              </div>

              <div className="custom-step reveal-on-scroll">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Konfirmasi Mockup & Harga</h4>
                  <p className="custom-step-desc">
                    Tim kami membuatkan visual preview (mockup) dan estimasi biaya terbaik sesuai dengan kuantitas pesanan Anda.
                  </p>
                </div>
              </div>

              <div className="custom-step reveal-on-scroll">
                <div className="custom-step-number" />
                <div>
                  <h4 className="custom-step-title">Produksi & Pengiriman</h4>
                  <p className="custom-step-desc">
                    Setelah konfirmasi dan DP, barang masuk tahap produksi lalu dikirim ke seluruh Indonesia.
                  </p>
                </div>
              </div>
            </div>

            <div className="reveal-on-scroll reveal-delay-2" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
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
          <div className="section-header reveal-on-scroll" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="section-label">KATALOG PRODUK</div>
              <h2 className="section-title">OFFCIAL PRODUCT </h2>
            </div>
            <Link href="/shop" className="btn btn-secondary">
              LIHAT SEMUA
            </Link>
          </div>

          <div className="product-grid reveal-stagger">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} className="reveal-on-scroll reveal-scale" />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CUSTOM PRINTING BANNER */}
      <section className="custom-cta reveal-on-scroll reveal-fade">
        <div className="custom-cta-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1400&q=80&fm=webp"
            alt="Custom Printing Service"
          />
        </div>
        <div className="custom-cta-overlay" />
        <div className="custom-cta-content reveal-on-scroll reveal-up reveal-delay-1">
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
