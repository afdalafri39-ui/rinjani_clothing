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

const COLORS = [
  'salmon', 'hitam', 'putih', 'navy', 'abu-muda', 'abu-tua',
  'maroon', 'merah', 'royal-blue', 'baby-blue', 'hijau-botol',
  'hijau-army', 'sage-green', 'kuning', 'mustard', 'orange',
  'terracotta', 'pink', 'ungu', 'lilac', 'cream', 'coklat'
];

async function uploadAllOversize() {
  const oversizeDir = path.join(__dirname, '..', 'public', 'products', 't-shirt-oversize');
  const storageUrls = {};
  const localUrls = {};

  console.log('Uploading 22 oversize colors to Supabase Storage "site-assets"...');

  for (const col of COLORS) {
    const filename = `tshirt-oversize-${col}.jpg`;
    const localFilePath = path.join(oversizeDir, filename);

    if (!fs.existsSync(localFilePath)) {
      console.warn(`File not found: ${localFilePath}`);
      continue;
    }

    localUrls[col] = `/products/t-shirt-oversize/${filename}`;
    const fileBuffer = fs.readFileSync(localFilePath);
    const destPath = `t-shirt-oversize/${filename}`;

    const { error: uploadErr } = await supabase.storage
      .from('site-assets')
      .upload(destPath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.warn(`Upload error for ${destPath}:`, uploadErr.message);
      storageUrls[col] = localUrls[col];
    } else {
      const { data: pubData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(destPath);
      storageUrls[col] = pubData.publicUrl;
      console.log(`Uploaded ${col} -> ${pubData.publicUrl}`);
    }
  }

  // Update tshirt_colors.json
  const colorMapFile = path.join(__dirname, '..', 'src', 'data', 'tshirt_colors.json');
  const existingConfig = JSON.parse(fs.readFileSync(colorMapFile, 'utf-8'));
  existingConfig.oversizeUrls = localUrls;
  existingConfig.oversizeStorageUrls = storageUrls;
  fs.writeFileSync(colorMapFile, JSON.stringify(existingConfig, null, 2));
  console.log('Updated src/data/tshirt_colors.json with oversizeUrls and oversizeStorageUrls!');

  // Update CustomGarment in Supabase
  const primaryOversizeImages = [
    localUrls['hitam'],
    localUrls['putih'],
    localUrls['sage-green'],
    localUrls['cream'],
    localUrls['navy'],
    localUrls['maroon'],
    localUrls['abu-muda'],
  ];

  console.log('Updating CustomGarment "T-Shirt Oversize" in Supabase DB...');
  const { error: dbErr } = await supabase
    .from('CustomGarment')
    .update({
      images: JSON.stringify(primaryOversizeImages),
      updatedAt: new Date().toISOString(),
    })
    .or('slug.eq.t-shirt-oversize,id.eq.cmv6jodvc0001sxrg3munrbjk');

  if (dbErr) {
    console.error('Error updating CustomGarment in database:', dbErr);
  } else {
    console.log('Successfully updated CustomGarment in Supabase DB!');
  }
}

uploadAllOversize();
