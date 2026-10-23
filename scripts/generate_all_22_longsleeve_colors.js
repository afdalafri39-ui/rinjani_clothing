const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
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
  { id: 'salmon', name: 'Salmon', hex: '#E77C68' },
  { id: 'hitam', name: 'Hitam', hex: '#111111' },
  { id: 'putih', name: 'Putih', hex: '#FFFFFF' },
  { id: 'navy', name: 'Navy Blue', hex: '#1B2A4A' },
  { id: 'abu-muda', name: 'Misty / Abu Muda', hex: '#C2C5C8' },
  { id: 'abu-tua', name: 'Abu-abu Tua', hex: '#4A4A4A' },
  { id: 'maroon', name: 'Maroon', hex: '#6B1C23' },
  { id: 'merah', name: 'Merah Cabe', hex: '#C41E3A' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#2855AE' },
  { id: 'baby-blue', name: 'Baby Blue', hex: '#89CFF0' },
  { id: 'hijau-botol', name: 'Hijau Botol', hex: '#006A4E' },
  { id: 'hijau-army', name: 'Hijau Army', hex: '#4B5320' },
  { id: 'sage-green', name: 'Sage Green', hex: '#9CAF88' },
  { id: 'kuning', name: 'Kuning Kenari', hex: '#FFD700' },
  { id: 'mustard', name: 'Mustard', hex: '#C9932E' },
  { id: 'orange', name: 'Orange', hex: '#E86F2C' },
  { id: 'terracotta', name: 'Terracotta', hex: '#D26042' },
  { id: 'pink', name: 'Dusty Pink', hex: '#E8879C' },
  { id: 'ungu', name: 'Ungu Tua', hex: '#5D3A8E' },
  { id: 'lilac', name: 'Lilac', hex: '#C8A2C8' },
  { id: 'cream', name: 'Cream / Krem', hex: '#F5E6CA' },
  { id: 'coklat', name: 'Coklat Kopi', hex: '#6B4226' },
];

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ];
}

