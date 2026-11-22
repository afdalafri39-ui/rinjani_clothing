import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as mockStore from '@/data/mockOrdersStore';

// GET: Get single product order by ID
export async function GET(request, { params }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    const order = mockStore.getProductOrderById(id);
    if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ order });
  }

  try {
    const { data: order, error } = await supabase
      .from('ProductOrder')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('GET /api/product-orders/[id] Supabase error:', error.message);
      const mockOrder = mockStore.getProductOrderById(id);
      if (mockOrder) return NextResponse.json({ order: mockOrder });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!order) {
      const mockOrder = mockStore.getProductOrderById(id);
      if (mockOrder) return NextResponse.json({ order: mockOrder });
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.warn('GET /api/product-orders/[id] error, falling back to mockStore:', error.message);
    const mockOrder = mockStore.getProductOrderById(id);
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
    const updated = mockStore.updateProductOrder(id, updateData);
    if (!updated) return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ order: updated });
  }

  try {
    let { data: order, error } = await supabase
      .from('ProductOrder')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // Fallback jika kolom paymentHistory belum ada di tabel ProductOrder di Supabase
    if (
      error &&
      (error.code === '42703' ||
        error.message?.includes('paymentHistory') ||
        error.code === 'PGRST204')
    ) {
      const historyStr =
        typeof paymentHistory === 'string'
          ? paymentHistory
          : JSON.stringify(paymentHistory || []);
      const dbUpdate = { ...updateData };
      delete dbUpdate.paymentHistory;

      let baseNotes = adminNotes !== undefined ? adminNotes : '';
      if (adminNotes === undefined) {
        const { data: current } = await supabase
          .from('ProductOrder')
          .select('adminNotes')
          .eq('id', id)
          .maybeSingle();
        baseNotes = current?.adminNotes || '';
      }

      const cleanNotes = baseNotes.replace(/<!--PAYMENT_HISTORY_JSON:[\s\S]*?-->/g, '').trim();
      dbUpdate.adminNotes = `${cleanNotes}\n<!--PAYMENT_HISTORY_JSON:${historyStr}-->`.trim();

      const retryRes = await supabase
        .from('ProductOrder')
        .update(dbUpdate)
        .eq('id', id)
        .select()
        .single();

      if (retryRes.error) {
        console.warn('Fallback PATCH ProductOrder error, updating mockStore:', retryRes.error.message);
        const updated = mockStore.updateProductOrder(id, updateData);
        if (updated) return NextResponse.json({ order: updated });
        return NextResponse.json({ error: retryRes.error.message }, { status: 500 });
      }
      order = retryRes.data;
    } else if (error) {
      console.warn('PATCH /api/product-orders/[id] Supabase error, updating mockStore:', error.message);
      const updated = mockStore.updateProductOrder(id, updateData);
      if (updated) return NextResponse.json({ order: updated });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.warn('PATCH /api/product-orders/[id] error, updating mockStore:', error.message);
    const updated = mockStore.updateProductOrder(id, updateData);
    if (updated) return NextResponse.json({ order: updated });
    return NextResponse.json({ error: 'Gagal memperbarui pesanan.' }, { status: 500 });
  }
}

// DELETE: Delete a product order
export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    mockStore.deleteProductOrder(id);
    return NextResponse.json({ success: true });
  }

  try {
    const { error } = await supabase
      .from('ProductOrder')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('DELETE /api/product-orders/[id] Supabase error, deleting from mockStore:', error.message);
    }
    mockStore.deleteProductOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn('DELETE /api/product-orders/[id] error, deleting from mockStore:', error.message);
    mockStore.deleteProductOrder(id);
    return NextResponse.json({ success: true });
  }
}
