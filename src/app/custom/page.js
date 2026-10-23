'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ContactModal from '@/components/ContactModal';
import {
  Check,
  Palette,
  Shirt,
  Layers,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  Upload,
  X,
  FileImage,
  FileText,
  Image as ImageIcon,
  Ruler,
  ChevronRight,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import tshirtColorData from '@/data/tshirt_colors.json';

// ============================================================
// DATA: Garment models, colors, fabrics, printing methods, sizes
// ============================================================

const GARMENT_MODELS = [
  {
    id: 'tshirt-reguler',
    name: 'T-Shirt Reguler Fit Cotton',
    category: 'T-Shirt',
    price: 42000,
    tagline: 'Koleksi Esensial Harian',
    description: 'Kaos katun combed potongan reguler fit, sangat lembut dan nyaman untuk harian, seragam, atau merchandise clothing.',
    image: '/products/t-shirt-reguler/tshirt-reguler-salmon.webp',
    images: [
      '/products/t-shirt-reguler/tshirt-reguler-salmon.webp',
      '/products/t-shirt-reguler/tshirt-reguler-hitam.webp',
      '/products/t-shirt-reguler/tshirt-reguler-putih.webp',
      '/products/t-shirt-reguler/tshirt-reguler-navy.webp',
      '/products/t-shirt-reguler/tshirt-reguler-sage-green.webp',
      '/products/t-shirt-reguler/tshirt-reguler-maroon.webp',
      '/products/t-shirt-reguler/tshirt-reguler-kuning.webp',
    ],
  },
  {
    id: 'tshirt-oversize',
    name: 'T-Shirt Oversize Boxy Streetwear',
    category: 'T-Shirt',
    price: 52000,
    tagline: 'Streetwear Modern',
    description: 'Kaos boxy oversize dengan drop shoulder kontemporer. Tampilan modern untuk streetwear & distro brand.',
    image: '/products/t-shirt-oversize/tshirt-oversize-hitam.jpg',
    images: [
      '/products/t-shirt-oversize/tshirt-oversize-hitam.jpg',
      '/products/t-shirt-oversize/tshirt-oversize-putih.jpg',
      '/products/t-shirt-oversize/tshirt-oversize-sage-green.jpg',
      '/products/t-shirt-oversize/tshirt-oversize-cream.jpg',
      '/products/t-shirt-oversize/tshirt-oversize-navy.jpg',
      '/products/t-shirt-oversize/tshirt-oversize-maroon.jpg',
      '/products/t-shirt-oversize/tshirt-oversize-abu-muda.jpg',
    ],
  },
  {
    id: 'polo-shirt',
    name: 'Polo Shirt Pique Classic',
    category: 'Polo',
    price: 65000,
    tagline: 'Elegan & Kasual',
    description: 'Polo shirt berkerah dengan bahan Lacoste Pique bertekstur. Sangat cocok untuk seragam kantor dan casual wear.',
    image: 'https://images.unsplash.com/photo-1625910513413-5fc421e0fd4f?w=800&q=80&fm=webp',
    images: [
      'https://images.unsplash.com/photo-1625910513413-5fc421e0fd4f?w=800&q=80&fm=webp',
    ],
  },
  {
    id: 'long-sleeve',
    name: 'Long Sleeve Shirt Premium',
    category: 'Long Sleeve',
    price: 49000,
    tagline: 'Nyaman & Sejuk',
    description: 'Kaos lengan panjang dengan rib manset elastis. Cocok untuk cuaca sejuk, layering, maupun seragam event.',
    image: '/products/long-sleeve/long-sleeve-hitam.webp',
    images: [
      '/products/long-sleeve/long-sleeve-hitam.webp',
      '/products/long-sleeve/long-sleeve-putih.webp',
      '/products/long-sleeve/long-sleeve-navy.webp',
      '/products/long-sleeve/long-sleeve-sage-green.webp',
      '/products/long-sleeve/long-sleeve-maroon.webp',
      '/products/long-sleeve/long-sleeve-mustard.webp',
      '/products/long-sleeve/long-sleeve-abu-muda.webp',
    ],
  },
  {
    id: 'hoodie',
    name: 'Hoodie Pullover Heavyweight',
    category: 'Hoodie',
    price: 125000,
    tagline: 'Hangat & Tebal',
    description: 'Hoodie pullover dengan kangaroo pocket bahan fleece tebal 280-320 gsm. Bagian dalam berbulu lembut dan hangat.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80&fm=webp',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80&fm=webp',
    ],
  },
  {
    id: 'jersey',
    name: 'Jersey Sport Dri-Fit Athletic',
    category: 'Jersey',
    price: 68000,
    tagline: 'Performa Olahraga',
    description: 'Jersey olahraga bahan Dri-Fit mikro ventilasi. Ringan, cepat kering, dan breathable untuk futsal, running, dan esport.',
    image: 'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=800&q=80&fm=webp',
    images: [
      'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=800&q=80&fm=webp',
    ],
  },
  {
    id: 'raglan',
    name: 'Raglan 3/4 Vintage Baseball',
    category: 'Raglan',
    price: 52000,
    tagline: 'Gaya Vintage Baseball',
    description: 'Kaos raglan lengan 3/4 dengan perpaduan warna badan dan lengan kontras. Desain vintage baseball klasik.',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80&fm=webp',
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80&fm=webp',
    ],
  },
  {
    id: 'tanktop',
    name: 'Tank Top Sleeveless Summer',
    category: 'Tank Top',
    price: 38000,
    tagline: 'Ringan & Bebas Gerak',
    description: 'Tank top tanpa lengan untuk olahraga, cuaca panas, dan aktivitas outdoor dengan sirkulasi udara maksimal.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80&fm=webp',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80&fm=webp',
    ],
  },
];

