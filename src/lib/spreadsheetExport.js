// Helper functions for CSV/Excel export and Google Sheets integration

/**
 * Mendapatkan detail tanggal-bulan-tahun & waktu lengkap dalam bahasa Indonesia
 */
export function getFormattedDateInfo(dateObj = new Date()) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const day = String(validDate.getDate()).padStart(2, '0');
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const year = validDate.getFullYear();
  const numericDate = `${day}-${month}-${year}`; // e.g. "30-10-2026"

  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const dayName = daysIndo[validDate.getDay()];
  const monthName = monthsIndo[validDate.getMonth()];
  const fullDateText = `${dayName}, ${validDate.getDate()} ${monthName} ${year}`;
  const monthYearText = `${monthName} ${year}`;

  const hours = String(validDate.getHours()).padStart(2, '0');
  const minutes = String(validDate.getMinutes()).padStart(2, '0');
  const seconds = String(validDate.getSeconds()).padStart(2, '0');
  const timeText = `${hours}:${minutes}:${seconds} WIB`;
  const timeShort = `${hours}:${minutes} WIB`;

  return {
    numericDate,
    fullDateText,
    monthYearText,
    timeText,
    timeShort,
    day,
    month,
    year,
    dayName,
    monthName,
    slug: `${day}-${month}-${year}`,
  };
}

/**
 * Escape sel aman untuk format CSV
 */
