const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, './serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌ File scripts/serviceAccountKey.json tidak ditemukan.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

function generateId(prefix = '') {
  const p = prefix ? `${prefix}_` : '';
  return `${p}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
}

function generateOrderNumber(prefix, date) {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

function getPastDate(daysAgo, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

const customOrdersData = [
  {
    customerName: 'Fajar Nugraha (Komunitas Pendaki Lombok)',
    customerPhone: '081234567890',
    customerEmail: 'fajar.lombok@gmail.com',
    garmentModel: 'T-Shirt Reguler',
    garmentCategory: 'T-Shirt',
    color: 'Hitam Jetblack',
    colorHex: '#0A0A0A',
    fabric: 'Cotton Combed 24s',
    fabricWeight: '170–180 gsm',
    printingMethod: 'Sablon Manual (Plastisol)',
    sizes: JSON.stringify({ S: 10, M: 25, L: 30, XL: 15, '2XL': 5 }),
    totalQuantity: 85,
    notes: 'Desain sablon depan dada kiri logo Rinjani Tracker, belakang grafis peta jalur Sembalun warna emas.',
    status: 'PRODUKSI',
    daysAgo: 5,
    hoursAgo: 4
  },
  {
    customerName: 'Budi Santoso (PT Sumber Makmur)',
    customerPhone: '081398765432',
    customerEmail: 'budi.santoso@makmur.co.id',
    garmentModel: 'Polo Shirt',
    garmentCategory: 'Polo',
    color: 'Navy Blue',
    colorHex: '#1B2A4A',
    fabric: 'Lacoste CVC 24s',
    fabricWeight: '220–230 gsm',
    printingMethod: 'Bordir Komputer',
    sizes: JSON.stringify({ M: 20, L: 20, XL: 10 }),
    totalQuantity: 50,
    notes: 'Seragam gathering kantor. Bordir logo perusahaan di dada kiri dan tulisan di lengan kanan.',
    status: 'SELESAI',
    daysAgo: 9,
    hoursAgo: 6
  },
  {
    customerName: 'Rian Pratama',
    customerPhone: '085211223344',
    customerEmail: 'rian.pratama99@gmail.com',
    garmentModel: 'T-Shirt Oversize',
    garmentCategory: 'T-Shirt',
    color: 'Sage Green',
    colorHex: '#9CAF88',
    fabric: 'Cotton Combed 20s Heavyweight',
    fabricWeight: '190–200 gsm',
    printingMethod: 'DTF (Digital Transfer Film)',
    sizes: JSON.stringify({ L: 15, XL: 15 }),
    totalQuantity: 30,
    notes: 'Desain typography estetik warna earth tone di dada tengah.',
    status: 'BARU',
    daysAgo: 0,
    hoursAgo: 2
  },
  {
    customerName: 'Dinda Ayu Lestari (BEM Universitas)',
    customerPhone: '087788990011',
    customerEmail: 'dinda.ayulestari@student.ac.id',
    garmentModel: 'Hoodie Jumper',
    garmentCategory: 'Hoodie',
    color: 'Charcoal',
    colorHex: '#333333',
    fabric: 'Cotton Fleece Heavyweight',
    fabricWeight: '280–300 gsm',
    printingMethod: 'Bordir Komputer',
    sizes: JSON.stringify({ S: 10, M: 25, L: 20, XL: 5 }),
    totalQuantity: 60,
    notes: 'Hoodie angkatan mahasiswa baru. Bordir monogram di dada & nama divisi di punggung.',
    status: 'DIPROSES',
    daysAgo: 3,
    hoursAgo: 5
  },
  {
    customerName: 'Hendro Wijaya (Lombok Cycling Club)',
    customerPhone: '081907123456',
    customerEmail: 'hendro.cyclist@yahoo.com',
    garmentModel: 'T-Shirt Raglan',
    garmentCategory: 'T-Shirt',
    color: 'Putih Solid',
    colorHex: '#FFFFFF',
    fabric: 'Cotton Combed 30s',
    fabricWeight: '140–150 gsm',
    printingMethod: 'Sablon Manual (Plastisol)',
    sizes: JSON.stringify({ M: 12, L: 18, XL: 10 }),
    totalQuantity: 40,
    notes: 'Jersey santai gowes mingguan. Lengan warna merah marun, sablon full color di depan.',
    status: 'MOCKUP',
    daysAgo: 2,
    hoursAgo: 3
  },
  {
    customerName: 'Siti Rahmawati (Kafe Kopi Ketinggian)',
    customerPhone: '085934567890',
    customerEmail: 'sitirahma.barista@gmail.com',
    garmentModel: 'Kemeja Drill PDL',
    garmentCategory: 'Kemeja',
    color: 'Beige Sand',
    colorHex: '#D8C7A5',
    fabric: 'American Drill 1919',
    fabricWeight: '210–220 gsm',
    printingMethod: 'Bordir Komputer',
    sizes: JSON.stringify({ S: 4, M: 8, L: 8, XL: 4 }),
    totalQuantity: 24,
    notes: 'Seragam barista & staf kitchen. Ada saku pulpen di lengan kiri.',
    status: 'PRODUKSI',
    daysAgo: 4,
    hoursAgo: 7
  },
  {
    customerName: 'Aris Setiawan',
    customerPhone: '081298761234',
    customerEmail: 'aris.setiawan@outlook.com',
    garmentModel: 'T-Shirt Reguler',
    garmentCategory: 'T-Shirt',
    color: 'Maroon',
    colorHex: '#6B1D2F',
    fabric: 'Cotton Combed 30s',
    fabricWeight: '140–150 gsm',
    printingMethod: 'DTF (Digital Transfer Film)',
    sizes: JSON.stringify({ M: 10, L: 10 }),
    totalQuantity: 20,
    notes: 'Kaos reuni keluarga akbar akhir tahun. Tulisan font retro warna krem.',
    status: 'BARU',
    daysAgo: 1,
    hoursAgo: 1
  },
  {
    customerName: 'Kevin Sanjaya (Esports Team Mataram)',
    customerPhone: '082155667788',
    customerEmail: 'kevin.esports@gmail.com',
    garmentModel: 'Jaket Bomber',
    garmentCategory: 'Jaket',
    color: 'Hitam Jetblack',
    colorHex: '#0A0A0A',
    fabric: 'Taslan Milky Waterproof',
    fabricWeight: '200 gsm',
    printingMethod: 'Bordir Komputer',
    sizes: JSON.stringify({ M: 6, L: 6, XL: 3 }),
    totalQuantity: 15,
    notes: 'Jaket official tim turnamen. Bordir emblem naga di punggung dan nickname di dada kanan.',
    status: 'SELESAI',
    daysAgo: 8,
    hoursAgo: 4
  },
  {
    customerName: 'Maya Kusuma',
    customerPhone: '087812349900',
    customerEmail: 'maya.kusuma@gmail.com',
    garmentModel: 'T-Shirt Oversize',
    garmentCategory: 'T-Shirt',
    color: 'Forest Green',
    colorHex: '#1E3F20',
    fabric: 'Cotton Combed 24s',
    fabricWeight: '170–180 gsm',
    printingMethod: 'Sablon Manual (Plastisol)',
    sizes: JSON.stringify({ S: 10, M: 15 }),
    totalQuantity: 25,
    notes: 'Batal karena perubahan jadwal event panitia sekolah.',
    status: 'DIBATALKAN',
    daysAgo: 7,
    hoursAgo: 8
  },
  {
    customerName: 'Dimas Anggara (Komunitas Musik Indie)',
    customerPhone: '081345670123',
    customerEmail: 'dimas.merch@soundoflombok.id',
    garmentModel: 'T-Shirt Vintage Washed',
    garmentCategory: 'T-Shirt',
    color: 'Washed Charcoal',
    colorHex: '#2B2B2B',
    fabric: 'Cotton Combed 20s Washed',
    fabricWeight: '190–200 gsm',
    printingMethod: 'Sablon Discharge',
    sizes: JSON.stringify({ M: 15, L: 25, XL: 10 }),
    totalQuantity: 50,
    notes: 'Merchandise konser amal. Efek sablon menyatu dengan serat kain (discharge).',
    status: 'MOCKUP',
    daysAgo: 1,
    hoursAgo: 6
  }
];

const productOrdersData = [
  {
    customerName: 'Dewi Sartika',
    customerPhone: '081288776655',
    customerEmail: 'dewi.sartika@gmail.com',
    productName: 'Rinjani Mountain Tee',
    productSlug: 'rinjani-mountain-tee',
    price: 125000,
    quantity: 2,
    size: 'M',
    color: 'Hitam',
    totalPrice: 250000,
    notes: 'Mohon dicek jahitan sebelum dikirim ke Jakarta Selatan.',
    status: 'BARU',
    daysAgo: 0,
    hoursAgo: 1
  },
  {
    customerName: 'Fandi Ahmad',
    customerPhone: '085712345678',
    customerEmail: 'fandi.ahmad@yahoo.com',
    productName: 'Basecamp Hoodie',
    productSlug: 'basecamp-hoodie',
    price: 275000,
    quantity: 1,
    size: 'XL',
    color: 'Charcoal',
    totalPrice: 275000,
    notes: 'Packing kado ulang tahun ya min, terima kasih.',
    status: 'DIPROSES',
    daysAgo: 1,
    hoursAgo: 4
  },
  {
    customerName: 'Intan Permata',
    customerPhone: '081955443322',
    customerEmail: 'intan.permata@gmail.com',
    productName: 'Summit Oversize Tee',
    productSlug: 'summit-oversize-tee',
    price: 145000,
    quantity: 1,
    size: 'L',
    color: 'Sage Green',
    totalPrice: 145000,
    notes: 'Kirim pakai SiCepat Regular ke Surabaya.',
    status: 'DIKIRIM',
    daysAgo: 2,
    hoursAgo: 5
  },
  {
    customerName: 'Bayu Wibowo',
    customerPhone: '081322334455',
    customerEmail: 'bayu.wibowo88@gmail.com',
    productName: 'Wilderness Oversize',
    productSlug: 'wilderness-oversize',
    price: 155000,
    quantity: 2,
    size: 'XL',
    color: 'Forest Green',
    totalPrice: 310000,
    notes: 'Barang sudah sampai tepat waktu dan kainnya tebal berkualitas. Mantap!',
    status: 'SELESAI',
    daysAgo: 5,
    hoursAgo: 7
  },
  {
    customerName: 'Anisa Cindy',
    customerPhone: '087799887766',
    customerEmail: 'anisa.cindy@outlook.com',
    productName: 'Urban Graphic Tee',
    productSlug: 'urban-graphic-tee',
    price: 135000,
    quantity: 1,
    size: 'S',
    color: 'Putih',
    totalPrice: 135000,
    notes: 'Pembeli membatalkan pesanan karena salah pilih ukuran baju.',
    status: 'DIBATALKAN',
    daysAgo: 6,
    hoursAgo: 9
  },
  {
    customerName: 'Rizky Ramadhan',
    customerPhone: '082133445566',
    customerEmail: 'rizky.ramadhan@gmail.com',
    productName: 'Trail Long Sleeve',
    productSlug: 'trail-long-sleeve',
    price: 165000,
    quantity: 1,
    size: 'L',
    color: 'Navy',
    totalPrice: 165000,
    notes: 'Alamat pengiriman Ampenan, Mataram. Tolong kirim pagi ya kak.',
    status: 'BARU',
    daysAgo: 0,
    hoursAgo: 3
  },
  {
    customerName: 'Galih Prakoso',
    customerPhone: '085299881122',
    customerEmail: 'galih.prakoso@gmail.com',
    productName: 'Basecamp Hoodie',
    productSlug: 'basecamp-hoodie',
    price: 275000,
    quantity: 2,
    size: 'L',
    color: 'Hitam',
    totalPrice: 550000,
    notes: 'Resi JNE REG: 011230009823424',
    status: 'DIKIRIM',
    daysAgo: 3,
    hoursAgo: 2
  },
  {
    customerName: 'Nadia Safitri',
    customerPhone: '081277665544',
    customerEmail: 'nadia.safitri@gmail.com',
    productName: 'Rinjani Mountain Tee',
    productSlug: 'rinjani-mountain-tee',
    price: 125000,
    quantity: 3,
    size: 'M',
    color: 'Abu Misty',
    totalPrice: 375000,
    notes: 'Untuk oleh-oleh pendakian Rinjani rombongan keluarga.',
    status: 'DIPROSES',
    daysAgo: 2,
    hoursAgo: 6
  },
  {
    customerName: 'Yusuf Maulana',
    customerPhone: '085611223399',
    customerEmail: 'yusuf.maulana@corp.id',
    productName: 'Summit Oversize Tee',
    productSlug: 'summit-oversize-tee',
    price: 145000,
    quantity: 1,
    size: 'XXL',
    color: 'Hitam',
    totalPrice: 145000,
    notes: 'Selesai diterima via kurir instan langsung di toko.',
    status: 'SELESAI',
    daysAgo: 6,
    hoursAgo: 3
  },
  {
    customerName: 'Tiara Andini',
    customerPhone: '087866554433',
    customerEmail: 'tiara.andini@gmail.com',
    productName: 'Wilderness Oversize',
    productSlug: 'wilderness-oversize',
    price: 155000,
    quantity: 1,
    size: 'M',
    color: 'Beige',
    totalPrice: 155000,
    notes: 'Mohon info no resi jika sudah diserahkan ke pihak ekspedisi ya admin.',
    status: 'BARU',
    daysAgo: 1,
    hoursAgo: 2
  }
];

async function seed() {
  console.log('--- Mulai Seeding 10 Custom Orders & 10 Product Orders ---');

  // 1. Prepare Custom Orders
  const coRecords = customOrdersData.map((d, index) => {
    const timestamp = getPastDate(d.daysAgo, d.hoursAgo);
    const dateObj = new Date(timestamp);
    const orderNumber = generateOrderNumber('CO', dateObj);

    // Contoh riwayat pembayaran realistis
    let samplePayments = [];
    if (d.status === 'SELESAI') {
      samplePayments = [
        {
          id: `pay_co_${index}_1`,
          date: timestamp,
          method: 'BCA',
          type: 'DP',
          amount: 2000000,
          referenceNumber: 'Transfer BCA a/n ' + d.customerName.split(' ')[0],
          note: 'DP 50% sebelum produksi',
          proofUrl: '/uploads/payment-proofs/sample_bca_receipt.svg',
          proofFileName: 'bukti_transfer_bca.svg',
          proofFileSize: 245000,
          createdAt: timestamp
        },
        {
          id: `pay_co_${index}_2`,
          date: timestamp,
          method: 'BCA',
          type: 'PELUNASAN',
          amount: 2000000,
          referenceNumber: 'Transfer BCA Pelunasan',
          note: 'Pelunasan barang siap kirim',
          proofUrl: '/uploads/payment-proofs/sample_bca_receipt.svg',
          proofFileName: 'bukti_pelunasan_bca.svg',
          proofFileSize: 245000,
          createdAt: timestamp
        }
      ];
    } else if (d.status === 'PRODUKSI') {
      samplePayments = [
        {
          id: `pay_co_${index}_1`,
          date: timestamp,
          method: 'MANDIRI',
          type: 'DP',
          amount: 2500000,
          referenceNumber: 'Livin Mandiri Ref #88921',
          note: 'Uang muka 50% telah diterima',
          proofUrl: '/uploads/payment-proofs/sample_bca_receipt.svg',
          proofFileName: 'struk_transfer_mandiri.svg',
          proofFileSize: 245000,
          createdAt: timestamp
        }
      ];
    } else if (d.status === 'MOCKUP') {
      samplePayments = [
        {
          id: `pay_co_${index}_1`,
          date: timestamp,
          method: 'QRIS',
          type: 'DP',
          amount: 1000000,
          referenceNumber: 'Scan QRIS Dinamis Toko',
          note: 'Tanda jadi DP mockup & sampling',
          proofUrl: '/uploads/payment-proofs/sample_qris_receipt.svg',
          proofFileName: 'bukti_qris_sukses.svg',
          proofFileSize: 198000,
          createdAt: timestamp
        }
      ];
    }

    const baseNotes = d.notes || '';
    const embeddedNotes = samplePayments.length > 0
      ? `${baseNotes}\n<!--PAYMENT_HISTORY_JSON:${JSON.stringify(samplePayments)}-->`.trim()
      : baseNotes;

    return {
      id: generateId('co') + index,
      orderNumber,
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail,
      garmentModel: d.garmentModel,
      garmentCategory: d.garmentCategory,
      color: d.color,
      colorHex: d.colorHex,
      fabric: d.fabric,
      fabricWeight: d.fabricWeight,
      printingMethod: d.printingMethod,
      sizes: d.sizes,
      totalQuantity: d.totalQuantity,
      notes: d.notes,
      designFiles: '[]',
      status: d.status,
      adminNotes: embeddedNotes,
      paymentHistory: JSON.stringify(samplePayments),
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });

  const coBatch = db.batch();
  coRecords.forEach((r) => {
    const docRef = db.collection('CustomOrder').doc(r.id);
    const formatted = { ...r };
    if (typeof formatted.sizes === 'string') {
      try { formatted.sizes = JSON.parse(formatted.sizes); } catch (e) { }
    }
    if (typeof formatted.paymentHistory === 'string') {
      try { formatted.paymentHistory = JSON.parse(formatted.paymentHistory); } catch (e) { }
    }
    coBatch.set(docRef, formatted, { merge: true });
  });
  await coBatch.commit();
  console.log(`Berhasil menambahkan ${coRecords.length} data CustomOrder ke Firestore!`);

  // 2. Prepare Product Orders
  const poRecords = productOrdersData.map((d, index) => {
    const timestamp = getPastDate(d.daysAgo, d.hoursAgo);
    const dateObj = new Date(timestamp);
    const orderNumber = generateOrderNumber('PO', dateObj);

    let samplePayments = [];
    if (d.status === 'SELESAI' || d.status === 'DIKIRIM') {
      const methods = ['BCA', 'QRIS', 'DANA', 'MANDIRI', 'TUNAI'];
      const chosenMethod = methods[index % methods.length];
      samplePayments = [
        {
          id: `pay_po_${index}_1`,
          date: timestamp,
          method: chosenMethod,
          type: 'LUNAS',
          amount: d.totalPrice,
          referenceNumber: `TRX-${chosenMethod}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          note: `Pembayaran lunas via ${chosenMethod}`,
          proofUrl: chosenMethod === 'QRIS' ? '/uploads/payment-proofs/sample_qris_receipt.svg' : '/uploads/payment-proofs/sample_bca_receipt.svg',
          proofFileName: `struk_${chosenMethod.toLowerCase()}.svg`,
          proofFileSize: 215000,
          createdAt: timestamp
        }
      ];
    } else if (d.status === 'DIPROSES') {
      samplePayments = [
        {
          id: `pay_po_${index}_1`,
          date: timestamp,
          method: 'BCA',
          type: 'LUNAS',
          amount: d.totalPrice,
          referenceNumber: 'Transfer m-BCA',
          note: 'Konfirmasi WhatsApp lunas',
          proofUrl: '/uploads/payment-proofs/sample_bca_receipt.svg',
          proofFileName: 'struk_mbca.svg',
          proofFileSize: 245000,
          createdAt: timestamp
        }
      ];
    }

    const baseNotes = d.notes || '';
    const embeddedNotes = samplePayments.length > 0
      ? `${baseNotes}\n<!--PAYMENT_HISTORY_JSON:${JSON.stringify(samplePayments)}-->`.trim()
      : baseNotes;

    return {
      id: generateId('po') + index,
      orderNumber,
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail,
      productName: d.productName,
      productSlug: d.productSlug,
      price: d.price,
      quantity: d.quantity,
      size: d.size,
      color: d.color,
      totalPrice: d.totalPrice,
      notes: d.notes,
      status: d.status,
      adminNotes: embeddedNotes,
      paymentHistory: JSON.stringify(samplePayments),
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });

  const poBatch = db.batch();
  poRecords.forEach((r) => {
    const docRef = db.collection('ProductOrder').doc(r.id);
    const formatted = { ...r };
    if (typeof formatted.paymentHistory === 'string') {
      try { formatted.paymentHistory = JSON.parse(formatted.paymentHistory); } catch (e) { }
    }
    poBatch.set(docRef, formatted, { merge: true });
  });
  await poBatch.commit();
  console.log(`Berhasil menambahkan ${poRecords.length} data ProductOrder ke Firestore!`);

  console.log('--- Selesai Seeding ---');
}

seed();

