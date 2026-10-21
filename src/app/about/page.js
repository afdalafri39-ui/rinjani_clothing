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

      <div className="section" style={{ paddingTop: 'var(--space-6)' }}>
        {/* PROFIL RINJANI */}
        <div
          style={{
            marginBottom: 'var(--space-9)',
            paddingBottom: 'var(--space-9)',
            borderBottom: '1px solid var(--color-gray-200)',
            width: '100%',
          }}
        >
          <div style={{ width: '100%' }}>
            <h3
              className="about-block-title"
              style={{
                fontSize: '24px',
                lineHeight: '32px',
                marginBottom: '24px',
                textAlign: 'center',
                letterSpacing: '0.06em',
              }}
            >
              PROFIL RINJANI
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <p
                className="about-block-text"
                style={{
                  fontSize: '16px',
                  lineHeight: '32px',
                  color: 'var(--color-gray-700, #404040)',
                }}
              >
                Rinjani Clothing merupakan brand clothing asal Luwu Timur yang bergerak di bidang custom apparel dan jasa sablon pakaian. Rinjani Clothing hadir untuk memenuhi kebutuhan individu, komunitas, organisasi, hingga bisnis dalam menciptakan pakaian dengan desain yang unik, personal, dan sesuai identitas pelanggan.
              </p>
              <p
                className="about-block-text"
                style={{
                  fontSize: '16px',
                  lineHeight: '32px',
                  color: 'var(--color-gray-700, #404040)',
                }}
              >
                Dengan mengedepankan kualitas hasil sablon, ketelitian dalam proses produksi, serta kreativitas dalam desain, Rinjani Clothing berkomitmen memberikan produk yang tidak hanya nyaman digunakan, tetapi juga memiliki karakter dan nilai visual yang kuat.
              </p>
              <p
                className="about-block-text"
                style={{
                  fontSize: '16px',
                  lineHeight: '32px',
                  color: 'var(--color-gray-700, #404040)',
                }}
              >
                Nama &ldquo;Rinjani&rdquo; merepresentasikan semangat untuk terus berkembang, memiliki karakter yang kuat, dan menghadirkan karya yang dapat menjadi bagian dari identitas setiap pelanggan.
              </p>
            </div>
          </div>
        </div>

        {/* PENDEKATAN DESAIN & KOMITMEN KUALITAS */}
        <div className="about-grid">
          <div>
            <h3
              className="about-block-title"
              style={{
                fontSize: '24px',
                lineHeight: '32px',
                marginBottom: '24px',
                letterSpacing: '0.04em',
              }}
            >
              PENDEKATAN DESAIN
            </h3>
            <p
              className="about-block-text"
              style={{
                fontSize: '16px',
                lineHeight: '32px',
                color: 'var(--color-gray-700, #404040)',
              }}
            >
              Kami menghindari ornamen berlebihan dan tren sesaat. Fokus utama Rinjani Clothing adalah siluet yang nyaman (relaxed fit), potongan presisi, serta pemilihan warna monokrom dan earth-tone yang abadi.
            </p>
          </div>

          <div>
            <h3
              className="about-block-title"
              style={{
                fontSize: '24px',
                lineHeight: '32px',
                marginBottom: '24px',
                letterSpacing: '0.04em',
              }}
            >
              KOMITMEN KUALITAS
            </h3>
            <p
              className="about-block-text"
              style={{
                fontSize: '16px',
                lineHeight: '32px',
                color: 'var(--color-gray-700, #404040)',
              }}
            >
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
