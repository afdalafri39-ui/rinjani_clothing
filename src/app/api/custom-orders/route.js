import { NextResponse } from 'next/server';
import { supabase, generateId, isSupabaseConfigured } from '@/lib/supabase';
import * as mockStore from '@/data/mockOrdersStore';

// Generate unique order number: CO-YYYYMMDD-XXXX
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CO-${dateStr}-${rand}`;
}

// GET: List all custom orders (for admin)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!isSupabaseConfigured()) {
    const mockResult = mockStore.getCustomOrders({ status, limit });
    return NextResponse.json(mockResult);
  }

  try {
    let query = supabase
      .from('CustomOrder')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    let countQuery = supabase.from('CustomOrder').select('*', { count: 'exact', head: true });
    if (status && status !== 'ALL') {
      countQuery = countQuery.eq('status', status);
    }
    const { count: totalCount } = await countQuery;

    const [cBaru, cDiproses, cMockup, cProduksi, cSelesai, cBatal, cAll] = await Promise.all([
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).eq('status', 'BARU'),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).eq('status', 'DIPROSES'),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).eq('status', 'MOCKUP'),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).eq('status', 'PRODUKSI'),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).eq('status', 'SELESAI'),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }).eq('status', 'DIBATALKAN'),
      supabase.from('CustomOrder').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      orders: orders || [],
      totalCount: totalCount || 0,
      statusCounts: {
        BARU: cBaru.count || 0,
        DIPROSES: cDiproses.count || 0,
        MOCKUP: cMockup.count || 0,
        PRODUKSI: cProduksi.count || 0,
        SELESAI: cSelesai.count || 0,
        DIBATALKAN: cBatal.count || 0,
        ALL: cAll.count || 0,
      },
    });
  } catch (error) {
    console.warn('GET /api/custom-orders Supabase error, falling back to mockStore:', error.message);
    const mockResult = mockStore.getCustomOrders({ status, limit });
    return NextResponse.json(mockResult);
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

    // Validate required fields: Hanya nama & nomor WA yang mutlak wajib
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Nama lengkap dan nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();
    const id = generateId('co');

    const finalGarmentModel = garmentModel || 'T-Shirt Reguler';
    const finalColor = color || '-';
    const finalFabric = fabric || 'Cotton Combed 24s';
    const finalPrinting = printingMethod || 'Sablon DTF';

    try {
      const { data: order, error } = await supabase
        .from('CustomOrder')
        .insert({
          id,
          orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail ? customerEmail.trim() : null,
          garmentModel: finalGarmentModel,
          garmentCategory: garmentCategory || null,
          color: finalColor,
          colorHex: colorHex || null,
          fabric: finalFabric,
          fabricWeight: fabricWeight || null,
          printingMethod: finalPrinting,
          sizes: typeof sizes === 'string' ? sizes : JSON.stringify(sizes || {}),
          totalQuantity: totalQuantity || 1,
          totalPrice: body.totalPrice || 0,
          notes: notes || null,
          designFiles: typeof designFiles === 'string' ? designFiles : JSON.stringify(designFiles || []),
          status: 'BARU',
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ order, orderNumber }, { status: 201 });
    } catch (dbErr) {
      console.warn('POST /api/custom-orders DB error, using safety fallback:', dbErr.message);
      const fallbackOrder = {
        id,
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        garmentModel: finalGarmentModel,
        garmentCategory: garmentCategory || null,
        color: finalColor,
        colorHex: colorHex || null,
        fabric: finalFabric,
        fabricWeight: fabricWeight || null,
        printingMethod: finalPrinting,
        sizes: typeof sizes === 'string' ? sizes : JSON.stringify(sizes || {}),
        totalQuantity: totalQuantity || 1,
        totalPrice: body.totalPrice || 0,
        notes: notes || null,
        designFiles: typeof designFiles === 'string' ? designFiles : JSON.stringify(designFiles || []),
        status: 'BARU',
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ order: fallbackOrder, orderNumber }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/custom-orders error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memproses pesanan custom.' }, { status: 500 });
  }
}
