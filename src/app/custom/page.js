'use client';

import { useState, useEffect, useRef } from 'react';
import ContactModal from '@/components/ContactModal';
import { ChevronRight, ChevronLeft, Check, Printer, Palette, Shirt, Layers, Send, RotateCcw, Sparkles, Info } from 'lucide-react';

// ============================================================
// DATA: Garment models, colors, fabrics, printing methods
// ============================================================

const GARMENT_MODELS = [
  {
    id: 'tshirt-reguler',
    name: 'T-Shirt Reguler',
    category: 'T-Shirt',
    description: 'Kaos lengan pendek potongan reguler fit, nyaman untuk harian.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    id: 'tshirt-oversize',
    name: 'T-Shirt Oversize',
    category: 'T-Shirt',
    description: 'Kaos oversize dengan drop shoulder, tampilan streetwear modern.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  },
  {
    id: 'polo-shirt',
    name: 'Polo Shirt',
    category: 'Polo',
    description: 'Polo shirt klasik dengan kerah, cocok untuk seragam atau casual.',
    image: 'https://images.unsplash.com/photo-1625910513413-5fc421e0fd4f?w=800&q=80',
  },
  {
    id: 'long-sleeve',
    name: 'Long Sleeve',
    category: 'Long Sleeve',
    description: 'Kaos lengan panjang, cocok untuk cuaca sejuk dan gaya layering.',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'Hoodie',
    description: 'Hoodie pullover dengan kangaroo pocket, bahan fleece tebal.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
  },
  {
    id: 'jersey',
    name: 'Jersey Sport',
    category: 'Jersey',
    description: 'Jersey olahraga bahan Dri-Fit, ringan dan breathable.',
    image: 'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=800&q=80',
  },
  {
    id: 'raglan',
    name: 'Raglan',
    category: 'Raglan',
    description: 'Raglan 3/4 sleeves dua warna, gaya vintage baseball.',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
  },
  {
    id: 'tanktop',
    name: 'Tank Top',
    category: 'Tank Top',
    description: 'Tank top sleeveless, cocok untuk olahraga dan cuaca panas.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
  },
];

const COLORS = [
  { id: 'hitam', name: 'Hitam', hex: '#1a1a1a' },
  { id: 'putih', name: 'Putih', hex: '#FFFFFF' },
  { id: 'navy', name: 'Navy Blue', hex: '#1B2A4A' },
  { id: 'abu-tua', name: 'Abu-abu Tua', hex: '#4A4A4A' },
  { id: 'abu-muda', name: 'Abu-abu Muda', hex: '#B0B0B0' },
  { id: 'merah', name: 'Merah', hex: '#C41E3A' },
  { id: 'maroon', name: 'Maroon', hex: '#6B1C23' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#2855AE' },
  { id: 'baby-blue', name: 'Baby Blue', hex: '#89CFF0' },
  { id: 'hijau-army', name: 'Hijau Army', hex: '#4B5320' },
  { id: 'hijau-botol', name: 'Hijau Botol', hex: '#006A4E' },
  { id: 'kuning', name: 'Kuning', hex: '#FFD700' },
  { id: 'mustard', name: 'Mustard', hex: '#C9932E' },
  { id: 'orange', name: 'Orange', hex: '#E86F2C' },
  { id: 'pink', name: 'Pink', hex: '#E8879C' },
  { id: 'ungu', name: 'Ungu', hex: '#5D3A8E' },
  { id: 'cream', name: 'Cream / Krem', hex: '#F5E6CA' },
  { id: 'coklat', name: 'Coklat', hex: '#6B4226' },
];

const FABRICS = [
  {
    id: 'combed-20s',
    name: 'Cotton Combed 20s',
    weight: '190–200 gsm',
    description: 'Tebal, cocok untuk sablon DTF & manual. Bahan standar distro.',
    best_for: ['Sablon Manual', 'DTF'],
    texture: 'Tebal & Kokoh',
  },
  {
    id: 'combed-24s',
    name: 'Cotton Combed 24s',
    weight: '170–180 gsm',
    description: 'Lebih halus dari 20s, tetap nyaman. Pilihan paling populer.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Medium & Lembut',
  },
  {
    id: 'combed-30s',
    name: 'Cotton Combed 30s',
    weight: '140–160 gsm',
    description: 'Tipis & ringan, adem untuk iklim tropis. Cocok untuk harian.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Tipis & Ringan',
  },
  {
    id: 'cvc',
    name: 'CVC (Cotton Viscose)',
    weight: '150–170 gsm',
    description: 'Campuran katun & viscose 55:45, lembut dan sedikit stretch.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Lembut & Stretch',
  },
  {
    id: 'tc',
    name: 'TC (Teteron Cotton)',
    weight: '140–160 gsm',
    description: 'Campuran polyester & katun 65:35. Tidak mudah kusut, terjangkau.',
    best_for: ['DTF', 'Sablon Manual'],
    texture: 'Licin & Anti Kusut',
  },
  {
    id: 'polyester',
    name: 'Polyester / Dry-Fit',
    weight: '120–150 gsm',
    description: 'Ringan, cepat kering, menyerap keringat. Ideal untuk olahraga & jersey.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Licin & Cepat Kering',
  },
  {
    id: 'fleece',
    name: 'Fleece (untuk Hoodie)',
    weight: '260–320 gsm',
    description: 'Bahan tebal, hangat, bagian dalam berbulu halus. Khusus hoodie & jaket.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Tebal & Hangat',
  },
  {
    id: 'baby-terry',
    name: 'Baby Terry',
    weight: '230–260 gsm',
    description: 'Bahan hoodie premium, lebih ringan dari fleece tapi tetap hangat.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Medium & Lembut',
  },
  {
    id: 'hyget',
    name: 'Hyget',
    weight: '100–130 gsm',
    description: 'Bahan tipis & jatuh, sering dipakai untuk jersey dan event.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Tipis & Jatuh',
  },
  {
    id: 'lacoste',
    name: 'Lacoste / Pique',
    weight: '200–230 gsm',
    description: 'Bahan tekstur waffle khas polo shirt. Premium & berkarakter.',
    best_for: ['DTF', 'Polyflex'],
    texture: 'Bertekstur & Kokoh',
  },
];

const PRINTING_METHODS = [
  {
    id: 'dtf',
    name: 'DTF (Digital Transfer Film)',
    tagline: 'Paling Populer',
    icon: '🖨️',
    description: 'Cetak digital ke film khusus, lalu dipres ke kain. Sangat presisi untuk desain banyak warna, gradasi halus, foto, dan detail tajam.',
    pros: ['Warna unlimited & gradasi halus', 'Cocok untuk semua warna kain', 'Detail tajam & presisi tinggi', 'Tahan cuci 50+ kali'],
    cons: ['Terasa sedikit tebal di atas kain', 'Kurang cocok untuk full-body print'],
    best_for: 'Desain kompleks, full-color, logo, foto.',
    min_order: '1 pcs',
  },
  {
    id: 'polyflex',
    name: 'Polyflex (Vinyl Cutting)',
    tagline: 'Tahan Lama',
    icon: '✂️',
    description: 'Bahan vinyl yang dipotong sesuai desain lalu dipres ke kain. Hasil sangat rapi, solid, dan tahan lama. Cocok untuk nama, nomor, atau logo sederhana.',
    pros: ['Warna sangat solid & tajam', 'Tahan lama & anti luntur', 'Cocok untuk nama & nomor punggung', 'Finishing glossy/matte/flock'],
    cons: ['Terbatas 1–3 warna per desain', 'Tidak bisa gradasi warna'],
    best_for: 'Nama, nomor punggung, logo 1-3 warna.',
    min_order: '1 pcs',
  },
  {
    id: 'manual',
    name: 'Sablon Manual (Plastisol)',
    tagline: 'Standar Distro',
    icon: '🎨',
    description: 'Teknik sablon klasik menggunakan screen & rakel. Warna sangat solid, hasil premium standar brand clothing. Pilihan utama untuk produksi massal.',
    pros: ['Warna paling solid & tebal', 'Standar industri clothing', 'Harga per pcs murah di jumlah besar', 'Handfeel premium'],
    cons: ['Biaya screen per warna', 'Minimum order biasanya 24+ pcs', 'Terbatas jumlah warna'],
    best_for: 'Produksi massal 24+ pcs, brand clothing, merchandise.',
    min_order: '24 pcs',
  },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StepIndicator({ currentStep, totalSteps, steps, onStepClick }) {
  return (
    <div className="configurator-steps">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <button
            key={step.id}
            className={`configurator-step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => isCompleted && onStepClick(stepNum)}
            disabled={!isCompleted && !isActive}
          >
            <div className="configurator-step-number">
              {isCompleted ? <Check size={14} /> : stepNum}
            </div>
            <div className="configurator-step-info">
              <span className="configurator-step-label">{step.label}</span>
              <span className="configurator-step-sublabel">{step.sublabel}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CustomPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedPrinting, setSelectedPrinting] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPrinting, setExpandedPrinting] = useState(null);
  const contentRef = useRef(null);

  const steps = [
    { id: 'model', label: 'Model Baju', sublabel: selectedModel?.name || 'Pilih model' },
    { id: 'color', label: 'Warna', sublabel: selectedColor?.name || 'Pilih warna' },
    { id: 'fabric', label: 'Jenis Kain', sublabel: selectedFabric?.name || 'Pilih kain' },
    { id: 'printing', label: 'Mesin Cetak', sublabel: selectedPrinting?.name || 'Pilih metode' },
    { id: 'summary', label: 'Ringkasan', sublabel: 'Konfirmasi pesanan' },
  ];

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const handleStepClick = (step) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedModel(null);
    setSelectedColor(null);
    setSelectedFabric(null);
    setSelectedPrinting(null);
    setSelectedSizes({});
    setNotes('');
    scrollToTop();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedModel;
      case 2: return !!selectedColor;
      case 3: return !!selectedFabric;
      case 4: return !!selectedPrinting;
      default: return true;
    }
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => {
      const newSizes = { ...prev };
      if (newSizes[size]) {
        delete newSizes[size];
      } else {
        newSizes[size] = 1;
      }
      return newSizes;
    });
  };

  const handleSizeQty = (size, qty) => {
    if (qty < 1) return;
    setSelectedSizes(prev => ({ ...prev, [size]: qty }));
  };

  const totalQuantity = Object.values(selectedSizes).reduce((sum, q) => sum + q, 0);

  // Build order message for WhatsApp
  const buildOrderSummary = () => {
    const sizeList = Object.entries(selectedSizes)
      .filter(([, qty]) => qty > 0)
      .map(([size, qty]) => `  ${size}: ${qty} pcs`)
      .join('\n');

    return {
      product_name: `Custom ${selectedModel?.name || ''}`,
      size: Object.entries(selectedSizes).map(([s, q]) => `${s}(${q})`).join(', ') || '-',
      color: selectedColor?.name || '-',
      quantity: totalQuantity || 1,
      price: '-',
      product_slug: 'custom-order',
      product_url: typeof window !== 'undefined' ? window.location.href : '',
      // Extra fields for the custom message
      fabric: selectedFabric?.name || '-',
      printing: selectedPrinting?.name || '-',
      notes: notes || '-',
    };
  };

  const productDataForModal = selectedModel ? {
    name: `Custom ${selectedModel.name}`,
    slug: 'custom-order',
    price: 'Hubungi Admin',
    selectedSize: Object.entries(selectedSizes).map(([s, q]) => `${s}(${q})`).join(', ') || '-',
    selectedColor: selectedColor?.name || '-',
    quantity: totalQuantity || 1,
    customData: {
      fabric: selectedFabric?.name || '-',
      printing: selectedPrinting?.name || '-',
      notes: notes || '-',
    },
  } : null;

  return (
    <div className="configurator-page">
      {/* HERO BANNER */}
      <section className="configurator-hero">
        <div className="configurator-hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&q=80"
            alt="Custom Order"
          />
        </div>
        <div className="configurator-hero-overlay" />
        <div className="configurator-hero-content">
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.7)' }}>
            CUSTOM ORDER SYSTEM
          </div>
          <h1 className="configurator-hero-title">
            DESAIN BAJUMU<br />SESUAI KEINGINAN.
          </h1>
          <p className="configurator-hero-text">
            Pilih model, warna, jenis kain, dan metode cetak — kami produksi sesuai spesifikasi Anda.
          </p>
        </div>
      </section>

      {/* CONFIGURATOR */}
      <section className="configurator-wrapper">
        <div className="container">
          {/* STEP INDICATORS */}
          <StepIndicator
            currentStep={currentStep}
            totalSteps={5}
            steps={steps}
            onStepClick={handleStepClick}
          />

          <div className="configurator-body" ref={contentRef}>
            {/* STEP 1: MODEL SELECTION */}
            {currentStep === 1 && (
              <div className="configurator-panel animate-fade-in">
                <div className="configurator-panel-header">
                  <div>
                    <div className="configurator-panel-step">LANGKAH 1 / 5</div>
                    <h2 className="configurator-panel-title">Pilih Model Baju</h2>
                    <p className="configurator-panel-desc">
                      Pilih model/jenis baju yang ingin Anda pesan custom.
                    </p>
                  </div>
                </div>

                <div className="model-grid">
                  {GARMENT_MODELS.map((model) => (
                    <button
                      key={model.id}
                      className={`model-card ${selectedModel?.id === model.id ? 'selected' : ''}`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <div className="model-card-image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={model.image} alt={model.name} loading="lazy" />
                        {selectedModel?.id === model.id && (
                          <div className="model-card-check">
                            <Check size={20} />
                          </div>
                        )}
                      </div>
                      <div className="model-card-info">
                        <span className="model-card-category">{model.category}</span>
                        <span className="model-card-name">{model.name}</span>
                        <span className="model-card-desc">{model.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: COLOR SELECTION */}
            {currentStep === 2 && (
              <div className="configurator-panel animate-fade-in">
                <div className="configurator-panel-header">
                  <div>
                    <div className="configurator-panel-step">LANGKAH 2 / 5</div>
                    <h2 className="configurator-panel-title">Pilih Warna</h2>
                    <p className="configurator-panel-desc">
                      Pilih warna dasar kain untuk {selectedModel?.name || 'baju'} Anda.
                    </p>
                  </div>
                </div>

                {/* Preview area */}
                <div className="color-preview-area">
                  <div className="color-preview-garment">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedModel?.image || ''}
                      alt={selectedModel?.name || ''}
                      style={{
                        filter: selectedColor
                          ? `hue-rotate(0deg)`
                          : 'none',
                      }}
                    />
                    {selectedColor && (
                      <div
                        className="color-preview-overlay"
                        style={{
                          backgroundColor: selectedColor.hex,
                          mixBlendMode: 'multiply',
                          opacity: 0.6,
                        }}
                      />
                    )}
                  </div>
                  <div className="color-preview-info">
                    {selectedColor ? (
                      <>
                        <div
                          className="color-preview-swatch-large"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <span className="color-preview-name">{selectedColor.name}</span>
                        <span className="color-preview-hex">{selectedColor.hex}</span>
                      </>
                    ) : (
                      <span className="color-preview-placeholder">
                        <Palette size={24} />
                        Pilih warna di bawah
                      </span>
                    )}
                  </div>
                </div>

                {/* Color swatches */}
                <div className="color-swatch-grid">
                  {COLORS.map((color) => (
                    <button
                      key={color.id}
                      className={`color-swatch ${selectedColor?.id === color.id ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                    >
                      <div
                        className="color-swatch-circle"
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor?.id === color.id && (
                          <Check
                            size={16}
                            color={
                              ['putih', 'cream', 'kuning', 'baby-blue', 'abu-muda', 'pink'].includes(color.id)
                                ? '#111'
                                : '#FFF'
                            }
                          />
                        )}
                      </div>
                      <span className="color-swatch-name">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: FABRIC SELECTION */}
            {currentStep === 3 && (
              <div className="configurator-panel animate-fade-in">
                <div className="configurator-panel-header">
                  <div>
                    <div className="configurator-panel-step">LANGKAH 3 / 5</div>
                    <h2 className="configurator-panel-title">Pilih Jenis Kain</h2>
                    <p className="configurator-panel-desc">
                      Setiap kain punya karakter berbeda. Pilih yang paling sesuai kebutuhanmu.
                    </p>
                  </div>
                </div>

                <div className="fabric-grid">
                  {FABRICS.map((fabric) => (
                    <button
                      key={fabric.id}
                      className={`fabric-card ${selectedFabric?.id === fabric.id ? 'selected' : ''}`}
                      onClick={() => setSelectedFabric(fabric)}
                    >
                      <div className="fabric-card-header">
                        <div className="fabric-card-icon">
                          <Layers size={20} />
                        </div>
                        {selectedFabric?.id === fabric.id && (
                          <div className="fabric-card-check">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                      <h3 className="fabric-card-name">{fabric.name}</h3>
                      <div className="fabric-card-weight">{fabric.weight}</div>
                      <p className="fabric-card-desc">{fabric.description}</p>
                      <div className="fabric-card-meta">
                        <span className="fabric-card-texture">{fabric.texture}</span>
                      </div>
                      <div className="fabric-card-tags">
                        {fabric.best_for.map((tag) => (
                          <span key={tag} className="fabric-tag">{tag}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: PRINTING METHOD */}
            {currentStep === 4 && (
              <div className="configurator-panel animate-fade-in">
                <div className="configurator-panel-header">
                  <div>
                    <div className="configurator-panel-step">LANGKAH 4 / 5</div>
                    <h2 className="configurator-panel-title">Pilih Mesin Cetak</h2>
                    <p className="configurator-panel-desc">
                      Metode pencetakan sablon yang menentukan hasil akhir desain pada baju.
                    </p>
                  </div>
                </div>

                <div className="printing-grid">
                  {PRINTING_METHODS.map((method) => (
                    <button
                      key={method.id}
                      className={`printing-card ${selectedPrinting?.id === method.id ? 'selected' : ''} ${expandedPrinting === method.id ? 'expanded' : ''}`}
                      onClick={() => setSelectedPrinting(method)}
                    >
                      <div className="printing-card-top">
                        <div className="printing-card-icon-area">
                          <span className="printing-card-emoji">{method.icon}</span>
                          <span className="printing-card-tagline">{method.tagline}</span>
                        </div>
                        {selectedPrinting?.id === method.id && (
                          <div className="printing-card-check">
                            <Check size={16} />
                          </div>
                        )}
                      </div>

                      <h3 className="printing-card-name">{method.name}</h3>
                      <p className="printing-card-desc">{method.description}</p>

                      <div className="printing-card-details">
                        <div className="printing-card-section">
                          <span className="printing-card-section-title">✅ Kelebihan</span>
                          <ul className="printing-card-list">
                            {method.pros.map((pro, i) => (
                              <li key={i}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="printing-card-section">
                          <span className="printing-card-section-title">⚠️ Kekurangan</span>
                          <ul className="printing-card-list cons">
                            {method.cons.map((con, i) => (
                              <li key={i}>{con}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="printing-card-footer">
                          <div>
                            <span className="printing-card-meta-label">Cocok untuk:</span>
                            <span className="printing-card-meta-value">{method.best_for}</span>
                          </div>
                          <div>
                            <span className="printing-card-meta-label">Min. order:</span>
                            <span className="printing-card-meta-value">{method.min_order}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="printing-card-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPrinting(expandedPrinting === method.id ? null : method.id);
                        }}
                      >
                        <Info size={14} />
                        {expandedPrinting === method.id ? 'Tutup Detail' : 'Lihat Detail'}
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: SUMMARY */}
            {currentStep === 5 && (
              <div className="configurator-panel animate-fade-in">
                <div className="configurator-panel-header">
                  <div>
                    <div className="configurator-panel-step">LANGKAH 5 / 5</div>
                    <h2 className="configurator-panel-title">Ringkasan Pesanan</h2>
                    <p className="configurator-panel-desc">
                      Periksa kembali spesifikasi pesanan custom Anda sebelum menghubungi admin.
                    </p>
                  </div>
                </div>

                <div className="summary-layout">
                  {/* Preview */}
                  <div className="summary-preview">
                    <div className="summary-preview-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedModel?.image || ''} alt={selectedModel?.name || ''} />
                      {selectedColor && (
                        <div
                          className="color-preview-overlay"
                          style={{
                            backgroundColor: selectedColor.hex,
                            mixBlendMode: 'multiply',
                            opacity: 0.5,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="summary-details">
                    <div className="summary-item">
                      <div className="summary-item-icon"><Shirt size={18} /></div>
                      <div className="summary-item-content">
                        <span className="summary-item-label">Model Baju</span>
                        <span className="summary-item-value">{selectedModel?.name}</span>
                        <span className="summary-item-sub">{selectedModel?.description}</span>
                      </div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-item-icon">
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          backgroundColor: selectedColor?.hex || '#ddd',
                          border: '2px solid rgba(0,0,0,0.1)',
                        }} />
                      </div>
                      <div className="summary-item-content">
                        <span className="summary-item-label">Warna</span>
                        <span className="summary-item-value">{selectedColor?.name}</span>
                      </div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-item-icon"><Layers size={18} /></div>
                      <div className="summary-item-content">
                        <span className="summary-item-label">Jenis Kain</span>
                        <span className="summary-item-value">{selectedFabric?.name}</span>
                        <span className="summary-item-sub">{selectedFabric?.weight} — {selectedFabric?.texture}</span>
                      </div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-item-icon"><Printer size={18} /></div>
                      <div className="summary-item-content">
                        <span className="summary-item-label">Metode Cetak</span>
                        <span className="summary-item-value">{selectedPrinting?.name}</span>
                        <span className="summary-item-sub">Min. order: {selectedPrinting?.min_order}</span>
                      </div>
                    </div>

                    {/* SIZE & QUANTITY */}
                    <div className="summary-sizes-section">
                      <span className="summary-sizes-label">Ukuran & Jumlah</span>
                      <div className="summary-sizes-grid">
                        {SIZES.map((size) => (
                          <div key={size} className="summary-size-row">
                            <button
                              className={`summary-size-toggle ${selectedSizes[size] ? 'active' : ''}`}
                              onClick={() => handleSizeToggle(size)}
                            >
                              {size}
                              {selectedSizes[size] && <Check size={12} />}
                            </button>
                            {selectedSizes[size] && (
                              <div className="summary-size-qty">
                                <button onClick={() => handleSizeQty(size, (selectedSizes[size] || 1) - 1)}>−</button>
                                <span>{selectedSizes[size]}</span>
                                <button onClick={() => handleSizeQty(size, (selectedSizes[size] || 1) + 1)}>+</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {totalQuantity > 0 && (
                        <div className="summary-total-qty">
                          Total: <strong>{totalQuantity} pcs</strong>
                        </div>
                      )}
                    </div>

                    {/* NOTES */}
                    <div className="summary-notes">
                      <label className="summary-notes-label" htmlFor="order-notes">Catatan Tambahan (opsional)</label>
                      <textarea
                        id="order-notes"
                        className="form-input form-textarea"
                        placeholder="Misal: desain akan dikirim via WA, request warna spesifik lain, dll."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* ORDER CTA */}
                    <div className="summary-cta">
                      <button
                        className="btn btn-primary btn-lg btn-full"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Send size={18} />
                        HUBUNGI ADMIN VIA WHATSAPP
                      </button>
                      <button className="btn btn-secondary btn-full" onClick={handleReset}>
                        <RotateCcw size={16} />
                        MULAI ULANG
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            {currentStep < 5 && (
              <div className="configurator-nav">
                {currentStep > 1 && (
                  <button className="btn btn-secondary" onClick={handlePrev}>
                    <ChevronLeft size={16} /> Kembali
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              </div>
            )}
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
                <h3 className="custom-step-title">Konfigurasi Spesifikasi</h3>
                <p className="custom-step-desc">
                  Pilih model baju, warna, jenis kain, dan metode cetak menggunakan konfigurator di atas. Tentukan ukuran dan jumlah pesanan.
                </p>
              </div>
            </div>

            <div className="custom-step">
              <div className="custom-step-number" />
              <div>
                <h3 className="custom-step-title">Kirim Desain ke Admin</h3>
                <p className="custom-step-desc">
                  Kirimkan file desain Anda (format AI, PSD, PNG transparan) beserta detail spesifikasi ke WhatsApp admin kami.
                </p>
              </div>
            </div>

            <div className="custom-step">
              <div className="custom-step-number" />
              <div>
                <h3 className="custom-step-title">Konfirmasi Mockup & Harga</h3>
                <p className="custom-step-desc">
                  Tim kami membuatkan visual preview (mockup) dan estimasi biaya terbaik sesuai dengan kuantitas pesanan Anda.
                </p>
              </div>
            </div>

            <div className="custom-step">
              <div className="custom-step-number" />
              <div>
                <h3 className="custom-step-title">Produksi & Pengiriman</h3>
                <p className="custom-step-desc">
                  Setelah konfirmasi dan DP, barang masuk tahap produksi lalu dikirim ke seluruh Indonesia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productData={productDataForModal}
      />
    </div>
  );
}
