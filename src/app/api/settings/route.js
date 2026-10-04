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

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        brandName: data.brandName,
        whatsappNumber: data.whatsappNumber,
        whatsappEnabled: !!data.whatsappEnabled,
        telegramUsername: data.telegramUsername,
        telegramEnabled: !!data.telegramEnabled,
        instagramUrl: data.instagramUrl,
        email: data.email,
        address: data.address,
        orderMessageTemplate: data.orderMessageTemplate,
        currency: data.currency || 'IDR',
      },
      create: {
        id: 'default',
        brandName: data.brandName || 'Rinjani Clothing',
        whatsappNumber: data.whatsappNumber,
        whatsappEnabled: !!data.whatsappEnabled,
        telegramUsername: data.telegramUsername,
        telegramEnabled: !!data.telegramEnabled,
        instagramUrl: data.instagramUrl,
        email: data.email,
        address: data.address,
        orderMessageTemplate: data.orderMessageTemplate,
        currency: data.currency || 'IDR',
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
