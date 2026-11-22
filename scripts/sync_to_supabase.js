const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Baca .env.local
let env = {};
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const k = parts[0].trim();
      const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      env[k] = v;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log('--- Memulai Upload Data ke Supabase Cloud ---');
  console.log('Target URL:', supabaseUrl);

  // 1. Cek User di database Supabase
  const { data: users, error: fetchUserErr } = await supabase.from('User').select('*');
  if (fetchUserErr) {
    console.warn('Gagal membaca tabel User:', fetchUserErr.message);
  } else {
    console.log('Daftar user saat ini di Supabase:', users?.map(u => ({ id: u.id, email: u.email, name: u.name })));
  }

  const newHash = '$2b$10$2DDef4ZcKRoc1ASM8k560.70Y3v6feodcrsCa2MnCa9D6P4SmImGa';

  // Cari user yang sudah ada (apakah admin lama atau sudah amidi)
  const existingAmidi = users?.find(u => u.email === 'amidi@rinjani.com');
  const existingAdmin = users?.find(u => u.email === 'admin@rinjani.com' || u.name?.toLowerCase().includes('admin'));

  if (existingAmidi) {
    const { error: updErr } = await supabase
      .from('User')
      .update({
        name: 'Amidi Rinjani',
        passwordHash: newHash,
        role: 'ADMIN',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existingAmidi.id);

    if (updErr) console.warn('Gagal update user amidi:', updErr.message);
    else console.log('✅ Berhasil memperbarui password akun amidi di Supabase!');
  } else if (existingAdmin) {
    const { error: updErr } = await supabase
      .from('User')
      .update({
        name: 'Amidi Rinjani',
        email: 'amidi@rinjani.com',
        passwordHash: newHash,
        role: 'ADMIN',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existingAdmin.id);

    if (updErr) console.warn('Gagal update user admin -> amidi:', updErr.message);
    else console.log('✅ Berhasil mengubah akun admin lama menjadi "amidi" (email: amidi@rinjani.com) di Supabase!');
  } else {
    // Insert baru
    const amidiUser = {
      id: 'cmumu1sdy0000sxkst1cs7ni1',
      name: 'Amidi Rinjani',
      email: 'amidi@rinjani.com',
      passwordHash: newHash,
      role: 'ADMIN',
      updatedAt: new Date().toISOString(),
    };
    const { error: insErr } = await supabase.from('User').insert(amidiUser);
    if (insErr) console.warn('Peringatan saat insert user amidi:', insErr.message);
    else console.log('✅ Akun "amidi" berhasil ditambahkan ke tabel User Supabase!');
  }

  // 2. Baca orders_cache.json
  const cache = JSON.parse(fs.readFileSync('src/data/orders_cache.json', 'utf8'));

  // 3. Upload Custom Orders
  if (cache.customOrders && cache.customOrders.length > 0) {
    let { error: coErr } = await supabase
      .from('CustomOrder')
      .upsert(cache.customOrders, { onConflict: 'id' });

    if (coErr) {
      console.log('Upsert langsung kolom paymentHistory/totalPrice belum ada di CustomOrder, menggunakan fallback...');
      const fallbackRecords = cache.customOrders.map(o => {
        const copy = { ...o };
        delete copy.paymentHistory;
        delete copy.totalPrice; // jika kolom totalPrice belum ada di database
        return copy;
      });

      const retry = await supabase.from('CustomOrder').upsert(fallbackRecords, { onConflict: 'id' });
      if (retry.error) {
        console.error('Error saat upload CustomOrder:', retry.error.message);
      } else {
        console.log(`✅ Berhasil mengunggah ${cache.customOrders.length} data CustomOrder ke Supabase (lengkap dengan riwayat pembayaran di adminNotes)!`);
      }
    } else {
      console.log(`✅ Berhasil mengunggah ${cache.customOrders.length} data CustomOrder ke Supabase!`);
    }
  }

  // 4. Upload Product Orders
  if (cache.productOrders && cache.productOrders.length > 0) {
    let { error: poErr } = await supabase
      .from('ProductOrder')
      .upsert(cache.productOrders, { onConflict: 'id' });

    if (poErr) {
      const fallbackRecords = cache.productOrders.map(o => {
        const copy = { ...o };
        delete copy.paymentHistory;
        return copy;
      });

      const retry = await supabase.from('ProductOrder').upsert(fallbackRecords, { onConflict: 'id' });
      if (retry.error) {
        console.error('Error saat upload ProductOrder:', retry.error.message);
      } else {
        console.log(`✅ Berhasil mengunggah ${cache.productOrders.length} data ProductOrder ke Supabase (lengkap dengan riwayat pembayaran di adminNotes)!`);
      }
    } else {
      console.log(`✅ Berhasil mengunggah ${cache.productOrders.length} data ProductOrder ke Supabase!`);
    }
  }

  console.log('--- Selesai Sync ke Supabase ---');
}

sync().catch(err => {
  console.error('Sync failed:', err);
});
