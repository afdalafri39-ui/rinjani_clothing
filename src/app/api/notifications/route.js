import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
  try {
    const [
      { count: customNewCount, data: recentCustom },
      { count: productNewCount, data: recentProduct },
    ] = await Promise.all([
      supabase
        .from('CustomOrder')
        .select('*', { count: 'exact' })
        .eq('status', 'BARU')
        .order('createdAt', { ascending: false })
        .limit(5),
      supabase
        .from('ProductOrder')
        .select('*', { count: 'exact' })
        .eq('status', 'BARU')
        .order('createdAt', { ascending: false })
        .limit(5),
    ]);

    const formattedCustom = (recentCustom || []).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      type: 'CUSTOM',
      typeLabel: 'Custom Order',
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      itemTitle: o.garmentModel || 'Custom Apparel',
      quantity: o.totalQuantity || 1,
      createdAt: o.createdAt,
      url: '/admin/custom-orders',
    }));

    const formattedProduct = (recentProduct || []).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      type: 'PRODUCT',
      typeLabel: 'Pesanan Produk',
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      itemTitle: o.productName || 'Produk Toko',
      quantity: o.quantity || 1,
      createdAt: o.createdAt,
      url: '/admin/product-orders',
    }));

    const allRecent = [...formattedCustom, ...formattedProduct]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    const totalNewCount = (customNewCount || 0) + (productNewCount || 0);

    return NextResponse.json({
      success: true,
      totalNewCount,
      customNewCount: customNewCount || 0,
      productNewCount: productNewCount || 0,
      recentNewOrders: allRecent,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        totalNewCount: 0,
        customNewCount: 0,
        productNewCount: 0,
        recentNewOrders: [],
      },
      { status: 500 }
    );
  }
}
