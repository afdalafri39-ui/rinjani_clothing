import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60; // SSR with 60s revalidation

async function getHomepageData() {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE', featured: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
      take: 4,
    });

    const newArrivals = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    const categories = await prisma.category.findMany({
      where: { active: true },
      take: 3,
      orderBy: { displayOrder: 'asc' },
    });

    return { featuredProducts, newArrivals, categories };
  } catch (err) {
    console.error('Error loading homepage data:', err);
    return { featuredProducts: [], newArrivals: [], categories: [] };
  }
}

export default async function Home() {
  const { featuredProducts, newArrivals } = await getHomepageData();

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/background.png"
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
          <p className="brand-statement-text">
            Kami meyakini pakaian bukan sekadar tampilan, melainkan teman dalam setiap perjalanan. Rinjani Clothing mengombinasikan desain minimalis, potongan ergonomis, dan daya tahan material terbaik.
          </p>
        </div>
      </section>

      {/* 3. FEATURED COLLECTION EDITORIAL GRID */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">KOLEKSI PILIHAN</div>
            <h2 className="section-title">EDITORIAL LOOKBOOK</h2>
          </div>

          <div className="collection-grid collection-grid-editorial">
            <div className="collection-item collection-item-large">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=80"
                alt="Oversize Collection"
              />
              <div className="collection-item-overlay">
                <div>
                  <div className="collection-item-title">THE OVERSIZE SERIES</div>
                  <div className="collection-item-subtitle">Comfortable relaxed fit cotton combed 24s</div>
                </div>
              </div>
            </div>

            <div className="collection-grid-row">
              <div className="collection-item collection-item-medium">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&q=80"
                  alt="Outdoor Apparel"
                />
                <div className="collection-item-overlay">
                  <div>
                    <div className="collection-item-title">MOUNTAIN & TRAIL TEE</div>
                    <div className="collection-item-subtitle">High breathability for active movement</div>
                  </div>
                </div>
              </div>

              <div className="collection-item collection-item-medium">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80"
                  alt="Hoodies & Outerwear"
                />
                <div className="collection-item-overlay">
                  <div>
                    <div className="collection-item-title">BASECAMP HOODIES</div>
                    <div className="collection-item-subtitle">Heavyweight fleece warmth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="section-label">KATALOG PRODUK</div>
              <h2 className="section-title">NEW ARRIVALS</h2>
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
            src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1400&q=80"
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
