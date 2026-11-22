/**
 * RINJANI CLOTHING - PAYMENT UTILITIES & CONFIGURATION
 * Helper untuk riwayat metode pembayaran pelanggan (BCA, Mandiri, QRIS, DANA, Tunai, dll.)
 */

export const PAYMENT_METHODS = {
  // Transfer Bank
  BCA: {
    id: 'BCA',
    label: 'Bank BCA',
    shortLabel: 'BCA',
    category: 'Bank Transfer',
    color: '#0060AF',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'Landmark',
  },
  MANDIRI: {
    id: 'MANDIRI',
    label: 'Bank Mandiri',
    shortLabel: 'Mandiri',
    category: 'Bank Transfer',
    color: '#0A3B74',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'Landmark',
  },
  BRI: {
    id: 'BRI',
    label: 'Bank BRI',
    shortLabel: 'BRI',
    category: 'Bank Transfer',
    color: '#00529C',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'Landmark',
  },
  BNI: {
    id: 'BNI',
    label: 'Bank BNI',
    shortLabel: 'BNI',
    category: 'Bank Transfer',
    color: '#E05315',
    bg: '#FFF7ED',
    border: '#FED7AA',
    icon: 'Landmark',
  },
  BSI: {
    id: 'BSI',
    label: 'Bank BSI',
    shortLabel: 'BSI',
    category: 'Bank Transfer',
    color: '#00A39D',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: 'Landmark',
  },
  SEABANK: {
    id: 'SEABANK',
    label: 'SeaBank',
    shortLabel: 'SeaBank',
    category: 'Bank Transfer',
    color: '#FF5722',
    bg: '#FFF7ED',
    border: '#FED7AA',
    icon: 'Landmark',
  },
  JAGO: {
    id: 'JAGO',
    label: 'Bank Jago',
    shortLabel: 'Jago',
    category: 'Bank Transfer',
    color: '#DB2777',
    bg: '#FDF2F8',
    border: '#FBCFE8',
    icon: 'Landmark',
  },
  BANK_LAIN: {
    id: 'BANK_LAIN',
    label: 'Transfer Bank Lain',
    shortLabel: 'Bank Lain',
    category: 'Bank Transfer',
    color: '#4B5563',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    icon: 'Landmark',
  },

  // E-Wallet & QRIS
  QRIS: {
    id: 'QRIS',
    label: 'QRIS',
    shortLabel: 'QRIS',
    category: 'E-Wallet / QRIS',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: 'QrCode',
  },
  GOPAY: {
    id: 'GOPAY',
    label: 'GoPay',
    shortLabel: 'GoPay',
    category: 'E-Wallet / QRIS',
    color: '#0081A0',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    icon: 'Wallet',
  },
  OVO: {
    id: 'OVO',
    label: 'OVO',
    shortLabel: 'OVO',
    category: 'E-Wallet / QRIS',
    color: '#4C3494',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    icon: 'Wallet',
  },
  DANA: {
    id: 'DANA',
    label: 'DANA',
    shortLabel: 'DANA',
    category: 'E-Wallet / QRIS',
    color: '#118EEA',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'Wallet',
  },
  SHOPEEPAY: {
    id: 'SHOPEEPAY',
    label: 'ShopeePay',
    shortLabel: 'ShopeePay',
    category: 'E-Wallet / QRIS',
    color: '#EE4D2D',
    bg: '#FFF7ED',
    border: '#FED7AA',
    icon: 'Wallet',
  },
  LINKAJA: {
    id: 'LINKAJA',
    label: 'LinkAja',
    shortLabel: 'LinkAja',
    category: 'E-Wallet / QRIS',
    color: '#E32526',
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: 'Wallet',
  },

  // Tunai / Cash
  TUNAI: {
    id: 'TUNAI',
    label: 'Tunai di Toko (Cash)',
    shortLabel: 'Tunai',
    category: 'Tunai / Cash',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: 'Banknote',
  },
  COD: {
    id: 'COD',
    label: 'COD (Bayar di Tempat)',
    shortLabel: 'COD',
    category: 'Tunai / Cash',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: 'Truck',
  },

  // Lainnya
  DEBIT_KREDIT: {
    id: 'DEBIT_KREDIT',
    label: 'Debit / Kartu Kredit',
    shortLabel: 'Kartu',
    category: 'Lainnya',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    icon: 'CreditCard',
  },
  LAINNYA: {
    id: 'LAINNYA',
    label: 'Metode Lainnya',
    shortLabel: 'Lainnya',
    category: 'Lainnya',
    color: '#6B7280',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    icon: 'CircleDollarSign',
  },
};

