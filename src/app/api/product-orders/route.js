import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate unique order number: PO-YYYYMMDD-XXXX
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PO-${dateStr}-${rand}`;
}

// GET: List product orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const orders = await prisma.productOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const totalCount = await prisma.productOrder.count({ where });
    const statusCounts = await prisma.$transaction([
      prisma.productOrder.count({ where: { status: 'BARU' } }),
      prisma.productOrder.count({ where: { status: 'DIPROSES' } }),
      prisma.productOrder.count({ where: { status: 'DIKIRIM' } }),
      prisma.productOrder.count({ where: { status: 'SELESAI' } }),
      prisma.productOrder.count({ where: { status: 'DIBATALKAN' } }),
      prisma.productOrder.count(),
    ]);

    return NextResponse.json({
      orders,
      totalCount,
      statusCounts: {
        BARU: statusCounts[0],
        DIPROSES: statusCounts[1],
        DIKIRIM: statusCounts[2],
        SELESAI: statusCounts[3],
        DIBATALKAN: statusCounts[4],
        ALL: statusCounts[5],
      },
    });
  } catch (error) {
    console.error('GET /api/product-orders error:', error);
    return NextResponse.json({ error: 'Gagal memuat data pesanan produk.' }, { status: 500 });
  }
}

// POST: Create a new product order (from shop customer)
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      productName,
      productSlug,
      price,
      quantity,
      size,
      color,
      totalPrice,
      notes,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !productName) {
      return NextResponse.json(
        { error: 'Data pesanan tidak lengkap. Pastikan nama, no. WhatsApp, dan nama produk diisi.' },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const parsedPrice = typeof price === 'number' ? price : parseFloat(String(price || '0').replace(/[^0-9.]/g, '')) || 0;
    const parsedQty = parseInt(quantity || 1, 10) || 1;
    const computedTotal = totalPrice !== undefined && totalPrice !== null
      ? (typeof totalPrice === 'number' ? totalPrice : parseFloat(String(totalPrice).replace(/[^0-9.]/g, '')) || 0)
      : parsedPrice * parsedQty;

    const order = await prisma.productOrder.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        productName: productName.trim(),
        productSlug: productSlug || null,
        price: parsedPrice,
        quantity: parsedQty,
        size: size || null,
        color: color || null,
        totalPrice: computedTotal,
        notes: notes ? notes.trim() : null,
        status: 'BARU',
      },
    });

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (error) {
    console.error('POST /api/product-orders error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesanan produk.' }, { status: 500 });
  }
}
