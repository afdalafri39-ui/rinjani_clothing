import { NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';

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

    let query = supabase
      .from('ProductOrder')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    let countQuery = supabase.from('ProductOrder').select('*', { count: 'exact', head: true });
    if (status && status !== 'ALL') {
      countQuery = countQuery.eq('status', status);
    }
    const { count: totalCount } = await countQuery;

    const [cBaru, cDiproses, cDikirim, cSelesai, cBatal, cAll] = await Promise.all([
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }).eq('status', 'BARU'),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }).eq('status', 'DIPROSES'),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }).eq('status', 'DIKIRIM'),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }).eq('status', 'SELESAI'),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }).eq('status', 'DIBATALKAN'),
      supabase.from('ProductOrder').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      orders: orders || [],
      totalCount: totalCount || 0,
      statusCounts: {
        BARU: cBaru.count || 0,
        DIPROSES: cDiproses.count || 0,
        DIKIRIM: cDikirim.count || 0,
        SELESAI: cSelesai.count || 0,
        DIBATALKAN: cBatal.count || 0,
        ALL: cAll.count || 0,
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
    const id = generateId('po');

    const parsedPrice = typeof price === 'number' ? price : parseFloat(String(price || '0').replace(/[^0-9.]/g, '')) || 0;
    const parsedQty = parseInt(quantity || 1, 10) || 1;
    const computedTotal = totalPrice !== undefined && totalPrice !== null
      ? (typeof totalPrice === 'number' ? totalPrice : parseFloat(String(totalPrice).replace(/[^0-9.]/g, '')) || 0)
      : parsedPrice * parsedQty;

    const { data: order, error } = await supabase
      .from('ProductOrder')
      .insert({
        id,
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
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (error) {
    console.error('POST /api/product-orders error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesanan produk.' }, { status: 500 });
  }
}