const COLORS = [
  { id: 'salmon', name: 'Salmon', hex: '#E77C68' },
  { id: 'hitam', name: 'Hitam', hex: '#111111' },
  { id: 'putih', name: 'Putih', hex: '#FFFFFF' },
  { id: 'navy', name: 'Navy Blue', hex: '#1B2A4A' },
  { id: 'abu-muda', name: 'Misty / Abu Muda', hex: '#C2C5C8' },
  { id: 'abu-tua', name: 'Abu-abu Tua', hex: '#4A4A4A' },
  { id: 'maroon', name: 'Maroon', hex: '#6B1C23' },
  { id: 'merah', name: 'Merah Cabe', hex: '#C41E3A' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#2855AE' },
  { id: 'baby-blue', name: 'Baby Blue', hex: '#89CFF0' },
  { id: 'hijau-botol', name: 'Hijau Botol', hex: '#006A4E' },
  { id: 'hijau-army', name: 'Hijau Army', hex: '#4B5320' },
  { id: 'sage-green', name: 'Sage Green', hex: '#9CAF88' },
  { id: 'kuning', name: 'Kuning Kenari', hex: '#FFD700' },
  { id: 'mustard', name: 'Mustard', hex: '#C9932E' },
  { id: 'orange', name: 'Orange', hex: '#E86F2C' },
  { id: 'terracotta', name: 'Terracotta', hex: '#D26042' },
  { id: 'pink', name: 'Dusty Pink', hex: '#E8879C' },
  { id: 'ungu', name: 'Ungu Tua', hex: '#5D3A8E' },
  { id: 'lilac', name: 'Lilac', hex: '#C8A2C8' },
  { id: 'cream', name: 'Cream / Krem', hex: '#F5E6CA' },
  { id: 'coklat', name: 'Coklat Kopi', hex: '#6B4226' },
];

const FABRICS = [
  {
    id: 'combed-24s',
    name: 'Cotton Combed 24s',
    weight: '170–180 gsm',
    description: 'Paling populer untuk distro. Halus, ketebalan pas, adem, dan menyerap keringat dengan baik.',
    texture: 'Medium & Lembut',
    best_for: ['DTF', 'Polyflex', 'Sablon Manual'],
  },
  {
    id: 'combed-30s',
    name: 'Cotton Combed 30s',
    weight: '140–160 gsm',
    description: 'Bahan tipis, jatuh, dan sangat sejuk untuk cuaca panas atau kaos sehari-hari.',
    texture: 'Tipis & Ringan',
    best_for: ['DTF', 'Polyflex'],
  },
  {
    id: 'combed-20s',
    name: 'Cotton Combed 20s',
    weight: '190–200 gsm',
    description: 'Bahan tebal dan kokoh standar pakaian distro vintage. Cocok untuk sablon manual dan DTF.',
    texture: 'Tebal & Kokoh',
    best_for: ['Sablon Manual', 'DTF'],
  },
  {
    id: 'fleece',
    name: 'Fleece Heavy Cotton',
    weight: '280–320 gsm',
    description: 'Bahan tebal dan berbulu halus di bagian dalam. Khusus untuk hoodie dan jaket premium.',
    texture: 'Tebal & Hangat',
    best_for: ['DTF', 'Polyflex'],
  },
  {
    id: 'lacoste',
    name: 'Lacoste Pique CVC',
    weight: '200–230 gsm',
    description: 'Rajutan berpori khas polo shirt klasik. Berkarakter formal, rapi, dan kokoh.',
    texture: 'Bertekstur Pique',
    best_for: ['DTF', 'Bordir'],
  },
  {
    id: 'polyester',
    name: 'Dri-Fit Micro Mesh',
    weight: '130–150 gsm',
    description: 'Bahan jersey olahraga cepat kering dengan sirkulasi udara optimal.',
    texture: 'Licin & Quick Dry',
    best_for: ['Sublim', 'DTF'],
  },
];

const PRINTING_METHODS = [
  {
    id: 'dtf',
    name: 'DTF (Digital Transfer Film)',
    tagline: 'Paling Populer',
    description: 'Cetak digital full-color detail tinggi ke film khusus. Sangat tajam untuk gradasi, foto, dan desain kompleks tanpa batas warna.',
    min_order: '1 pcs',
  },
  {
    id: 'polyflex',
    name: 'Polyflex (Vinyl Cutting)',
    tagline: 'Warna Solid & Rapi',
    description: 'Material vinyl solid presisi tinggi. Hasil rapi, kuat, dan anti luntur. Sangat ideal untuk nama, nomor punggung, atau logo 1–2 warna.',
    min_order: '1 pcs',
  },
  {
    id: 'manual',
    name: 'Sablon Manual (Plastisol)',
    tagline: 'Standar Distro Grosir',
    description: 'Teknik sablon screen printing klasik dengan tinta plastisol premium. Paling awet, tahan cuci bertahun-tahun, pilihan utama produksi massal.',
    min_order: '24 pcs',
  },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const SIZE_CHART = [
  { size: 'XS', width: 44, length: 65, sleeve: 19 },
  { size: 'S', width: 47, length: 68, sleeve: 20 },
  { size: 'M', width: 50, length: 71, sleeve: 21 },
  { size: 'L', width: 53, length: 73, sleeve: 22 },
  { size: 'XL', width: 56, length: 76, sleeve: 23 },
  { size: '2XL', width: 59, length: 78, sleeve: 24 },
  { size: '3XL', width: 62, length: 81, sleeve: 25 },
];

// ============================================================
// MAIN COMPONENT: CONCISE SINGLE-FRAME CUSTOM STUDIO
// ============================================================

export default function CustomPage() {
  const [garmentModels, setGarmentModels] = useState(GARMENT_MODELS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState(GARMENT_MODELS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0]);
  const [selectedPrinting, setSelectedPrinting] = useState(PRINTING_METHODS[0]);

  // Size & Quantity
  const [activeSize, setActiveSize] = useState('S');
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [isMultiSize, setIsMultiSize] = useState(false);
  const [sizeQuantities, setSizeQuantities] = useState({
    XS: 0,
    S: 1,
    M: 0,
    L: 0,
    XL: 0,
    '2XL': 0,
    '3XL': 0,
  });

  // Design Files & Notes
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState('');

  // Modals & Section Ref
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const fileInputRef = useRef(null);
  const selectionSectionRef = useRef(null);
  const { addToCart } = useCart();

  // Fetch custom models from API (database)
  useEffect(() => {
    fetch('/api/custom-models?activeOnly=true')
      .then((res) => res.json())
      .then((data) => {
        if (data?.models && data.models.length > 0) {
          // Merge API models with defaults if needed
          setGarmentModels(data.models);
          // Preserve selected model if matches, else set first
          const found = data.models.find((m) => m.id === selectedModel?.id);
          if (found) {
            setSelectedModel(found);
          } else {
            setSelectedModel(data.models[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching custom models:', err));
  }, []);

  // Categories list
  const categories = Array.from(new Set(garmentModels.map((m) => m.category))).filter(Boolean);

  const filteredModels =
    selectedCategory === 'all'
      ? garmentModels
      : garmentModels.filter((m) => m.category === selectedCategory);

  // When user clicks a model in the catalog grid, select it and smoothly scroll to the selection section
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setTimeout(() => {
      if (selectionSectionRef.current) {
        selectionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Model image array & color-specific asset resolution
  const isTshirtReguler =
    selectedModel?.id === 'tshirt-reguler' ||
    selectedModel?.slug === 't-shirt-reguler' ||
    selectedModel?.name?.toLowerCase().includes('reguler');

  const isTshirtOversize =
    selectedModel?.id === 'tshirt-oversize' ||
    selectedModel?.slug === 't-shirt-oversize' ||
    selectedModel?.name?.toLowerCase().includes('oversize');

  const isLongSleeve =
    selectedModel?.id === 'long-sleeve' ||
    selectedModel?.slug === 'long-sleeve' ||
    selectedModel?.name?.toLowerCase().includes('long sleeve') ||
    selectedModel?.category?.toLowerCase().includes('long sleeve');

  const colorSpecificImage =
    isTshirtReguler && selectedColor?.id
      ? (tshirtColorData?.localUrls?.[selectedColor.id] || tshirtColorData?.storageUrls?.[selectedColor.id])
      : isTshirtOversize && selectedColor?.id && tshirtColorData?.oversizeUrls?.[selectedColor.id]
        ? tshirtColorData.oversizeUrls[selectedColor.id]
        : isLongSleeve && selectedColor?.id && tshirtColorData?.longSleeveUrls?.[selectedColor.id]
          ? tshirtColorData.longSleeveUrls[selectedColor.id]
          : null;

  const defaultFallbackImage = isTshirtOversize
    ? '/products/t-shirt-oversize/tshirt-oversize-hitam.jpg'
    : isLongSleeve
      ? '/products/long-sleeve/long-sleeve-hitam.webp'
      : '/products/t-shirt-reguler/tshirt-reguler-salmon.webp';

  const modelImages =
    selectedModel?.images && selectedModel.images.length > 0
      ? selectedModel.images
      : [colorSpecificImage || selectedModel?.image || defaultFallbackImage];

  const activeImage =
    colorSpecificImage ||
    modelImages[0] ||
    selectedModel?.image ||
    defaultFallbackImage;

  // Quantity calculations
  const totalQuantity = isMultiSize
    ? Object.values(sizeQuantities).reduce((acc, qty) => acc + (qty > 0 ? qty : 0), 0) || 1
    : quickQuantity;

  const unitPrice = selectedModel?.price && selectedModel.price > 0 ? selectedModel.price : 42000;
  const totalPrice = unitPrice * totalQuantity;

  // Single-size quantity stepper
  const handleQuickQtyChange = (delta) => {
    const next = quickQuantity + delta;
    if (next >= 1) {
      setQuickQuantity(next);
      setSizeQuantities((prev) => ({ ...prev, [activeSize]: next }));
    }
  };

  // Multi-size quantity changes
  const handleSizeQtyChange = (size, delta) => {
    setSizeQuantities((prev) => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [size]: next };
    });
  };

  const handleSelectSize = (size) => {
    setActiveSize(size);
    if (!isMultiSize) {
      setSizeQuantities((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => (next[k] = 0));
        next[size] = quickQuantity;
        return next;
      });
    }
  };

  // Toggle between single size stepper and multi-size table
  const handleToggleMultiSize = () => {
    setIsMultiSize((prev) => !prev);
  };

  // ---- FILE UPLOAD HANDLERS ----
  const ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/postscript',
    'image/vnd.adobe.photoshop',
  ];
  const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf', '.ai', '.psd'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 5;

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isAllowedType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);
    if (!isAllowedType) {
      return `Format file "${file.name}" tidak didukung. Gunakan: PNG, JPG, PDF, AI, PSD, SVG.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" terlalu besar (maksimal 10MB).`;
    }
    return null;
  };

  const processFiles = useCallback(
    (files) => {
      const fileArray = Array.from(files);
      const remaining = MAX_FILES - uploadedFiles.length;
      if (remaining <= 0) {
        alert(`Maksimal ${MAX_FILES} file. Hapus file yang ada untuk menambah file baru.`);
        return;
      }
      const filesToAdd = fileArray.slice(0, remaining);
      const errors = [];
      const validFiles = [];

      filesToAdd.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (validFiles.length > 0) {
        validFiles.forEach((file) => {
          const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg)$/i.test(file.name);
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            setUploadedFiles((prev) => [
              ...prev,
              {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type || 'image/png',
                isImage,
                preview: dataUrl,
                dataUrl,
              },
            ]);
          };
          reader.readAsDataURL(file);
        });
      }
    },
    [uploadedFiles.length]
  );

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Reset form
  const handleResetAll = () => {
    setSelectedColor(COLORS[0]);
    setSelectedFabric(FABRICS[0]);
    setSelectedPrinting(PRINTING_METHODS[0]);
    setActiveSize('S');
    setQuickQuantity(1);
    setIsMultiSize(false);
    setSizeQuantities({ XS: 0, S: 1, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 });
    setUploadedFiles([]);
    setNotes('');
  };

  // Add configured custom garment to cart cache
  const handleAddToCartCustom = (e) => {
    if (!selectedModel) return;
    addToCart(
      {
        type: 'custom',
        id: `custom_${selectedModel.id}_${Date.now()}`,
        name: selectedModel.name,
        price: unitPrice,
        quantity: totalQuantity,
        image: activeImage,
        selectedColor: selectedColor?.name || 'Standard',
        colorHex: selectedColor?.hex || null,
        fabric: selectedFabric?.name || 'Cotton Combed',
        printingMethod: selectedPrinting?.name || 'DTF',
        sizes: isMultiSize ? sizeQuantities : { [activeSize]: quickQuantity },
        notes: notes || '',
        designFiles: uploadedFiles.map((f) => f.name),
      },
      e
    );
  };

  // Data for WhatsApp ContactModal
  const sizesSummaryString = isMultiSize
    ? Object.entries(sizeQuantities)
      .filter(([, q]) => q > 0)
      .map(([s, q]) => `${s}(${q})`)
      .join(', ') || `${activeSize}(1)`
    : `${activeSize} (${quickQuantity} pcs)`;

  const productDataForModal = selectedModel
    ? {
      name: `Custom ${selectedModel.name}`,
      slug: 'custom-order',
      price: formatPrice(unitPrice),
      selectedSize: sizesSummaryString,
      selectedColor: selectedColor?.name || '-',
      quantity: totalQuantity,
      customData: {
        fabric: selectedFabric?.name || '-',
        printing: selectedPrinting?.name || '-',
        notes: notes || '-',
        designFiles:
          uploadedFiles.length > 0
            ? uploadedFiles.map((f) => f.name).join(', ')
            : 'Belum ada file desain',
      },
    }
    : null;

  const customOrderDataForModal = {
    garmentModel: selectedModel?.name || '',
    garmentCategory: selectedModel?.category || '',
    color: selectedColor?.name || '',
    colorHex: selectedColor?.hex || '',
    fabric: selectedFabric?.name || '',
    fabricWeight: selectedFabric?.weight || '',
    printingMethod: selectedPrinting?.name || '',
    sizes: isMultiSize ? sizeQuantities : { [activeSize]: quickQuantity },
    totalQuantity: totalQuantity,
    notes: notes || '',
    designFiles: uploadedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      dataUrl: f.dataUrl || f.preview || null,
    })),
  };

  return (
    <div className="custom-unified-page">
      <div className="container">
        {/* BREADCRUMB & HEADER */}
        <nav className="custom-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="custom-breadcrumb-link">Home</Link>
          <span className="custom-breadcrumb-sep">/</span>
          <Link href="/custom" className="custom-breadcrumb-link">Custom Studio</Link>
          <span className="custom-breadcrumb-sep">/</span>
          <span className="custom-breadcrumb-current">{selectedModel?.name || 'T-Shirt'}</span>
        </nav>

        {/* ============================================================ */}
        {/* 1. BARISAN KATALOG PRODUK CUSTOM (SEPERTI SECTION SHOP)      */}
        {/* ============================================================ */}
        <section className="custom-catalog-shop-section">
          <div className="section-header">
            <div className="section-label">KATALOG PRODUK CUSTOM</div>
            <h1 className="section-title">PILIH MODEL PAKAIAN</h1>
            <p className="section-desc">
              Pilih salah satu model pakaian di bawah ini untuk lanjut ke section konfigurasi spesifikasi warna, bahan, sablon, dan ukuran.
            </p>
          </div>

          {/* Filter Kategori seperti pada section shop */}
          {categories.length > 0 && (
            <div className="shop-filters" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="shop-category-filters">
                <button
                  type="button"
                  className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Semua ({garmentModels.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Barisan Katalog Produk - Grid & Card Identik dengan Section Shop (Tanpa Tag) */}
          <div className="product-grid">
            {filteredModels.map((model) => {
              const isSelected = selectedModel?.id === model.id;
              const modelImg =
                model.images && model.images.length > 0 ? model.images[0] : model.image;
              const modelPrice = model.price > 0 ? model.price : 42000;

              return (
                <div
                  key={model.id}
                  role="button"
                  tabIndex={0}
                  className={`product-card custom-catalog-card ${isSelected ? 'active-catalog-card' : ''}`}
                  onClick={() => handleSelectModel(model)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectModel(model);
                    }
                  }}
                  title={`Klik untuk memilih ${model.name} dan beralih ke section pemilihan`}
                >
                  <div className="product-card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={modelImg} alt={model.name} loading="lazy" />
                  </div>

                  <div className="product-card-info">
                    <div className="product-card-name">{model.name}</div>
                    <div className="product-card-price">
                      {formatPrice(modelPrice)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SECTION PEMILIHAN SPESIFIKASI (SINGLE-FRAME CONFIGURATOR)  */}
        {/* ============================================================ */}
        <section
          id="section-pemilihan"
          ref={selectionSectionRef}
          className="custom-selection-section"
        >
          <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="section-label">SECTION PEMILIHAN SPESIFIKASI</div>
            <h2 className="section-title">KONFIGURASI: {selectedModel?.name?.toUpperCase()}</h2>
            <p className="section-desc">
              Sesuaikan pilihan warna kain, material, metode cetak sablon, serta kuantitas ukuran dalam satu frame di bawah ini.
            </p>
          </div>

          <div className="custom-single-frame">
            {/* LEFT COLUMN: PRODUCT GALLERY & REAL-TIME PREVIEW */}
            <div className="custom-frame-gallery">
              <div className="custom-gallery-main">
                {/* Main Garment Image (Tag Populer, Best Seller, dll. Dihilangkan) */}
                <div className="custom-gallery-img-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage}
                    alt={selectedModel?.name || 'Garment preview'}
                    className="custom-gallery-img"
                  />
                </div>

                {/* Live Spec Pill Banner */}
                <div className="custom-gallery-live-spec">
                  <div className="live-spec-dot" style={{ backgroundColor: selectedColor?.hex || '#111' }} />
                  <span>
                    <strong>{selectedModel?.name}</strong> • Warna: {selectedColor?.name} • {selectedFabric?.name} • {selectedPrinting?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SINGLE-FRAME SCANNABLE CONFIGURATION PANEL */}
            <div className="custom-frame-panel">
              {/* PRODUCT HEADER (Tag Populer, Best Seller, dll. Dihilangkan) */}
              <div className="custom-panel-head">
                <h1 className="custom-panel-title">{selectedModel?.name}</h1>
                <p className="custom-panel-desc">{selectedModel?.description}</p>

                {/* Price Block */}
                <div className="custom-panel-price-row">
                  <div className="custom-panel-price">
                    <span className="price-amount">{formatPrice(unitPrice)}</span>
                    <span className="price-unit">/ pcs</span>
                  </div>
                  <div className="custom-panel-price-hint">
                    Diskon khusus untuk pemesanan partai besar & komunitas • <strong>Min. 1 pcs</strong>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* 1. WARNA KAIN (ROUND COLOR SWATCHES LIKE CITITEX) */}
              {/* ============================================================ */}
              <div className="custom-section">
                <div className="custom-section-header">
                  <span className="custom-section-label">
                    Color: <strong className="selected-val-highlight">{selectedColor?.name}</strong>
                  </span>
                  <span className="custom-section-count">{COLORS.length} Pilihan Warna</span>
                </div>

                <div className="cititex-color-swatches-grid">
                  {COLORS.map((col) => {
                    const isSelected = selectedColor?.id === col.id;
                    const isLight = ['putih', 'cream', 'kuning', 'baby-blue', 'abu-muda', 'pink', 'salmon', 'sage-green', 'lilac'].includes(col.id);

                    return (
                      <button
                        key={col.id}
                        type="button"
                        className={`cititex-color-circle ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedColor(col);
                        }}
                        title={`Warna: ${col.name}`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {isSelected && (
                          <Check
                            size={14}
                            color={isLight ? '#111111' : '#FFFFFF'}
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================ */}
              {/* 2. PILIH JENIS KAIN (FABRIC) */}
              {/* ============================================================ */}
              <div className="custom-section">
                <div className="custom-section-header">
                  <span className="custom-section-label">
                    Jenis Kain: <strong className="selected-val-highlight">{selectedFabric?.name}</strong>
                  </span>
                  <span className="custom-section-weight">{selectedFabric?.weight}</span>
                </div>

                <div className="custom-pill-grid">
                  {FABRICS.map((fab) => {
                    const isSelected = selectedFabric?.id === fab.id;
                    return (
                      <button
                        key={fab.id}
                        type="button"
                        className={`custom-pill-item ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedFabric(fab)}
                      >
                        <div className="pill-item-top">
                          <span className="pill-item-name">{fab.name}</span>
                          {isSelected && <Check size={12} />}
                        </div>
                        <span className="pill-item-sub">{fab.weight} • {fab.texture}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================ */}
              {/* 3. PILIH METODE CETAK (PRINTING METHOD) */}
              {/* ============================================================ */}
              <div className="custom-section">
                <div className="custom-section-header">
                  <span className="custom-section-label">
                    Metode Cetak / Sablon: <strong className="selected-val-highlight">{selectedPrinting?.name}</strong>
                  </span>
                  <span className="custom-section-weight">Min. {selectedPrinting?.min_order}</span>
                </div>

                <div className="custom-printing-chips">
                  {PRINTING_METHODS.map((method) => {
                    const isSelected = selectedPrinting?.id === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        className={`custom-printing-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedPrinting(method)}
                      >
                        <div className="printing-chip-text">
                          <div className="printing-chip-title-row">
                            <span className="printing-chip-title">{method.name}</span>
                            <span className="printing-chip-min">Min. {method.min_order}</span>
                          </div>
                          <span className="printing-chip-tagline">{method.tagline}</span>
                        </div>
                        {isSelected && <Check size={14} className="printing-chip-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================ */}
              {/* 4. UKURAN & JUMLAH (SIZE & QUANTITY - CITITEX STYLE) */}
              {/* ============================================================ */}
              <div className="custom-section">
                <div className="custom-section-header">
                  <span className="custom-section-label">
                    Size:{' '}
                    <strong className="selected-val-highlight">
                      {isMultiSize ? 'Kombinasi Banyak Ukuran' : activeSize}
                    </strong>
                  </span>
                  <button
                    type="button"
                    className="size-guide-btn"
                    onClick={() => setIsSizeGuideOpen(true)}
                  >
                    <Ruler size={13} />
                    <span>Size Guide (Panduan Ukuran)</span>
                  </button>
                </div>

                {/* Size Buttons Row */}
                <div className="cititex-sizes-row">
                  {SIZES.map((sz) => {
                    const isSelected = isMultiSize ? (sizeQuantities[sz] || 0) > 0 : activeSize === sz;
                    const qtyVal = sizeQuantities[sz] || 0;

                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`cititex-size-box ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectSize(sz)}
                      >
                        <span className="size-label">{sz}</span>
                        {isMultiSize && qtyVal > 0 && (
                          <span className="size-qty-badge">{qtyVal} pcs</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mode Toggle: Single size stepper vs Multi-size breakdown */}
                <div className="multi-size-toggle-row">
                  <button
                    type="button"
                    className="multi-size-toggle-btn"
                    onClick={handleToggleMultiSize}
                  >
                    {isMultiSize ? '← Gunakan Ukuran Tunggal Sederhana' : '+ Pesan Berbagai Ukuran Sekaligus (S, M, L...)'}
                  </button>
                </div>

                {/* Multi-Size Detailed Counter Table */}
                {isMultiSize ? (
                  <div className="multi-size-grid">
                    {SIZES.map((sz) => (
                      <div key={sz} className="multi-size-row-item">
                        <span className="multi-size-name">{sz}</span>
                        <div className="stepper-box">
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => handleSizeQtyChange(sz, -1)}
                            disabled={(sizeQuantities[sz] || 0) <= 0}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="stepper-val">{sizeQuantities[sz] || 0}</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => handleSizeQtyChange(sz, 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Single Size Quantity Stepper (Cititex Style) */
                  <div className="cititex-qty-row">
                    <span className="qty-label">Jumlah (Ukuran {activeSize}):</span>
                    <div className="stepper-box stepper-box-lg">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => handleQuickQtyChange(-1)}
                        disabled={quickQuantity <= 1}
                        aria-label="Kurangi jumlah"
                      >
                        -
                      </button>
                      <span className="stepper-val stepper-val-lg">{quickQuantity}</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => handleQuickQtyChange(1)}
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* 5. UPLOAD FILE DESAIN */}
              {/* ============================================================ */}
              <div className="custom-section">
                <div className="custom-section-header">
                  <span className="custom-section-label">
                    Upload Desain Sablon:{' '}
                    <span className="custom-section-subtext">(PNG, JPG, PDF, AI, PSD, SVG)</span>
                  </span>
                  <span className="custom-section-weight">
                    {uploadedFiles.length} / {MAX_FILES} File
                  </span>
                </div>

                {/* Dropzone */}
                <div
                  className={`compact-dropzone ${isDragging ? 'dragging' : ''} ${uploadedFiles.length >= MAX_FILES ? 'disabled' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => uploadedFiles.length < MAX_FILES && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai,.psd"
                    multiple
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  <div className="dropzone-inner">
                    <Upload size={20} className="dropzone-icon" />
                    <div className="dropzone-text">
                      <strong>Klik untuk pilih file</strong> atau drag & drop file desain ke sini
                    </div>
                    <span className="dropzone-hint">Format resolusi tinggi / transparan, maks 10MB per file</span>
                  </div>
                </div>

                {/* Uploaded Files Chips */}
                {uploadedFiles.length > 0 && (
                  <div className="compact-file-list">
                    {uploadedFiles.map((f) => (
                      <div key={f.id} className="compact-file-chip">
                        <div className="file-chip-thumb">
                          {f.isImage && f.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.preview} alt={f.name} />
                          ) : (
                            <FileText size={14} />
                          )}
                        </div>
                        <span className="file-chip-name">{f.name}</span>
                        <span className="file-chip-size">({formatFileSize(f.size)})</span>
                        <button
                          type="button"
                          className="file-chip-remove"
                          onClick={() => handleRemoveFile(f.id)}
                          title="Hapus file"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* 6. CATATAN TAMBAHAN (OPTIONAL NOTES) */}
              {/* ============================================================ */}
              <div className="custom-section">
                <label htmlFor="order-notes" className="custom-section-label" style={{ display: 'block', marginBottom: 8 }}>
                  Catatan Tambahan (Opsional):
                </label>
                <textarea
                  id="order-notes"
                  className="custom-notes-input"
                  placeholder="Contoh: Sablon logo di dada kiri ukuran 8x8 cm, sablon belakang punggung A3, posisi jahitan khusus, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* ============================================================ */}
              {/* 7. RINGKASAN HARGA & ORDER CTA (BOTTOM ACTION BAR) */}
              {/* ============================================================ */}
              <div className="custom-action-footer">
                <div className="custom-footer-summary">
                  <div className="footer-summary-row">
                    <span className="footer-summary-label">Total Pesanan:</span>
                    <span className="footer-summary-pcs">
                      <strong>{totalQuantity}</strong> pcs
                    </span>
                  </div>
                  <div className="footer-summary-row">
                    <span className="footer-summary-label">Estimasi Biaya:</span>
                    <span className="footer-summary-price">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="custom-footer-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary cititex-cart-btn"
                    onClick={(e) => handleAddToCartCustom(e)}
                    title="Simpan konfigurasi custom ini ke keranjang"
                  >
                    <ShoppingBag size={18} />
                    <span>+ SIMPAN KE KERANJANG</span>
                  </button>

                  <div className="custom-footer-buttons-row">
                    <button
                      type="button"
                      className="btn btn-primary cititex-checkout-btn"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Send size={18} />
                      <span>PESAN CUSTOM VIA WHATSAPP</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary cititex-reset-btn"
                      onClick={handleResetAll}
                      title="Kembalikan semua pilihan ke awal"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* SIZE GUIDE MODAL POPUP */}
      {/* ============================================================ */}
      {isSizeGuideOpen && (
        <div className="size-guide-modal-overlay" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="size-guide-header">
              <div className="size-guide-title">
                <Ruler size={18} />
                <span>PANDUAN UKURAN (SIZE GUIDE)</span>
              </div>
              <button
                type="button"
                className="size-guide-close"
                onClick={() => setIsSizeGuideOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="size-guide-body">
              <p className="size-guide-desc">
                Toleransi ukuran jahitan adalah ±1–2 cm. Diukur dalam kondisi pakaian dibentangkan rata.
              </p>

              <div className="size-guide-table-wrap">
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th>Ukuran</th>
                      <th>Lebar Dada (cm)</th>
                      <th>Panjang Baju (cm)</th>
                      <th>Panjang Lengan (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART.map((row) => (
                      <tr key={row.size} className={activeSize === row.size ? 'active-row' : ''}>
                        <td><strong>{row.size}</strong></td>
                        <td>{row.width} cm</td>
                        <td>{row.length} cm</td>
                        <td>{row.sleeve} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="size-guide-tips">
                <strong>💡 Tips Menentukan Ukuran:</strong>
                <ul>
                  <li>Ukur kaos favorit yang paling pas di badan Anda dari ketiak kiri ke ketiak kanan (Lebar Dada).</li>
                  <li>Jika Anda menyukai gaya santai atau sedikit longgar, pilih satu tingkat ukuran di atasnya.</li>
                </ul>
              </div>
            </div>

            <div className="size-guide-footer">
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => setIsSizeGuideOpen(false)}
              >
                TUTUP PANDUAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP CONTACT & ORDER MODAL */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productData={productDataForModal}
        customOrderData={customOrderDataForModal}
      />
    </div>
  );
}

