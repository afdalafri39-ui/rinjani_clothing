import Link from 'next/link';

export const metadata = {
  title: 'About Us — Rinjani Clothing',
  description: 'Filosofi dan cerita di balik Rinjani Clothing. Pakaian minimalis terinspirasi dari keindahan alam dan gaya hidup perkotaan.',
};

export default function AboutPage() {
  return (
    <div className="container">
      <div className="about-hero">
        <div className="section-label">ABOUT US</div>
        <h1 className="about-hero-title">
          CLOTHING MADE FOR<br />EVERYDAY MOVEMENT.
        </h1>
        <p className="about-hero-text">
          Berawal dari kekaguman terhadap lanskap megah Gunung Rinjani, kami merancang pakaian yang menggabungkan kesederhanaan visual dengan ketahanan bahan untuk penggunaan harian.
        </p>
      </div>

      <div className="about-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="Rinjani Clothing Philosophy"
        />
      </div>

      <div className="section">
        <div className="about-grid">
          <div>
            <h3 className="about-block-title">PENDEKATAN DESAIN</h3>
            <p className="about-block-text">
              Kami menghindari ornamen berlebihan dan tren sesaat. Fokus utama Rinjani Clothing adalah siluet yang nyaman (relaxed fit), potongan presisi, serta pemilihan warna monokrom dan earth-tone yang abadi.
            </p>
          </div>

          <div>
            <h3 className="about-block-title">KOMITMEN KUALITAS</h3>
            <p className="about-block-text">
              Setiap produk dikembangkan menggunakan serat kain katun combed pilihan (24s & 30s), jahitan rantai berstandar ekspor, dan jahitan kerah yang tidak mudah melar setelah pencucian berulang.
            </p>
          </div>
        </div>
      </div>

      <div className="brand-statement" style={{ borderTop: '1px solid var(--color-gray-200)' }}>
        <div className="section-label">GABUNG DENGAN PERJALANAN KAMI</div>
        <h2 className="brand-statement-title">TEMUKAN KOLEKSI TERBARU</h2>
        <div style={{ marginTop: '32px' }}>
          <Link href="/shop" className="btn btn-primary">
            EXPLORE CATALOG
          </Link>
        </div>
      </div>
    </div>
  );
}
