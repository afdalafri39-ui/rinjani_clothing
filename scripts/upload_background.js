const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('--- 1. Check / Create Storage Bucket: site-assets ---');
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('Error listing buckets:', listErr);
  }

  const existing = (buckets || []).find(b => b.name === 'site-assets');
  if (!existing) {
    console.log('Creating public bucket "site-assets"...');
    const { data: newBucket, error: createErr } = await supabase.storage.createBucket('site-assets', {
      public: true,
      fileSizeLimit: 20971520, // 20MB
    });
    if (createErr) {
      console.error('Error creating bucket:', createErr);
    } else {
      console.log('Bucket "site-assets" created successfully:', newBucket);
    }
  } else {
    console.log('Bucket "site-assets" already exists.');
  }

  console.log('\n--- 2. Uploading Assets to Supabase Storage ---');
  const filesToUpload = [
    { local: 'public/Background.png', dest: 'background.png', type: 'image/png' },
    { local: 'public/logo-brand.png', dest: 'logo-brand.png', type: 'image/png' },
    { local: 'public/logo-brand.jpg', dest: 'logo-brand.jpg', type: 'image/jpeg' },
    { local: 'public/logo-rc.svg', dest: 'logo-rc.svg', type: 'image/svg+xml' },
    { local: 'Img/database_flowchart.png', dest: 'database_flowchart.png', type: 'image/png' },
  ];

  for (const item of filesToUpload) {
    const fullPath = path.join(__dirname, '..', item.local);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(item.dest, fileBuffer, {
        contentType: item.type,
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${item.dest}:`, error.message);
    } else {
      const { data: pub } = supabase.storage.from('site-assets').getPublicUrl(item.dest);
      console.log(`✓ Uploaded ${item.dest} (${(fileBuffer.length / 1024).toFixed(1)} KB) -> ${pub.publicUrl}`);
    }
  }
}

run().catch(console.error);