async function generateAllLongSleeveColors() {
  const masterPath = 'C:\\Users\\ADVAN\\.gemini\\antigravity-ide\\brain\\c0a86aac-fcf6-4971-85a2-2a9bfc4922ba\\longsleeve_white_master_1792788012227.jpg';
  const maskPath = 'C:\\Users\\ADVAN\\.gemini\\antigravity-ide\\brain\\c0a86aac-fcf6-4971-85a2-2a9bfc4922ba\\longsleeve_mask_1792788106102.jpg';

  const outDir = path.join(__dirname, '..', 'public', 'products', 'long-sleeve');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Loading Long Sleeve master image and segmentation mask...');
  const w = 1024, h = 1024;
  const masterRaw = await sharp(masterPath).resize(w, h).raw().toBuffer();
  const maskRaw = await sharp(maskPath).resize(w, h).greyscale().blur(1.0).raw().toBuffer();

  const generatedUrls = {};
  const localItems = [];

  for (const col of COLORS) {
    console.log(`Generating Long Sleeve [${col.name}] (${col.hex})...`);
    const [tr, tg, tb] = hexToRgb(col.hex);
    const isPureWhite = col.hex.toUpperCase() === '#FFFFFF';
    const isBlack = col.id === 'hitam';
    const isVeryDark = (tr + tg + tb) < 70;
    const isMisty = col.id === 'abu-muda';

    const outData = Buffer.from(masterRaw);

    for (let i = 0; i < w * h; i++) {
      const alpha = maskRaw[i] / 255.0;
      if (alpha <= 0.01) continue;

      const origR = masterRaw[i * 3];
      const origG = masterRaw[i * 3 + 1];
      const origB = masterRaw[i * 3 + 2];
      const origLum = 0.299 * origR + 0.587 * origG + 0.114 * origB;
      const normLum = origLum / 232.0;

      let r, g, b;

      if (isPureWhite) {
        // Pure White: preserve original crisp studio white and subtle shadows
        r = origR;
        g = origG;
        b = origB;
      } else if (isBlack) {
        // Jet Black with studio softbox reflection and fabric fold preservation
        const darkBase = 18;
        const foldShading = darkBase + (normLum * 34);
        const specular = Math.max(0, (normLum - 1.0) * 100);
        r = foldShading + specular + tr * 0.1;
        g = foldShading + specular + tg * 0.1;
        b = foldShading + specular + tb * 0.15;
      } else if (isVeryDark) {
        // Abu tua, deep navy, etc.
        const darkBase = 22;
        const foldShading = darkBase + (normLum * 42);
        const specular = Math.max(0, (normLum - 1.0) * 115);
        r = foldShading + specular + tr * 0.18;
        g = foldShading + specular + tg * 0.18;
        b = foldShading + specular + tb * 0.28;
      } else if (isMisty) {
        // Misty Heather / Abu Muda
        const heather = (normLum * 0.95) * 215;
        r = heather;
        g = heather;
        b = heather + 3;
      } else {
        // Colors: Rich cotton combed dye
        const shade = Math.min(1.22, normLum);
        let cr = tr * shade;
        let cg = tg * shade;
        let cb = tb * shade;

        // Subtle specular highlight on folds
        if (normLum > 1.0) {
          const sheen = Math.min(1.0, (normLum - 1.0) * 1.3);
          cr = cr * (1 - sheen * 0.35) + 245 * (sheen * 0.35);
          cg = cg * (1 - sheen * 0.35) + 245 * (sheen * 0.35);
          cb = cb * (1 - sheen * 0.35) + 245 * (sheen * 0.35);
        }

        r = cr;
        g = cg;
        b = cb;
      }

      // Feathered anti-aliasing blend
      outData[i * 3] = Math.max(0, Math.min(255, Math.round(origR * (1 - alpha) + r * alpha)));
      outData[i * 3 + 1] = Math.max(0, Math.min(255, Math.round(origG * (1 - alpha) + g * alpha)));
      outData[i * 3 + 2] = Math.max(0, Math.min(255, Math.round(origB * (1 - alpha) + b * alpha)));
    }

    const jpgName = `long-sleeve-${col.id}.jpg`;
    const webpName = `long-sleeve-${col.id}.webp`;
    const localJpgPath = path.join(outDir, jpgName);
    const localWebpPath = path.join(outDir, webpName);

    // Save JPG
    await sharp(outData, { raw: { width: w, height: h, channels: 3 } })
      .jpeg({ quality: 93, chromaSubsampling: '4:4:4' })
      .toFile(localJpgPath);

    // Save WebP
    await sharp(outData, { raw: { width: w, height: h, channels: 3 } })
      .webp({ quality: 88, effort: 6 })
      .toFile(localWebpPath);

    generatedUrls[col.id] = `/products/long-sleeve/${webpName}`;
    localItems.push({
      id: col.id,
      jpgName,
      webpName,
      localJpgPath,
      localWebpPath
    });
  }

  console.log(`\nAll 22 Long Sleeve colors generated in public/products/long-sleeve/!`);

  // Upload to Supabase Storage bucket 'site-assets'
  console.log(`\nUploading 22 Long Sleeve color assets to Supabase Storage bucket "site-assets"...`);
  const storageUrls = {};

  for (const item of localItems) {
    const webpBuffer = fs.readFileSync(item.localWebpPath);
    const destPath = `long-sleeve/${item.webpName}`;

    const { error: uploadErr } = await supabase.storage
      .from('site-assets')
      .upload(destPath, webpBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadErr) {
      console.warn(`Failed to upload ${destPath} to Supabase:`, uploadErr.message);
      storageUrls[item.id] = generatedUrls[item.id];
    } else {
      const { data: pubUrlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(destPath);
      storageUrls[item.id] = pubUrlData.publicUrl;
      console.log(`Uploaded to Supabase: ${item.id} -> ${pubUrlData.publicUrl}`);
    }
  }

  // Update tshirt_colors.json locally
  const colorMapFile = path.join(__dirname, '..', 'src', 'data', 'tshirt_colors.json');
  const existingConfig = JSON.parse(fs.readFileSync(colorMapFile, 'utf-8'));
  existingConfig.longSleeveUrls = generatedUrls;
  existingConfig.longSleeveStorageUrls = storageUrls;
  fs.writeFileSync(colorMapFile, JSON.stringify(existingConfig, null, 2), 'utf-8');
  console.log(`Saved long sleeve color assets map to src/data/tshirt_colors.json!`);

  // Update CustomGarment in Supabase
  console.log(`\nUpdating CustomGarment "Long Sleeve" in Supabase database...`);
  const primaryImages = [
    storageUrls['hitam'] || generatedUrls['hitam'],
    storageUrls['putih'] || generatedUrls['putih'],
    storageUrls['navy'] || generatedUrls['navy'],
    storageUrls['sage-green'] || generatedUrls['sage-green'],
    storageUrls['maroon'] || generatedUrls['maroon'],
    storageUrls['mustard'] || generatedUrls['mustard'],
    storageUrls['abu-muda'] || generatedUrls['abu-muda'],
  ];

  const { error: dbErr } = await supabase
    .from('CustomGarment')
    .update({
      images: JSON.stringify(primaryImages),
      updatedAt: new Date().toISOString(),
    })
    .or('slug.eq.long-sleeve,id.eq.cmv6jodvg0003sxrgxuovos55');

  if (dbErr) {
    console.error('Error updating CustomGarment in database:', dbErr);
  } else {
    console.log('Successfully updated CustomGarment "Long Sleeve" in Supabase DB with new 22-color assets!');
  }

  // Update Product "Trail Long Sleeve" in Supabase with new images
  console.log(`\nUpdating Product "Trail Long Sleeve" in Supabase database...`);
  const { data: trailProd } = await supabase.from('Product').select('id').eq('slug', 'trail-long-sleeve').single();
  if (trailProd) {
    // Delete old images if any and insert new product images
    await supabase.from('ProductImage').delete().eq('productId', trailProd.id);
    const prodImagesToInsert = [
      { productId: trailProd.id, url: storageUrls['hitam'] || generatedUrls['hitam'], alt: 'Trail Long Sleeve - Hitam', sortOrder: 0 },
      { productId: trailProd.id, url: storageUrls['putih'] || generatedUrls['putih'], alt: 'Trail Long Sleeve - Putih', sortOrder: 1 },
      { productId: trailProd.id, url: storageUrls['sage-green'] || generatedUrls['sage-green'], alt: 'Trail Long Sleeve - Sage Green', sortOrder: 2 },
      { productId: trailProd.id, url: storageUrls['navy'] || generatedUrls['navy'], alt: 'Trail Long Sleeve - Navy Blue', sortOrder: 3 },
      { productId: trailProd.id, url: storageUrls['maroon'] || generatedUrls['maroon'], alt: 'Trail Long Sleeve - Maroon', sortOrder: 4 },
      { productId: trailProd.id, url: storageUrls['coklat'] || generatedUrls['coklat'], alt: 'Trail Long Sleeve - Coklat', sortOrder: 5 },
    ];
    await supabase.from('ProductImage').insert(prodImagesToInsert);
    console.log('Successfully added high-res images to Trail Long Sleeve Product!');
  }

  console.log('\n--- ALL LONG SLEEVE 22 COLORS COMPLETED SUCCESSFULLY ---');
}

generateAllLongSleeveColors().catch(console.error);
