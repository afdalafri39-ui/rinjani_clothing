import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';

export const revalidate = 60; // SSR with 60s revalidation

// Tingkat Emoji Kepuasan Pelanggan: Dari Murung (1) hingga Bahagia (5)
const EMOJI_RATING_LEVELS = [
  { level: 1, emoji: '😞', label: 'Murung', mood: 'Sangat Kecewa' },
  { level: 2, emoji: '🙁', label: 'Kurang Puas', mood: 'Kecewa' },
  { level: 3, emoji: '😐', label: 'Biasa Saja', mood: 'Netral' },
  { level: 4, emoji: '😊', label: 'Puas', mood: 'Senang' },
  { level: 5, emoji: '🤩', label: 'Sangat Bahagia', mood: 'Luar Biasa' },
];

const CUSTOMER_REVIEWS = [
  {
    id: 1,
    name: 'Dimas Pratama',
    role: 'Ketua Komunitas Motor — Luwu Timur',
    avatar: 'DP',
    review: 'Hasil sablon DTF sangat presisi dan warna keluar sesuai desain asli. Bahan combed 24s-nya tebal tapi tetap adem dipakai harian. Rekomendasi banget untuk seragam komunitas!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Siti Rahmawati',
    role: 'Panitia Event Kreatif — Makassar',
    avatar: 'SR',
    review: 'Pesan 50 pcs kaos oversize custom untuk merchandise event kampus. Jahitan rantainya rapi, sablon tidak mudah pecah, dan proses pengerjaan tepat waktu sebelum hari H.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Budi Santoso',
    role: 'Owner Brand Distro Lokal — Palopo',
    avatar: 'BS',
    review: 'Kualitas kain cotton combed dan potongan bajunya pas di badan. Admin WhatsApp sangat ramah dan komunikatif dalam membantu preview mockup desain sebelum dicetak.',
    rating: 4,
  },
  {
    id: 4,
    name: 'Anisa Fitriani',
    role: 'HR & GA PT Nusantara — Jakarta',
    avatar: 'AF',
    review: 'Order seragam kemeja & polo bordir untuk gathering kantor 120 orang. Hasilnya rapi, bordirnya rapat, dan pengiriman aman sampai Jakarta tepat waktu.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Reza Firmansyah',
    role: 'Founder Creative Studio — Toraja',
    avatar: 'RF',
    review: 'Desain line-art tipis kami berhasil dicetak sangat detail tanpa ada bagian yang blur. Kualitas sablon distro terbaik yang pernah kami pesan online.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Kevin Sanjaya',
    role: 'Koordinator Karang Taruna — Luwu Utara',
    avatar: 'KS',
    review: 'Pelayanan cepat dan transparan dari awal konsultasi sampai barang sampai. Bahan kaos awet dan tidak melar setelah dicuci berkali-kali. Mantap Rinjani!',
    rating: 4,
  },
  {
    id: 7,
    name: 'Maya Anggraini',
    role: 'Event Organizer — Surabaya',
    avatar: 'MA',
    review: 'Sudah langganan untuk beberapa event clothing di Jawa Timur. Komunikasi selalu responsif dan hasil print kaosnya selalu konsisten memuaskan.',
    rating: 5,
  },
];

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
      {/* HERO SLIDESHOW SECTION */}
      <HeroSlideshow />

      {/* 1. KATALOG PRODUK */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal-on-scroll" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="section-label">KATALOG PRODUK</div>
              <h2 className="section-title">OFFICIAL PRODUCT</h2>
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

      {/* 2. ALUR PEMESANAN */}
      <section className="section" style={{ paddingTop: '0', paddingBottom: 'var(--space-9)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
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

            <div className="reveal-on-scroll reveal-delay-2" style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
              <Link href="/custom" className="btn btn-primary">
                MULAI PESANAN CUSTOM
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FILOSOFI RINJANI */}
      <section className="brand-statement" style={{ paddingTop: '0', paddingBottom: 'var(--space-9)' }}>
        <div className="container">
          <div className="section-label reveal-on-scroll">FILOSOFI RINJANI</div>
          <h2 className="brand-statement-title reveal-on-scroll reveal-delay-1">
            SIMPLISITAS & DAYA TAHAN PADA SETIAP DETAIL.
          </h2>
          <p className="brand-statement-text reveal-on-scroll reveal-delay-2">
            Kami meyakini pakaian bukan sekadar tampilan, melainkan teman dalam setiap perjalanan. Rinjani Clothing mengombinasikan desain minimalis, potongan ergonomis, dan daya tahan material terbaik.
          </p>
        </div>
      </section>

      {/* 4. ULASAN PELANGGAN / TESTIMONIALS SLIDER */}
      <section className="section" style={{ paddingTop: '0', paddingBottom: 'var(--space-5)', overflow: 'hidden' }}>
        <div className="container">
          <div className="section-header reveal-on-scroll" style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
            <div className="section-label">ULASAN PELANGGAN</div>
            <h2 className="section-title">APA KATA MEREKA</h2>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '1rem', marginTop: 'var(--space-2)' }}>
              Pengalaman nyata dari para pelanggan dan komunitas yang telah mempercayakan pakaian mereka kepada Rinjani Clothing.
            </p>
          </div>
        </div>

        {/* MARQUEE AUTO SLIDER (KANAN KE KIRI) */}
        <div className="reviews-marquee-wrapper">
          <div className="reviews-marquee-track">
            {[...CUSTOMER_REVIEWS, ...CUSTOMER_REVIEWS].map((item, index) => {
              const currentLevel =
                EMOJI_RATING_LEVELS.find((l) => l.level === item.rating) ||
                EMOJI_RATING_LEVELS[4];

              return (
                <div key={`${item.id}-${index}`} className="review-card-slide">
                  <div>
                    <div className="review-card-rating">
                      <div
                        className="review-emoji-scale"
                        aria-label={`Tingkat kepuasan: ${currentLevel.label} (${item.rating} dari 5)`}
                      >
                        {EMOJI_RATING_LEVELS.map((tier) => {
                          const isSelected = tier.level === item.rating;
                          return (
                            <span
                              key={tier.level}
                              className={`review-emoji-item ${isSelected ? 'is-active' : 'is-inactive'}`}
                              title={`Tingkat ${tier.level}: ${tier.label}`}
                            >
                              {tier.emoji}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <p className="review-card-text">
                      &ldquo;{item.review}&rdquo;
                    </p>
                  </div>

                  <div className="review-card-author">
                    <div className="review-card-avatar">{item.avatar}</div>
                    <div>
                      <div className="review-card-name">{item.name}</div>
                      <div className="review-card-role">{item.role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
