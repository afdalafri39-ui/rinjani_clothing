import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get a single custom order by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await prisma.customOrder.findUnique({
      where: { id },
    });

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

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const order = await prisma.customOrder.update({
      where: { id },
      data: updateData,
    });

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
    await prisma.customOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/custom-orders/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pesanan.' }, { status: 500 });
  }
}
