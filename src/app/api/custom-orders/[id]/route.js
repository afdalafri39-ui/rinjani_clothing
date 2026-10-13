import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Get a single custom order by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data: order, error } = await supabase
      .from('CustomOrder')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('GET /api/custom-orders/[id] error:', error);
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
      .from('CustomOrder')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order });
  } catch (error) {
    console.error('PATCH /api/custom-orders/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pesanan.' }, { status: 500 });
  }
}

// DELETE: Delete a custom order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('CustomOrder').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/custom-orders/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pesanan.' }, { status: 500 });
  }
}
