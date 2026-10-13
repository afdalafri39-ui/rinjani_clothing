import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          brandName: 'Rinjani Clothing',
          whatsappNumber: '6281369876282',
          whatsappEnabled: true,
          telegramUsername: '',
          telegramEnabled: false,
          instagramUrl: 'http://instagram.com/rinjani.clothing',
          email: 'hello@rinjaniclothing.com',
          address: 'Lombok, Nusa Tenggara Barat, Indonesia',
          orderMessageTemplate: 'Halo Rinjani Clothing,\n\nSaya ingin memesan:\n\nProduk: {{product_name}}\nUkuran: {{size}}\nWarna: {{color}}\nJumlah: {{quantity}}\n\nLink produk:\n{{product_url}}',
          currency: 'IDR',
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan toko' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const data = await request.json();

    const updateData = {};
    if (data.brandName !== undefined) updateData.brandName = data.brandName;
    if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber;
    if (data.whatsappEnabled !== undefined) updateData.whatsappEnabled = !!data.whatsappEnabled;
    if (data.telegramUsername !== undefined) updateData.telegramUsername = data.telegramUsername;
    if (data.telegramEnabled !== undefined) updateData.telegramEnabled = !!data.telegramEnabled;
    if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.orderMessageTemplate !== undefined) updateData.orderMessageTemplate = data.orderMessageTemplate;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.customOrdersSheetWebhook !== undefined) updateData.customOrdersSheetWebhook = data.customOrdersSheetWebhook;
    if (data.productOrdersSheetWebhook !== undefined) updateData.productOrdersSheetWebhook = data.productOrdersSheetWebhook;

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        brandName: data.brandName || 'Rinjani Clothing',
        whatsappNumber: data.whatsappNumber || null,
        whatsappEnabled: !!data.whatsappEnabled,
        telegramUsername: data.telegramUsername || null,
        telegramEnabled: !!data.telegramEnabled,
        instagramUrl: data.instagramUrl || null,
        email: data.email || null,
        address: data.address || null,
        orderMessageTemplate: data.orderMessageTemplate || null,
        currency: data.currency || 'IDR',
        customOrdersSheetWebhook: data.customOrdersSheetWebhook || null,
        productOrdersSheetWebhook: data.productOrdersSheetWebhook || null,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate pengaturan toko' },
      { status: 500 }
    );
  }
}
