// Helper functions for CSV/Excel export and Google Sheets integration

/**
 * Trigger CSV download in browser with UTF-8 BOM so Excel opens it with correct accents & characters.
 */
export function downloadCsv(filename, headers, rows) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

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
 * Export Custom Orders to CSV
 */
export function exportCustomOrdersCsv(orders) {
  const headers = [
    'No. Pesanan',
    'Tanggal Pesanan',
    'Status',
    'Nama Customer',
    'No. WhatsApp',
    'Email',
    'Model Pakaian',
    'Kategori',
    'Warna',
    'Bahan Kain',
    'Gramasi/Berat',
    'Metode Cetak',
    'Rincian Ukuran',
    'Total Qty (pcs)',
    'Catatan Customer',
    'File Desain',
    'Catatan Admin',
  ];

  const rows = orders.map((o) => {
    let sizesFormatted = '';
    try {
      const parsed = typeof o.sizes === 'string' ? JSON.parse(o.sizes || '{}') : o.sizes;
      sizesFormatted = Object.entries(parsed || {})
        .filter(([, q]) => q > 0)
        .map(([s, q]) => `${s}:${q}`)
        .join(', ');
    } catch {
      sizesFormatted = String(o.sizes || '');
    }

    let filesFormatted = '';
    try {
      const parsedFiles = typeof o.designFiles === 'string' ? JSON.parse(o.designFiles || '[]') : o.designFiles;
      filesFormatted = (Array.isArray(parsedFiles) ? parsedFiles : [])
        .map((f) => (typeof f === 'string' ? f : f.name))
        .join('; ');
    } catch {
      filesFormatted = '';
    }

    const dateFormatted = o.createdAt
      ? new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      : '';

    return [
      o.orderNumber,
      dateFormatted,
      o.status,
      o.customerName,
      o.customerPhone,
      o.customerEmail || '',
      o.garmentModel,
      o.garmentCategory || '',
      o.color,
      o.fabric,
      o.fabricWeight || '',
      o.printingMethod,
      sizesFormatted,
      o.totalQuantity,
      o.notes || '',
      filesFormatted,
      o.adminNotes || '',
    ];
  });

  const dateSlug = new Date().toISOString().slice(0, 10);
  downloadCsv(`Rinjani_Pesanan_Custom_${dateSlug}.csv`, headers, rows);
}

/**
 * Export Product Orders to CSV
 */
export function exportProductOrdersCsv(orders) {
  const headers = [
    'No. Pesanan',
    'Tanggal Pesanan',
    'Status',
    'Nama Customer',
    'No. WhatsApp',
    'Email',
    'Nama Produk',
    'Ukuran',
    'Warna',
    'Jumlah (pcs)',
    'Harga Satuan (Rp)',
    'Total Harga (Rp)',
    'Catatan Customer',
    'Catatan Admin',
  ];

  const rows = orders.map((o) => {
    const dateFormatted = o.createdAt
      ? new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      : '';

    return [
      o.orderNumber,
      dateFormatted,
      o.status,
      o.customerName,
      o.customerPhone,
      o.customerEmail || '',
      o.productName,
      o.size || '-',
      o.color || '-',
      o.quantity,
      o.price || 0,
      o.totalPrice || 0,
      o.notes || '',
      o.adminNotes || '',
    ];
  });

  const dateSlug = new Date().toISOString().slice(0, 10);
  downloadCsv(`Rinjani_Pesanan_Produk_${dateSlug}.csv`, headers, rows);
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
      sheet.appendRow([
        "No. Pesanan", "Tanggal", "Status", "Nama Customer", "WhatsApp", 
        "Email", "Model", "Warna", "Kain", "Cetak", "Ukuran", "Total Qty", 
        "Catatan", "Catatan Admin"
      ]);
    }

    // Tulis baris pesanan
    orders.forEach(function(o) {
      sheet.appendRow([
        o.orderNumber,
        new Date(o.createdAt || Date.now()).toLocaleString("id-ID"),
        o.status,
        o.customerName,
        "'" + o.customerPhone,
        o.customerEmail || "",
        o.garmentModel,
        o.color,
        o.fabric,
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
      sheet.appendRow([
        "No. Pesanan", "Tanggal", "Status", "Nama Customer", "WhatsApp", 
        "Email", "Nama Produk", "Ukuran", "Warna", "Jumlah (pcs)", 
        "Harga Satuan", "Total Harga", "Catatan", "Catatan Admin"
      ]);
    }

    // Tulis baris pesanan
    orders.forEach(function(o) {
      sheet.appendRow([
        o.orderNumber,
        new Date(o.createdAt || Date.now()).toLocaleString("id-ID"),
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
