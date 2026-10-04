'use client';

import { useState } from 'react';
import ContactModal from '@/components/ContactModal';

export default function CustomPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <section className="container custom-hero">
        <div className="section-label">CUSTOM SABLON & PRODUKSI</div>
        <h1 className="custom-hero-title">BAWA DESAINMU.<br />KAMI BANTU MEWUJUDKANNYA.</h1>
        <p className="custom-hero-text">
          Layanan produksi apparel custom Rinjani Clothing untuk brand, komunitas, event, maupun instansi. Menggunakan bahan kaos premium dan hasil sablon tahan lama.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => setIsModalOpen(true)}>
          KONSULTASI DESAIN DENGAN ADMIN
        </button>
      </section>

      {/* PRINTING METHODS */}
      <section className="section" style={{ backgroundColor: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <div className="section-label">TEKNOLOGI SABLON</div>
            <h2 className="section-title">METODE PENCETAKAN</h2>
          </div>

          <div className="custom-methods">
            <div className="custom-method-card">
              <h3 className="custom-method-title">SABLON DTF (DIGITAL TRANSFER FILM)</h3>
              <p className="custom-method-desc">
                Sangat presisi untuk desain banyak warna, gradasi halus, serta detail tajam. Hasil cetak lentur dan tahan cuci berkali-kali.
              </p>
            </div>

            <div className="custom-method-card">
              <h3 className="custom-method-title">SABLON PLASTISOL MANUAL</h3>
              <p className="custom-method-desc">
                Pilihan utama untuk pesanan jumlah besar. Warna sangat solid, berkarakter, tahan lama, dan menjadi standar brand clothing profesional.
              </p>
            </div>

            <div className="custom-method-card">
              <h3 className="custom-method-title">DISCHARGE / RUBBER</h3>
              <p className="custom-method-desc">
                Teknik sablon yang menyerap ke serat kain sehingga menghasilkan handfeel sangat lembut (soft handfeel) dan nyaman dipakai seharian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header">
            <div className="section-label">ALUR PEMESANAN</div>
            <h2 className="section-title">CARA MEMESAN CUSTOM APPAREL</h2>
          </div>

          <div className="custom-steps">
            <div className="custom-step">
              <div className="custom-step-number" />
              <div>
                <h3 className="custom-step-title">Kirim Desain & Spesifikasi</h3>
                <p className="custom-step-desc">
                  Kirimkan file desain Anda (format AI, PSD, PNG transparan) beserta rincian jumlah, jenis kain, dan pilihan warna ke WhatsApp admin.
                </p>
              </div>
            </div>

            <div className="custom-step">
              <div className="custom-step-number" />
              <div>
                <h3 className="custom-step-title">Konfirmasi Digital Mockup & Penawaran</h3>
                <p className="custom-step-desc">
                  Tim kami membuatkan visual preview (mockup) dan estimasi biaya terbaik sesuai dengan kuantitas pesanan Anda.
                </p>
              </div>
            </div>

            <div className="custom-step">
              <div className="custom-step-number" />
              <div>
                <h3 className="custom-step-title">Proses Produksi</h3>
                <p className="custom-step-desc">
                  Setelah konfirmasi dan pemrosesan DP, barang langsung masuk tahap pemotongan kain, pencetakan sablon, hingga Quality Control.
                </p>
              </div>
            </div>

            <div className="custom-step">
              <div className="custom-step-number" />
              <div>
                <h3 className="custom-step-title">Pengiriman</h3>
                <p className="custom-step-desc">
                  Pesanan yang selesai di-packing rapi dan siap dikirim ke alamat Anda di seluruh Indonesia.
                </p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              MULAI PESAN CUSTOM SEKARANG
            </button>
          </div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