export const POPULAR_METHODS = [
  'BCA',
  'MANDIRI',
  'BRI',
  'BNI',
  'QRIS',
  'DANA',
  'GOPAY',
  'SHOPEEPAY',
  'TUNAI',
  'COD',
  'BANK_LAIN',
  'LAINNYA',
];

export const PAYMENT_TYPES = {
  LUNAS: {
    id: 'LUNAS',
    label: 'Pembayaran Penuh (Lunas 100%)',
    shortLabel: 'Lunas Penuh',
    badge: 'Lunas',
    color: '#059669',
    bg: '#ECFDF5',
  },
  DP: {
    id: 'DP',
    label: 'Uang Muka (DP)',
    shortLabel: 'Uang Muka (DP)',
    badge: 'DP',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  PELUNASAN: {
    id: 'PELUNASAN',
    label: 'Pelunasan Sisa',
    shortLabel: 'Pelunasan Sisa',
    badge: 'Pelunasan',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  TERMIN: {
    id: 'TERMIN',
    label: 'Cicilan / Termin',
    shortLabel: 'Termin',
    badge: 'Termin',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
};

export const PAYMENT_STATUS_CONFIG = {
  LUNAS: {
    label: 'Lunas',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    description: 'Seluruh tagihan pesanan telah dibayar lunas',
  },
  DP: {
    label: 'DP / Sebagian',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    description: 'Sudah ada pembayaran sebagian / uang muka',
  },
  BELUM_BAYAR: {
    label: 'Belum Bayar',
    color: '#6B7280',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    description: 'Belum ada catatan pembayaran masuk',
  },
  LEBIH_BAYAR: {
    label: 'Lebih Bayar',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    description: 'Jumlah pembayaran melebihi total tagihan pesanan',
  },
};

/**
 * Mendapatkan detail metode pembayaran berdasarkan key atau nama kustom
 */
export function getPaymentMethodInfo(methodKey, customMethodName = '') {
  if (!methodKey) {
    return PAYMENT_METHODS.LAINNYA;
  }
  const upper = String(methodKey).toUpperCase().trim();
  const found = PAYMENT_METHODS[upper];
  if (found) {
    if ((upper === 'BANK_LAIN' || upper === 'LAINNYA') && customMethodName) {
      return {
        ...found,
        label: customMethodName,
        shortLabel: customMethodName,
      };
    }
    return found;
  }
  return {
    id: 'LAINNYA',
    label: customMethodName || methodKey,
    shortLabel: customMethodName || methodKey,
    category: 'Lainnya',
    color: '#6B7280',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    icon: 'CircleDollarSign',
  };
}

/**
 * Format tanggal & waktu pembayaran bahasa Indonesia
 */
export function formatPaymentDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Parsing array riwayat pembayaran dari berbagai kemungkinan sumber:
 * 1. order.paymentHistory (JSON string atau Array)
 * 2. Embedded JSON di dalam order.adminNotes <!--PAYMENT_HISTORY_JSON:...-->
 * 3. LocalStorage fallback (browser offline/dev cache)
 */
export function parsePaymentHistory(order) {
  if (!order) return [];

  // 1. Cek properti paymentHistory
  if (order.paymentHistory) {
    if (Array.isArray(order.paymentHistory)) {
      return order.paymentHistory;
    }
    if (typeof order.paymentHistory === 'string') {
      try {
        const parsed = JSON.parse(order.paymentHistory);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Gagal parse paymentHistory JSON:', e);
      }
    }
  }

  // 2. Cek embedded marker di adminNotes
  if (order.adminNotes && typeof order.adminNotes === 'string') {
    const match = order.adminNotes.match(/<!--PAYMENT_HISTORY_JSON:([\s\S]*?)-->/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Gagal parse embedded payment history in adminNotes:', e);
      }
    }
  }

  // 3. Cek localStorage di client jika di browser
  if (typeof window !== 'undefined' && order.id) {
    try {
      const cached = localStorage.getItem(`rc_payment_history_${order.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore localStorage error
    }
  }

  return [];
}

/**
 * Membersihkan adminNotes dari marker embedded JSON agar rapi saat ditampilkan ke admin
 */
export function cleanAdminNotes(notes) {
  if (!notes || typeof notes !== 'string') return '';
  return notes.replace(/<!--PAYMENT_HISTORY_JSON:[\s\S]*?-->/g, '').trim();
}

/**
 * Menghitung ringkasan status pembayaran pesanan
 */
export function calculatePaymentSummary(order, customPriceOverride = null) {
  if (!order) {
    return {
      targetPrice: 0,
      totalPaid: 0,
      balanceDue: 0,
      status: 'BELUM_BAYAR',
      statusConfig: PAYMENT_STATUS_CONFIG.BELUM_BAYAR,
      payments: [],
      latestPayment: null,
      methodsList: [],
      methodsSummary: 'Belum Bayar',
      percentPaid: 0,
    };
  }

  // Tentukan total tagihan
  let targetPrice = 0;
  if (customPriceOverride !== null && customPriceOverride !== undefined) {
    targetPrice = Number(customPriceOverride) || 0;
  } else if (order.totalPrice !== undefined && order.totalPrice !== null) {
    targetPrice = Number(order.totalPrice) || 0;
  } else if (order.price !== undefined && order.quantity !== undefined) {
    targetPrice = (Number(order.price) || 0) * (Number(order.quantity) || 1);
  }

  // Parse riwayat
  const payments = parsePaymentHistory(order);

  // Hitung total terbayar
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, targetPrice - totalPaid);
  const isOverpaid = targetPrice > 0 && totalPaid > targetPrice;

  // Status
  let status = 'BELUM_BAYAR';
  if (payments.length > 0) {
    if (targetPrice > 0 && totalPaid >= targetPrice) {
      status = isOverpaid ? 'LEBIH_BAYAR' : 'LUNAS';
    } else if (totalPaid > 0) {
      status = 'DP';
    }
  }

  const statusConfig = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.BELUM_BAYAR;

  // Metode-metode yang digunakan
  const uniqueMethods = [];
  payments.forEach((p) => {
    const info = getPaymentMethodInfo(p.method, p.customMethodName);
    const label = info.shortLabel || info.label;
    if (label && !uniqueMethods.includes(label)) {
      uniqueMethods.push(label);
    }
  });

  const latestPayment = payments.length > 0 ? payments[payments.length - 1] : null;

  let methodsSummary = '-';
  if (uniqueMethods.length > 0) {
    methodsSummary = uniqueMethods.join(', ');
  }

  const percentPaid = targetPrice > 0 ? Math.min(100, Math.round((totalPaid / targetPrice) * 100)) : (totalPaid > 0 ? 100 : 0);

  return {
    targetPrice,
    totalPaid,
    balanceDue,
    status,
    statusConfig,
    payments,
    latestPayment,
    methodsList: uniqueMethods,
    methodsSummary,
    percentPaid,
  };
}

/**
 * Menyediakan data ringkas untuk badge pembayaran di header kartu / tabel admin
 */
export function getOrderPaymentBadgeInfo(order) {
  const summary = calculatePaymentSummary(order);
  const { status, statusConfig, methodsList, totalPaid, latestPayment } = summary;

  if (status === 'LUNAS') {
    const methodText = methodsList.length > 0 ? ` • ${methodsList.join('/')}` : '';
    return {
      status,
      badgeText: `Lunas${methodText}`,
      shortText: 'Lunas',
      methodText: methodsList.join(', ') || 'Lunas',
      color: statusConfig.color,
      bg: statusConfig.bg,
      border: statusConfig.border,
      isPaid: true,
      totalPaid,
    };
  }

  if (status === 'DP') {
    const methodText = latestPayment ? ` • ${getPaymentMethodInfo(latestPayment.method, latestPayment.customMethodName).shortLabel}` : '';
    return {
      status,
      badgeText: `DP (${summary.percentPaid}%)${methodText}`,
      shortText: 'DP',
      methodText: methodsList.join(', ') || 'DP',
      color: statusConfig.color,
      bg: statusConfig.bg,
      border: statusConfig.border,
      isPaid: false,
      totalPaid,
    };
  }

  if (status === 'LEBIH_BAYAR') {
    return {
      status,
      badgeText: `Lebih Bayar • ${methodsList.join('/')}`,
      shortText: 'Lebih',
      methodText: methodsList.join(', '),
      color: statusConfig.color,
      bg: statusConfig.bg,
      border: statusConfig.border,
      isPaid: true,
      totalPaid,
    };
  }

  return {
    status: 'BELUM_BAYAR',
    badgeText: 'Belum Bayar',
    shortText: 'Belum Bayar',
    methodText: '-',
    color: statusConfig.color,
    bg: statusConfig.bg,
    border: statusConfig.border,
    isPaid: false,
    totalPaid: 0,
  };
}

/**
 * Format ukuran file (Bytes, KB, MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Cek apakah URL/nama file merupakan gambar
 */
export function isImageFile(urlOrFileName) {
  if (!urlOrFileName) return false;
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(urlOrFileName) || String(urlOrFileName).startsWith('data:image/');
}

/**
 * Cek apakah URL/nama file merupakan dokumen PDF
 */
export function isPdfFile(urlOrFileName) {
  if (!urlOrFileName) return false;
  return /\.pdf(\?.*)?$/i.test(urlOrFileName) || String(urlOrFileName).startsWith('data:application/pdf');
}
