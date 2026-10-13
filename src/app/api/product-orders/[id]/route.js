import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Get single product order by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data: order, error } = await supabase
      .from('ProductOrder')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('GET /api/product-orders/[id] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('GET /api/product-orders/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memuat data pesanan.' }, { status: 500 });
  }
}

// PATCH: Update order status or admin notes
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, adminNotes } = body;

    const updateData = { updatedAt: new Date().toISOString() };
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const { data: order, error } = await supabase
      .from('ProductOrder')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('PATCH /api/product-orders/[id] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('PATCH /api/product-orders/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pesanan.' }, { status: 500 });
  }
}

// DELETE: Delete a product order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('ProductOrder')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DELETE /api/product-orders/[id] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/product-orders/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pesanan.' }, { status: 500 });
  }
}
