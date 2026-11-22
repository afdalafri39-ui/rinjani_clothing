import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'orders_cache.json');

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading orders_cache.json:', err);
  }
  return { customOrders: [], productOrders: [] };
}

function saveCache(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving orders_cache.json:', err);
  }
}

// ================= CUSTOM ORDERS =================

export function getCustomOrders({ status, limit = 50 } = {}) {
  const data = loadCache();
  let orders = [...(data.customOrders || [])];

  // Sort by createdAt desc
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const statusCounts = {
    BARU: orders.filter((o) => o.status === 'BARU').length,
    DIPROSES: orders.filter((o) => o.status === 'DIPROSES').length,
    MOCKUP: orders.filter((o) => o.status === 'MOCKUP').length,
    PRODUKSI: orders.filter((o) => o.status === 'PRODUKSI').length,
    SELESAI: orders.filter((o) => o.status === 'SELESAI').length,
    DIBATALKAN: orders.filter((o) => o.status === 'DIBATALKAN').length,
    ALL: orders.length,
  };

  if (status && status !== 'ALL') {
    orders = orders.filter((o) => o.status === status);
  }

  const totalCount = orders.length;
  if (limit) {
    orders = orders.slice(0, limit);
  }

  return {
    orders,
    totalCount,
    statusCounts,
  };
}

export function getCustomOrderById(id) {
  const data = loadCache();
  return (data.customOrders || []).find((o) => o.id === id) || null;
}

export function updateCustomOrder(id, updateData) {
  const data = loadCache();
  const index = (data.customOrders || []).findIndex((o) => o.id === id);
  if (index === -1) return null;

  const current = data.customOrders[index];
  const updated = {
    ...current,
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  data.customOrders[index] = updated;
  saveCache(data);
  return updated;
}

export function createCustomOrder(newOrder) {
  const data = loadCache();
  const order = {
    id: `co_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
    ...newOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.customOrders = [order, ...(data.customOrders || [])];
  saveCache(data);
  return order;
}

export function deleteCustomOrder(id) {
  const data = loadCache();
  const filtered = (data.customOrders || []).filter((o) => o.id !== id);
  data.customOrders = filtered;
  saveCache(data);
  return true;
}

// ================= PRODUCT ORDERS =================

export function getProductOrders({ status, limit = 50 } = {}) {
  const data = loadCache();
  let orders = [...(data.productOrders || [])];

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const statusCounts = {
    BARU: orders.filter((o) => o.status === 'BARU').length,
    DIPROSES: orders.filter((o) => o.status === 'DIPROSES').length,
    DIKIRIM: orders.filter((o) => o.status === 'DIKIRIM').length,
    SELESAI: orders.filter((o) => o.status === 'SELESAI').length,
    DIBATALKAN: orders.filter((o) => o.status === 'DIBATALKAN').length,
    ALL: orders.length,
  };

  if (status && status !== 'ALL') {
    orders = orders.filter((o) => o.status === status);
  }

  const totalCount = orders.length;
  if (limit) {
    orders = orders.slice(0, limit);
  }

  return {
    orders,
    totalCount,
    statusCounts,
  };
}

export function getProductOrderById(id) {
  const data = loadCache();
  return (data.productOrders || []).find((o) => o.id === id) || null;
}

export function updateProductOrder(id, updateData) {
  const data = loadCache();
  const index = (data.productOrders || []).findIndex((o) => o.id === id);
  if (index === -1) return null;

  const current = data.productOrders[index];
  const updated = {
    ...current,
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  data.productOrders[index] = updated;
  saveCache(data);
  return updated;
}

export function createProductOrder(newOrder) {
  const data = loadCache();
  const order = {
    id: `po_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
    ...newOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.productOrders = [order, ...(data.productOrders || [])];
  saveCache(data);
  return order;
}

export function deleteProductOrder(id) {
  const data = loadCache();
  const filtered = (data.productOrders || []).filter((o) => o.id !== id);
  data.productOrders = filtered;
  saveCache(data);
  return true;
}

// ================= DASHBOARD SUMMARY STATS =================

export function getDashboardOrderStats() {
  const data = loadCache();
  const custom = [...(data.customOrders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const product = [...(data.productOrders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    totalCustomOrders: custom.length,
    newCustomOrders: custom.filter((o) => o.status === 'BARU').length,
    inProgressOrders: custom.filter((o) => ['DIPROSES', 'MOCKUP', 'PRODUKSI'].includes(o.status)).length,
    recentCustomOrders: custom.slice(0, 5),

    totalProductOrders: product.length,
    newProductOrders: product.filter((o) => o.status === 'BARU').length,
    inProgressProductOrders: product.filter((o) => ['DIPROSES', 'DIKIRIM'].includes(o.status)).length,
    recentProductOrders: product.slice(0, 5),
  };
}
