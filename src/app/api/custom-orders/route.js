import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate unique order number: CO-YYYYMMDD-XXXX
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CO-${dateStr}-${rand}`;
}

// GET: List all custom orders (for admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const orders = await prisma.customOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const totalCount = await prisma.customOrder.count({ where });
    const statusCounts = await prisma.$transaction([
      prisma.customOrder.count({ where: { status: 'BARU' } }),
      prisma.customOrder.count({ where: { status: 'DIPROSES' } }),
      prisma.customOrder.count({ where: { status: 'MOCKUP' } }),
      prisma.customOrder.count({ where: { status: 'PRODUKSI' } }),
      prisma.customOrder.count({ where: { status: 'SELESAI' } }),
      prisma.customOrder.count({ where: { status: 'DIBATALKAN' } }),
      prisma.customOrder.count(),
    ]);

    return NextResponse.json({
      orders,
      totalCount,
      statusCounts: {
        BARU: statusCounts[0],
        DIPROSES: statusCounts[1],
        MOCKUP: statusCounts[2],
        PRODUKSI: statusCounts[3],
        SELESAI: statusCounts[4],
        DIBATALKAN: statusCounts[5],
        ALL: statusCounts[6],
      },
    });
  } catch (error) {
    console.error('GET /api/custom-orders error:', error);
    return NextResponse.json({ error: 'Gagal memuat data pesanan.' }, { status: 500 });
  }
}

// POST: Create a new custom order (from user)
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      garmentModel,
      garmentCategory,
      color,
      colorHex,
      fabric,
      fabricWeight,
      printingMethod,
      sizes,
      totalQuantity,
      notes,
      designFiles,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !garmentModel || !color || !fabric || !printingMethod) {
      return NextResponse.json(
        { error: 'Data pesanan tidak lengkap. Pastikan semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.customOrder.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        garmentModel,
        garmentCategory: garmentCategory || null,
        color,
        colorHex: colorHex || null,
        fabric,
        fabricWeight: fabricWeight || null,
        printingMethod,
        sizes: typeof sizes === 'string' ? sizes : JSON.stringify(sizes || {}),
        totalQuantity: totalQuantity || 1,
        notes: notes || null,
        designFiles: typeof designFiles === 'string' ? designFiles : JSON.stringify(designFiles || []),
        status: 'BARU',
      },
    });

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (error) {
    console.error('POST /api/custom-orders error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesanan.' }, { status: 500 });
  }
}
