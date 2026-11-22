import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Tidak ada file bukti pembayaran yang dikirim.' }, { status: 400 });
    }

    // Maksimal 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar. Maksimal 15MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dapatkan ekstensi file
    let ext = path.extname(file.name || '').toLowerCase();
    if (!ext) {
      if (file.type === 'image/png') ext = '.png';
      else if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/gif') ext = '.gif';
      else if (file.type === 'application/pdf') ext = '.pdf';
      else ext = '.jpg';
    }

    const cleanBaseName = path.basename(file.name || 'bukti_transfer', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueFileName = `receipt_${Date.now()}_${cleanBaseName}${ext}`;

    // Buat dataUrl untuk preview cepat dan cadangan
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    let uploadedUrl = '';

    // 1. Coba upload ke Supabase Storage jika terkonfigurasi
    if (isSupabaseConfigured()) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(uniqueFileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(uniqueFileName);
          if (publicUrlData?.publicUrl) {
            uploadedUrl = publicUrlData.publicUrl;
          }
        }
      } catch (sbErr) {
        console.warn('Supabase Storage upload payment-proofs skipped/failed:', sbErr.message);
      }
    }

    // 2. Simpan ke local public uploads jika belum tersimpan di Supabase
    if (!uploadedUrl) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, uniqueFileName);
      fs.writeFileSync(localFilePath, buffer);
      uploadedUrl = `/uploads/payment-proofs/${uniqueFileName}`;
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: mimeType,
      dataUrl,
    });
  } catch (error) {
    console.error('POST /api/upload-payment-proof error:', error);
    return NextResponse.json({ error: 'Gagal mengunggah file bukti pembayaran: ' + error.message }, { status: 500 });
  }
}