export function escapeCell(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Download file Excel (.xls) dengan tabel bergaris rapi, header warna, dan kolom kesamping
 */
export function downloadExcelHtml(filename, htmlTableContent) {
  const fullHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Laporan Rinjani</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    * {
      white-space: nowrap !important;
      mso-wrap-style: none !important;
    }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      margin: 20px;
      color: #1e293b;
      white-space: nowrap;
    }
    table {
      border-collapse: collapse;
      table-layout: auto;
      margin-bottom: 24px;
      white-space: nowrap !important;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 14px;
      font-size: 11pt;
      text-align: left;
      vertical-align: middle;
      white-space: nowrap !important;
      mso-wrap-style: none !important;
      height: 28px;
    }
    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: bold;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .title-banner {
      background-color: #0f172a;
      color: #ffffff;
      font-size: 14pt;
      font-weight: bold;
      padding: 12px 16px;
      text-align: center;
      height: 38px;
    }
    .meta-bar td, .meta-cell {
      background-color: #f1f5f9;
      font-size: 10pt;
      padding: 9px 14px;
      text-align: center;
      white-space: nowrap !important;
      mso-wrap-style: none !important;
      mso-number-format: "\\@";
    }
    .kpi-header td {
      background-color: #334155;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
      font-size: 10pt;
      height: 30px;
    }
    .kpi-value td {
      background-color: #f8fafc;
      font-weight: bold;
      text-align: center;
      font-size: 12pt;
      padding: 10px 14px;
      height: 34px;
    }
    .section-title td {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: bold;
      font-size: 11pt;
      padding: 9px 14px;
      height: 32px;
    }
    .summary-row td {
      background-color: #f1f5f9;
      font-weight: bold;
      border-top: 2px solid #0f172a;
      height: 32px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .phone-cell { mso-number-format: "\\@"; }
  </style>
</head>
<body>
  ${htmlTableContent}
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xls') ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download file CSV dengan penataan horizontal kesamping
 */
export function downloadCsvHorizontal(filename, lines) {
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * EXPORT DATA REKAPITULASI DASHBOARD (HORIZONTAL KESAMPING)
 * - Baris 1: Judul
 * - Baris 2: Tanggal, Hari, Bulan, Tahun, Waktu berjejer KESAMPING (tanpa wrapping menurun)
 * - Baris 4-5: Ringkasan Metrik KPI berjejer KESAMPING
 * - Baris 7+: Tabel Transaksi berjejer KESAMPING secara seragam
 */
export function exportDashboardSummaryCsv(stats, format = 'excel') {
  const dateInfo = getFormattedDateInfo();
  const safeStats = stats || {};

  const recentCustom = safeStats.recentCustomOrders || [];

  // Hitung total kuantitas
  const totalCustomQty = recentCustom.reduce((sum, o) => sum + (Number(o.totalQuantity) || 0), 0);

  if (format === 'csv') {
    // FORMAT CSV (HORIZONTAL KESAMPING)
    const lines = [];
    lines.push(`"RINJANI CLOTHING - LAPORAN REKAPITULASI DATA DASHBOARD"`);
    
    // Baris Tanggal-Bulan-Tahun KESAMPING (Label dan nilai dalam sel yang sama agar tidak terpotong)
    lines.push([
      `"TANGGAL: ${dateInfo.numericDate}"`,
      `"HARI: ${dateInfo.dayName}"`,
      `"BULAN: ${dateInfo.monthName}"`,
      `"TAHUN: ${dateInfo.year}"`,
      `"WAKTU: ${dateInfo.timeShort}"`,
      `"PERIODE: ${dateInfo.monthYearText}"`,
      `"TOTAL DATA: ${recentCustom.length} Pesanan"`
    ].join(','));

    lines.push(''); // Garis pemisah

    // Baris Metrik KPI KESAMPING
    lines.push(`"[ RINGKASAN METRIK & INDIKATOR KINERJA UTAMA (KPI DASHBOARD) ]"`);
    lines.push([
      `"TOTAL PRODUK"`,
      `"STOK HABIS"`,
      `"PESANAN CUSTOM"`,
      `"CUSTOM BARU"`,
      `"PESANAN PRODUK"`,
      `"TOTAL KATEGORI"`
    ].join(','));

    lines.push([
      `"${safeStats.totalProducts || 0} Produk"`,
      `"${safeStats.outOfStockCount || 0} Produk"`,
      `"${safeStats.totalCustomOrders || 0} Pesanan"`,
      `"${safeStats.newCustomOrders || 0} Pesanan"`,
      `"${safeStats.totalProductOrders || 0} Pesanan"`,
      `"${safeStats.totalCategories || 0} Kategori"`
    ].join(','));

    lines.push(''); // Garis pemisah

    // Baris Header Kolom Tabel Data KESAMPING
    lines.push(`"[ DAFTAR DETAIL TRANSAKSI & PESANAN TERKINI ]"`);
    lines.push([
      `"No"`,
      `"No. Pesanan"`,
      `"Tanggal (DD-MM-YYYY)"`,
      `"Jam (WIB)"`,
      `"Status"`,
      `"Nama Customer"`,
      `"No. WhatsApp"`,
      `"Email"`,
      `"Model Pakaian"`,
      `"Warna"`,
      `"Jumlah Qty (pcs)"`,
      `"Catatan Customer"`
    ].join(','));

    // Baris-baris Data Kesamping
    recentCustom.forEach((o, idx) => {
      const oDate = o.createdAt ? getFormattedDateInfo(o.createdAt) : null;
      lines.push([
        idx + 1,
        escapeCell(o.orderNumber),
        escapeCell(oDate ? oDate.numericDate : '-'),
        escapeCell(oDate ? oDate.timeShort : '-'),
        escapeCell(o.status),
        escapeCell(o.customerName),
        escapeCell(o.customerPhone ? `'${o.customerPhone}` : '-'),
        escapeCell(o.customerEmail || '-'),
        escapeCell(o.garmentModel),
        escapeCell(o.color),
        Number(o.totalQuantity) || 0,
        escapeCell(o.notes || '-')
      ].join(','));
    });

    // Baris Rekapitulasi Total di bagian bawah
    lines.push('');
    lines.push([
      `"TOTAL REKAPITULASI"`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`,
      `"${totalCustomQty} pcs"`, `""`
    ].join(','));

    downloadCsvHorizontal(`Rinjani_Rekap_Dashboard_${dateInfo.slug}.csv`, lines);
    return;
  }

  // DEFAULT: FORMAT EXCEL (.XLS) BERGARIS & KESAMPING
  let customRowsHtml = '';
  if (recentCustom.length > 0) {
    recentCustom.forEach((o, idx) => {
      const oDate = o.createdAt ? getFormattedDateInfo(o.createdAt) : null;
      customRowsHtml += `<tr>
        <td class="text-center">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold;">${o.orderNumber}</td>
        <td class="text-center">${oDate ? oDate.numericDate : '-'}</td>
        <td class="text-center">${oDate ? oDate.timeShort : '-'}</td>
        <td class="text-center" style="font-weight: bold;">${o.status}</td>
        <td><strong>${o.customerName}</strong></td>
        <td class="phone-cell">${o.customerPhone || '-'}</td>
        <td>${o.customerEmail || '-'}</td>
        <td>${o.garmentModel}</td>
        <td>${o.color}</td>
        <td class="text-center"><strong>${o.totalQuantity || 0}</strong></td>
        <td>${o.notes || '-'}</td>
      </tr>`;
    });
  } else {
    customRowsHtml = `<tr><td colspan="12" class="text-center" style="padding: 16px; color: #64748b;">Tidak ada data transaksi pesanan terkini</td></tr>`;
  }

  const tableHtml = `
  <table border="1">
    <!-- BARIS 1: BANNER JUDUL -->
    <tr>
      <td colspan="12" class="title-banner">
        RINJANI CLOTHING - LAPORAN REKAPITULASI DATA DASHBOARD
      </td>
    </tr>

    <!-- BARIS 2: TANGGAL-BULAN-TAHUN MENYAMPING KE KANAN (TANPA TEKS MENURUN) -->
    <tr style="height: 36px;">
      <td colspan="2" class="meta-cell"><b>TANGGAL:</b> <span style="color: #2563eb; font-weight: bold;">${dateInfo.numericDate}</span></td>
      <td colspan="2" class="meta-cell"><b>HARI:</b> <span>${dateInfo.dayName}</span></td>
      <td colspan="2" class="meta-cell"><b>BULAN:</b> <span>${dateInfo.monthName}</span></td>
      <td colspan="2" class="meta-cell"><b>TAHUN:</b> <span>${dateInfo.year}</span></td>
      <td colspan="2" class="meta-cell"><b>WAKTU:</b> <span>${dateInfo.timeShort}</span></td>
      <td colspan="2" class="meta-cell"><b>PERIODE:</b> <span style="color: #059669; font-weight: bold;">${dateInfo.monthYearText}</span></td>
    </tr>

    <!-- SPACER -->
    <tr><td colspan="12" style="border: none; height: 12px; background: transparent;"></td></tr>

    <!-- BARIS 3: JUDUL KPI KESAMPING -->
    <tr class="section-title">
      <td colspan="12">RINGKASAN METRIK & INDIKATOR KINERJA UTAMA (KPI DASHBOARD)</td>
    </tr>

    <!-- BARIS 4: HEADER METRIK KESAMPING -->
    <tr class="kpi-header">
      <td colspan="2">TOTAL PRODUK</td>
      <td colspan="2">STOK HABIS</td>
      <td colspan="2">PESANAN CUSTOM</td>
      <td colspan="2">CUSTOM STATUS BARU</td>
      <td colspan="2">PESANAN PRODUK</td>
      <td colspan="2">TOTAL KATEGORI</td>
    </tr>

    <!-- BARIS 5: NILAI METRIK KESAMPING -->
    <tr class="kpi-value">
      <td colspan="2" style="color: #0f172a;">${safeStats.totalProducts || 0} Produk</td>
      <td colspan="2" style="color: #dc2626;">${safeStats.outOfStockCount || 0} Produk</td>
      <td colspan="2" style="color: #2563eb;">${safeStats.totalCustomOrders || 0} Pesanan</td>
      <td colspan="2" style="color: #d97706;">${safeStats.newCustomOrders || 0} Pesanan</td>
      <td colspan="2" style="color: #059669;">${safeStats.totalProductOrders || 0} Pesanan</td>
      <td colspan="2" style="color: #475569;">${safeStats.totalCategories || 0} Kategori</td>
    </tr>

    <!-- SPACER -->
    <tr><td colspan="12" style="border: none; height: 16px; background: transparent;"></td></tr>

    <!-- BARIS 6: JUDUL TABEL TRANSAKSI -->
    <tr class="section-title">
      <td colspan="12">DAFTAR DETAIL TRANSAKSI & PESANAN TERKINI (MENYAMPING KE KANAN)</td>
    </tr>

    <!-- BARIS 7: HEADER KOLOM KESAMPING -->
    <tr>
      <th style="width: 50px; text-align: center;">No</th>
      <th style="width: 140px;">No. Pesanan</th>
      <th style="width: 120px; text-align: center;">Tanggal</th>
      <th style="width: 90px; text-align: center;">Jam</th>
      <th style="width: 100px; text-align: center;">Status</th>
      <th style="width: 170px;">Nama Customer</th>
      <th style="width: 130px;">No. WhatsApp</th>
      <th style="width: 180px;">Email Customer</th>
      <th style="width: 150px;">Model Pakaian</th>
      <th style="width: 110px;">Warna</th>
      <th style="width: 100px; text-align: center;">Qty (pcs)</th>
      <th style="width: 240px;">Catatan Customer</th>
    </tr>

    <!-- BARIS DATA -->
    ${customRowsHtml}

    <!-- BARIS RINGKASAN TOTAL -->
    <tr class="summary-row">
      <td colspan="10" style="text-align: right; padding-right: 16px;">TOTAL REKAPITULASI KUANTITAS:</td>
      <td class="text-center" style="font-size: 12pt; color: #059669;">${totalCustomQty} pcs</td>
      <td></td>
    </tr>
  </table>
  `;

  downloadExcelHtml(`Rinjani_Rekap_Dashboard_${dateInfo.slug}.xls`, tableHtml);
}

/**
 * EXPORT DATA PESANAN CUSTOM (HORIZONTAL KESAMPING)
 * Semua kolom tertata rapi dari kiri ke kanan.
 */
export function exportCustomOrdersCsv(orders = [], format = 'excel') {
  const dateInfo = getFormattedDateInfo();
  const safeOrders = orders || [];
  let totalQtySum = 0;

  if (format === 'csv') {
    const lines = [];
    lines.push(`"LAPORAN DATA PESANAN CUSTOM KONVEKSI - RINJANI CLOTHING"`);
    lines.push([
      `"TANGGAL CETAK"`, `"${dateInfo.numericDate}"`,
      `"HARI"`, `"${dateInfo.dayName}"`,
      `"BULAN"`, `"${dateInfo.monthName}"`,
      `"TAHUN"`, `"${dateInfo.year}"`,
      `"WAKTU"`, `"${dateInfo.timeShort}"`,
      `"PERIODE"`, `"${dateInfo.monthYearText}"`,
      `"TOTAL PESANAN"`, `"${safeOrders.length} Pesanan"`
    ].join(','));
    lines.push('');

    // Headers horizontal kesamping
    lines.push([
      `"No"`,
      `"No. Pesanan"`,
      `"Tanggal (DD-MM-YYYY)"`,
      `"Jam (WIB)"`,
      `"Status Pesanan"`,
      `"Nama Customer"`,
      `"No. WhatsApp"`,
      `"Email Customer"`,
      `"Model Pakaian"`,
      `"Kategori Model"`,
      `"Pilihan Warna"`,
      `"Jenis Bahan Kain"`,
      `"Gramasi/Ketebalan"`,
      `"Metode Cetak / Sablon"`,
      `"Rincian Ukuran"`,
      `"Total Qty (pcs)"`,
      `"Catatan Customer"`,
      `"File Desain"`,
      `"Catatan Admin"`
    ].join(','));

    safeOrders.forEach((o, idx) => {
      let sizesStr = '';
      try {
        const parsed = typeof o.sizes === 'string' ? JSON.parse(o.sizes || '{}') : o.sizes;
        sizesStr = Object.entries(parsed || {}).filter(([, q]) => Number(q) > 0).map(([s, q]) => `${s}: ${q}`).join(', ');
      } catch {
        sizesStr = String(o.sizes || '-');
      }

      let filesStr = '';
      try {
        const parsedFiles = typeof o.designFiles === 'string' ? JSON.parse(o.designFiles || '[]') : o.designFiles;
        filesStr = (Array.isArray(parsedFiles) ? parsedFiles : []).map((f) => (typeof f === 'string' ? f : f.name || f.url || 'file')).join('; ');
      } catch {
        filesStr = '';
      }

      const oDate = o.createdAt ? getFormattedDateInfo(o.createdAt) : null;
      const qty = Number(o.totalQuantity) || 0;
      totalQtySum += qty;

      lines.push([
        idx + 1,
        escapeCell(o.orderNumber),
        escapeCell(oDate ? oDate.numericDate : '-'),
        escapeCell(oDate ? oDate.timeShort : '-'),
        escapeCell(o.status),
        escapeCell(o.customerName),
        escapeCell(o.customerPhone ? `'${o.customerPhone}` : '-'),
        escapeCell(o.customerEmail || '-'),
        escapeCell(o.garmentModel),
        escapeCell(o.garmentCategory || '-'),
        escapeCell(o.color),
        escapeCell(o.fabric),
        escapeCell(o.fabricWeight || '-'),
        escapeCell(o.printingMethod),
        escapeCell(sizesStr || '-'),
        qty,
        escapeCell(o.notes || '-'),
        escapeCell(filesStr || '-'),
        escapeCell(o.adminNotes || '-')
      ].join(','));
    });

    lines.push('');
    lines.push([
      `"TOTAL REKAPITULASI"`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`,
      `"${totalQtySum} pcs"`, `""`, `""`, `""`
    ].join(','));

    downloadCsvHorizontal(`Rinjani_Pesanan_Custom_${dateInfo.slug}.csv`, lines);
    return;
  }

  // DEFAULT: EXCEL (.XLS)
  let rowsHtml = '';
  safeOrders.forEach((o, idx) => {
    let sizesStr = '';
    try {
      const parsed = typeof o.sizes === 'string' ? JSON.parse(o.sizes || '{}') : o.sizes;
      sizesStr = Object.entries(parsed || {}).filter(([, q]) => Number(q) > 0).map(([s, q]) => `${s}: ${q}`).join(', ');
    } catch {
      sizesStr = String(o.sizes || '-');
    }

    let filesStr = '';
    try {
      const parsedFiles = typeof o.designFiles === 'string' ? JSON.parse(o.designFiles || '[]') : o.designFiles;
      filesStr = (Array.isArray(parsedFiles) ? parsedFiles : []).map((f) => (typeof f === 'string' ? f : f.name || f.url || 'file')).join('; ');
    } catch {
      filesStr = '';
    }

    const oDate = o.createdAt ? getFormattedDateInfo(o.createdAt) : null;
    const qty = Number(o.totalQuantity) || 0;
    totalQtySum += qty;

    rowsHtml += `<tr>
      <td class="text-center">${idx + 1}</td>
      <td style="font-family: monospace; font-weight: bold;">${o.orderNumber}</td>
      <td class="text-center">${oDate ? oDate.numericDate : '-'}</td>
      <td class="text-center">${oDate ? oDate.timeShort : '-'}</td>
      <td class="text-center" style="font-weight: bold;">${o.status}</td>
      <td><strong>${o.customerName}</strong></td>
      <td class="phone-cell">${o.customerPhone || '-'}</td>
      <td>${o.customerEmail || '-'}</td>
      <td>${o.garmentModel}</td>
      <td>${o.garmentCategory || '-'}</td>
      <td>${o.color}</td>
      <td>${o.fabric}</td>
      <td>${o.fabricWeight || '-'}</td>
      <td>${o.printingMethod}</td>
      <td>${sizesStr || '-'}</td>
      <td class="text-center" style="font-weight: bold;">${qty}</td>
      <td>${o.notes || '-'}</td>
      <td>${filesStr || '-'}</td>
      <td>${o.adminNotes || '-'}</td>
    </tr>`;
  });

  const tableHtml = `
  <table border="1">
    <tr>
      <td colspan="19" class="title-banner">
        RINJANI CLOTHING - LAPORAN REKAPITULASI PESANAN CUSTOM KONVEKSI
      </td>
    </tr>
    <!-- BARIS 2: TANGGAL-BULAN-TAHUN MENYAMPING KE KANAN -->
    <tr style="height: 36px;">
      <td colspan="3" class="meta-cell"><b>TANGGAL:</b> <span style="color: #2563eb; font-weight: bold;">${dateInfo.numericDate}</span></td>
      <td colspan="3" class="meta-cell"><b>HARI:</b> <span>${dateInfo.dayName}</span></td>
      <td colspan="3" class="meta-cell"><b>BULAN:</b> <span>${dateInfo.monthName}</span></td>
      <td colspan="3" class="meta-cell"><b>TAHUN:</b> <span>${dateInfo.year}</span></td>
      <td colspan="3" class="meta-cell"><b>WAKTU:</b> <span>${dateInfo.timeShort}</span></td>
      <td colspan="4" class="meta-cell"><b>TOTAL PESANAN:</b> <span style="color: #059669; font-weight: bold;">${safeOrders.length} Pesanan (${totalQtySum} pcs)</span></td>
    </tr>
    <tr><td colspan="19" style="border: none; height: 12px; background: transparent;"></td></tr>
    <tr>
      <th style="width: 35px; text-align: center;">No</th>
      <th style="width: 120px;">No. Pesanan</th>
      <th style="width: 95px; text-align: center;">Tanggal</th>
      <th style="width: 75px; text-align: center;">Jam</th>
      <th style="width: 85px; text-align: center;">Status</th>
      <th style="width: 150px;">Nama Customer</th>
      <th style="width: 120px;">WhatsApp</th>
      <th style="width: 150px;">Email</th>
      <th style="width: 130px;">Model Pakaian</th>
      <th style="width: 110px;">Kategori</th>
      <th style="width: 95px;">Warna</th>
      <th style="width: 120px;">Bahan Kain</th>
      <th style="width: 95px;">Gramasi</th>
      <th style="width: 110px;">Metode Cetak</th>
      <th style="width: 130px;">Rincian Ukuran</th>
      <th style="width: 80px; text-align: center;">Qty (pcs)</th>
      <th style="width: 180px;">Catatan Customer</th>
      <th style="width: 140px;">File Desain</th>
      <th style="width: 150px;">Catatan Admin</th>
    </tr>
    ${rowsHtml || `<tr><td colspan="19" class="text-center" style="padding: 16px;">Tidak ada data pesanan custom</td></tr>`}
    <tr class="summary-row">
      <td colspan="15" style="text-align: right; padding-right: 16px;">TOTAL KUANTITAS KESELURUHAN:</td>
      <td class="text-center" style="font-size: 12pt; color: #059669;">${totalQtySum} pcs</td>
      <td colspan="3"></td>
    </tr>
  </table>
  `;

  downloadExcelHtml(`Rinjani_Pesanan_Custom_${dateInfo.slug}.xls`, tableHtml);
}

/**
 * EXPORT DATA PESANAN PRODUK SHOP (HORIZONTAL KESAMPING)
 */
export function exportProductOrdersCsv(orders = [], format = 'excel') {
  const dateInfo = getFormattedDateInfo();
  const safeOrders = orders || [];
  let totalQtySum = 0;
  let totalPriceSum = 0;

  if (format === 'csv') {
    const lines = [];
    lines.push(`"LAPORAN DATA TRANSAKSI PESANAN PRODUK (SHOP) - RINJANI CLOTHING"`);
    lines.push([
      `"TANGGAL CETAK"`, `"${dateInfo.numericDate}"`,
      `"HARI"`, `"${dateInfo.dayName}"`,
      `"BULAN"`, `"${dateInfo.monthName}"`,
      `"TAHUN"`, `"${dateInfo.year}"`,
      `"WAKTU"`, `"${dateInfo.timeShort}"`,
      `"PERIODE"`, `"${dateInfo.monthYearText}"`,
      `"TOTAL PESANAN"`, `"${safeOrders.length} Pesanan"`
    ].join(','));
    lines.push('');

    // Headers horizontal kesamping
    lines.push([
      `"No"`,
      `"No. Pesanan"`,
      `"Tanggal (DD-MM-YYYY)"`,
      `"Jam (WIB)"`,
      `"Status Transaksi"`,
      `"Nama Pembeli"`,
      `"No. WhatsApp"`,
      `"Email Pembeli"`,
      `"Nama Produk"`,
      `"Ukuran"`,
      `"Pilihan Warna"`,
      `"Jumlah (pcs)"`,
      `"Harga Satuan (Rp)"`,
      `"Total Pembayaran (Rp)"`,
      `"Catatan Pembeli"`,
      `"Catatan Admin"`
    ].join(','));

    safeOrders.forEach((o, idx) => {
      const oDate = o.createdAt ? getFormattedDateInfo(o.createdAt) : null;
      const qty = Number(o.quantity) || 0;
      const price = Number(o.price) || 0;
      const totalPrice = Number(o.totalPrice) || (qty * price) || 0;
      totalQtySum += qty;
      totalPriceSum += totalPrice;

      lines.push([
        idx + 1,
        escapeCell(o.orderNumber),
        escapeCell(oDate ? oDate.numericDate : '-'),
        escapeCell(oDate ? oDate.timeShort : '-'),
        escapeCell(o.status),
        escapeCell(o.customerName),
        escapeCell(o.customerPhone ? `'${o.customerPhone}` : '-'),
        escapeCell(o.customerEmail || '-'),
        escapeCell(o.productName),
        escapeCell(o.size || '-'),
        escapeCell(o.color || '-'),
        qty,
        price,
        totalPrice,
        escapeCell(o.notes || '-'),
        escapeCell(o.adminNotes || '-')
      ].join(','));
    });

    lines.push('');
    lines.push([
      `"TOTAL KESELURUHAN"`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`, `""`,
      `"${totalQtySum} pcs"`, `""`, `"${totalPriceSum}"`, `""`, `""`
    ].join(','));

    downloadCsvHorizontal(`Rinjani_Pesanan_Produk_${dateInfo.slug}.csv`, lines);
    return;
  }

  // DEFAULT: EXCEL (.XLS)
  let rowsHtml = '';
  safeOrders.forEach((o, idx) => {
    const oDate = o.createdAt ? getFormattedDateInfo(o.createdAt) : null;
    const qty = Number(o.quantity) || 0;
    const price = Number(o.price) || 0;
    const totalPrice = Number(o.totalPrice) || (qty * price) || 0;
    totalQtySum += qty;
    totalPriceSum += totalPrice;

    rowsHtml += `<tr>
      <td class="text-center">${idx + 1}</td>
      <td style="font-family: monospace; font-weight: bold;">${o.orderNumber}</td>
      <td class="text-center">${oDate ? oDate.numericDate : '-'}</td>
      <td class="text-center">${oDate ? oDate.timeShort : '-'}</td>
      <td class="text-center" style="font-weight: bold;">${o.status}</td>
      <td><strong>${o.customerName}</strong></td>
      <td class="phone-cell">${o.customerPhone || '-'}</td>
      <td>${o.customerEmail || '-'}</td>
      <td><strong>${o.productName}</strong></td>
      <td class="text-center">${o.size || '-'}</td>
      <td>${o.color || '-'}</td>
      <td class="text-center" style="font-weight: bold;">${qty}</td>
      <td class="text-right">Rp ${price.toLocaleString('id-ID')}</td>
      <td class="text-right" style="font-weight: bold; color: #047857;">Rp ${totalPrice.toLocaleString('id-ID')}</td>
      <td>${o.notes || '-'}</td>
      <td>${o.adminNotes || '-'}</td>
    </tr>`;
  });

  const tableHtml = `
  <table border="1">
    <tr>
      <td colspan="16" class="title-banner">
        RINJANI CLOTHING - LAPORAN TRANSAKSI PESANAN PRODUK (KATALOG SHOP)
      </td>
    </tr>
    <!-- BARIS 2: TANGGAL-BULAN-TAHUN MENYAMPING KE KANAN -->
    <tr style="height: 36px;">
      <td colspan="2" class="meta-cell"><b>TANGGAL:</b> <span style="color: #2563eb; font-weight: bold;">${dateInfo.numericDate}</span></td>
      <td colspan="2" class="meta-cell"><b>HARI:</b> <span>${dateInfo.dayName}</span></td>
      <td colspan="3" class="meta-cell"><b>BULAN:</b> <span>${dateInfo.monthName}</span></td>
      <td colspan="2" class="meta-cell"><b>TAHUN:</b> <span>${dateInfo.year}</span></td>
      <td colspan="3" class="meta-cell"><b>WAKTU:</b> <span>${dateInfo.timeShort}</span></td>
      <td colspan="4" class="meta-cell"><b>TOTAL OMZET:</b> <span style="color: #059669; font-weight: bold;">Rp ${totalPriceSum.toLocaleString('id-ID')} (${totalQtySum} pcs)</span></td>
    </tr>
    <tr><td colspan="16" style="border: none; height: 12px; background: transparent;"></td></tr>
    <tr>
      <th style="width: 35px; text-align: center;">No</th>
      <th style="width: 125px;">No. Pesanan</th>
      <th style="width: 95px; text-align: center;">Tanggal</th>
      <th style="width: 75px; text-align: center;">Jam</th>
      <th style="width: 90px; text-align: center;">Status</th>
      <th style="width: 150px;">Nama Pembeli</th>
      <th style="width: 120px;">WhatsApp</th>
      <th style="width: 150px;">Email</th>
      <th style="width: 160px;">Nama Produk</th>
      <th style="width: 70px; text-align: center;">Ukuran</th>
      <th style="width: 90px;">Warna</th>
      <th style="width: 75px; text-align: center;">Qty (pcs)</th>
      <th style="width: 110px; text-align: right;">Harga (Rp)</th>
      <th style="width: 125px; text-align: right;">Total (Rp)</th>
      <th style="width: 170px;">Catatan Pembeli</th>
      <th style="width: 140px;">Catatan Admin</th>
    </tr>
    ${rowsHtml || `<tr><td colspan="16" class="text-center" style="padding: 16px;">Tidak ada data pesanan produk</td></tr>`}
    <tr class="summary-row">
      <td colspan="11" style="text-align: right; padding-right: 16px;">TOTAL KESELURUHAN:</td>
      <td class="text-center" style="font-size: 12pt; color: #059669;">${totalQtySum} pcs</td>
      <td></td>
      <td class="text-right" style="font-size: 12pt; color: #047857;">Rp ${totalPriceSum.toLocaleString('id-ID')}</td>
      <td colspan="2"></td>
    </tr>
  </table>
  `;

  downloadExcelHtml(`Rinjani_Pesanan_Produk_${dateInfo.slug}.xls`, tableHtml);
}

/**
 * Backward compatibility untuk fungsi downloadCsv dasar
 */
export function downloadCsv(filename, headers, rows) {
  const dateInfo = getFormattedDateInfo();
  const lines = [];
  lines.push(`"DATA EKSPOR - RINJANI CLOTHING"`);
  lines.push([
    `"TANGGAL CETAK"`, `"${dateInfo.numericDate}"`,
    `"WAKTU"`, `"${dateInfo.timeShort}"`,
    `"TOTAL BARIS"`, `"${rows.length} Baris"`
  ].join(','));
  lines.push('');
  lines.push(headers.map(escapeCell).join(','));
  rows.forEach((r) => lines.push(r.map(escapeCell).join(',')));
  downloadCsvHorizontal(filename, lines);
}

/**
 * Google Apps Script snippet for Custom Orders
 */
export const GOOGLE_APPS_SCRIPT_CUSTOM_ORDERS = `// Google Apps Script untuk Pesanan Custom Rinjani Clothing
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var orders = Array.isArray(data) ? data : (data.orders || [data]);

    // Tambahkan header jika sheet masih kosong
    if (sheet.getLastRowNum() === 0) {
      sheet.appendRow(["LAPORAN DATA PESANAN CUSTOM - RINJANI CLOTHING"]);
      sheet.appendRow(["Tanggal Sinkronisasi", new Date().toLocaleString("id-ID")]);
      sheet.appendRow([]);
      sheet.appendRow([
        "No. Pesanan", "Tanggal", "Jam", "Status", 
        "Nama Customer", "WhatsApp", "Email", 
        "Model", "Warna", "Kain", "Gramasi", "Cetak", 
        "Ukuran", "Total Qty", "Catatan Customer", "Catatan Admin"
      ]);
    }

    // Tulis baris pesanan
    orders.forEach(function(o) {
      var d = o.createdAt ? new Date(o.createdAt) : new Date();
      var dateFormatted = Utilities.formatDate(d, "Asia/Jakarta", "dd-MM-yyyy");
      var timeFormatted = Utilities.formatDate(d, "Asia/Jakarta", "HH:mm");

      sheet.appendRow([
        o.orderNumber,
        dateFormatted,
        timeFormatted,
        o.status,
        o.customerName,
        "'" + o.customerPhone,
        o.customerEmail || "",
        o.garmentModel,
        o.color,
        o.fabric,
        o.fabricWeight || "",
        o.printingMethod,
        typeof o.sizes === "string" ? o.sizes : JSON.stringify(o.sizes || {}),
        o.totalQuantity,
        o.notes || "",
        o.adminNotes || ""
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: orders.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

/**
 * Google Apps Script snippet for Product Orders
 */
export const GOOGLE_APPS_SCRIPT_PRODUCT_ORDERS = `// Google Apps Script untuk Pesanan Produk Rinjani Clothing
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var orders = Array.isArray(data) ? data : (data.orders || [data]);

    // Tambahkan header jika sheet masih kosong
    if (sheet.getLastRowNum() === 0) {
      sheet.appendRow(["LAPORAN TRANSAKSI PESANAN PRODUK - RINJANI CLOTHING"]);
      sheet.appendRow(["Tanggal Sinkronisasi", new Date().toLocaleString("id-ID")]);
      sheet.appendRow([]);
      sheet.appendRow([
        "No. Pesanan", "Tanggal", "Jam", "Status", 
        "Nama Customer", "WhatsApp", "Email", 
        "Nama Produk", "Ukuran", "Warna", 
        "Jumlah (pcs)", "Harga Satuan (Rp)", "Total Harga (Rp)", 
        "Catatan Customer", "Catatan Admin"
      ]);
    }

    // Tulis baris pesanan
    orders.forEach(function(o) {
      var d = o.createdAt ? new Date(o.createdAt) : new Date();
      var dateFormatted = Utilities.formatDate(d, "Asia/Jakarta", "dd-MM-yyyy");
      var timeFormatted = Utilities.formatDate(d, "Asia/Jakarta", "HH:mm");

      sheet.appendRow([
        o.orderNumber,
        dateFormatted,
        timeFormatted,
        o.status,
        o.customerName,
        "'" + o.customerPhone,
        o.customerEmail || "",
        o.productName,
        o.size || "-",
        o.color || "-",
        o.quantity,
        o.price || 0,
        o.totalPrice || 0,
        o.notes || "",
        o.adminNotes || ""
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: orders.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;


