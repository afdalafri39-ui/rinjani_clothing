import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as mockStore from '@/data/mockOrdersStore';

// GET: Get a single custom order by ID
export async function GET(request, { params }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    const order = mockStore.getCustomOrderById(id);
    if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ order });
  }

  try {
    const { data: order, error } = await supabase
      .from('CustomOrder')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!order) {
      const mockOrder = mockStore.getCustomOrderById(id);
      if (mockOrder) return NextResponse.json({ order: mockOrder });
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.warn('GET /api/custom-orders/[id] Supabase error, falling back to mockStore:', error.message);
    const mockOrder = mockStore.getCustomOrderById(id);
    if (mockOrder) return NextResponse.json({ order: mockOrder });
    return NextResponse.json({ error: 'Gagal memuat data pesanan.' }, { status: 500 });
  }
}

// PATCH: Update order status, admin notes, or payment history
export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const { status, adminNotes, paymentHistory, totalPrice } = body;

  const updateData = { updatedAt: new Date().toISOString() };
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (totalPrice !== undefined && totalPrice !== null) updateData.totalPrice = Number(totalPrice);
  if (paymentHistory !== undefined) {
    updateData.paymentHistory = typeof paymentHistory === 'string' ? paymentHistory : JSON.stringify(paymentHistory);
  }

  if (!isSupabaseConfigured()) {
    const updated = mockStore.updateCustomOrder(id, updateData);
    if (!updated) return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ order: updated });
  }

  try {
    let { data: order, error } = await supabase
      .from('CustomOrder')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // Fallback jika kolom paymentHistory atau totalPrice belum ada di Supabase PostgreSQL
    if (
      error &&
      (error.code === '42703' ||
        error.message?.includes('paymentHistory') ||
        error.message?.includes('totalPrice') ||
        error.code === 'PGRST204')
    ) {
      const historyStr =
        typeof paymentHistory === 'string'
          ? paymentHistory
          : JSON.stringify(paymentHistory || []);
      const dbUpdate = { ...updateData };
      delete dbUpdate.paymentHistory;
      delete dbUpdate.totalPrice;

      // Ambil notes yang ada jika adminNotes tidak dikirim
      let baseNotes = adminNotes !== undefined ? adminNotes : '';
      if (adminNotes === undefined) {
        const { data: current } = await supabase
          .from('CustomOrder')
          .select('adminNotes')
          .eq('id', id)
          .maybeSingle();
        baseNotes = current?.adminNotes || '';
      }

      const cleanNotes = baseNotes.replace(/<!--PAYMENT_HISTORY_JSON:[\s\S]*?-->/g, '').trim();
      dbUpdate.adminNotes = `${cleanNotes}\n<!--PAYMENT_HISTORY_JSON:${historyStr}-->`.trim();

      const retryRes = await supabase
        .from('CustomOrder')
        .update(dbUpdate)
        .eq('id', id)
        .select()
        .single();

      if (retryRes.error) throw retryRes.error;
      order = retryRes.data;
    } else if (error) {
      throw error;
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.warn('PATCH /api/custom-orders/[id] Supabase error, updating mockStore:', error.message);
    const updated = mockStore.updateCustomOrder(id, updateData);
    if (updated) return NextResponse.json({ order: updated });
    return NextResponse.json({ error: 'Gagal memperbarui pesanan.' }, { status: 500 });
  }
}

// DELETE: Delete a custom order
export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    mockStore.deleteCustomOrder(id);
    return NextResponse.json({ success: true });
  }

  try {
    const { error } = await supabase
      .from('CustomOrder')
      .delete()
      .eq('id', id);

    if (error) throw error;
    mockStore.deleteCustomOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn('DELETE /api/custom-orders/[id] Supabase error, deleting from mockStore:', error.message);
    mockStore.deleteCustomOrder(id);
    return NextResponse.json({ success: true });
  }
}
