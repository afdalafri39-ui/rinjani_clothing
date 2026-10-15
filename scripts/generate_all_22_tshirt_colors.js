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

async function generateAllColors() {
  const masterPath = 'C:\\Users\\asus\\.gemini\\antigravity-ide\\brain\\7510c045-5ddc-4626-8507-cffc10c857e8\\tshirt_reguler_master_1792083236204.jpg';
  const maskPath = path.join(__dirname, 'clean_mask.png');

  const outDir = path.join(__dirname, '..', 'public', 'products', 't-shirt-reguler');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Loading master image and mask...`);
  const imgData = await sharp(masterPath).raw().toBuffer();
  const maskData = await sharp(maskPath).greyscale().raw().toBuffer();
  const w = 1024;
  const h = 1024;

  const generatedUrls = {};
  const localPaths = [];

  for (const col of COLORS) {
    console.log(`Generating [${col.name}] (${col.hex})...`);
    const [tr, tg, tb] = hexToRgb(col.hex);
    const isPureWhite = col.hex.toUpperCase() === '#FFFFFF';
    const isVeryDark = (tr + tg + tb) < 70;
    const isMisty = col.id === 'abu-muda';

    const outData = Buffer.from(imgData);

    for (let i = 0; i < w * h; i++) {
      const alpha = maskData[i] / 255.0;
      if (alpha <= 0.01) continue;

      const origR = imgData[i * 3];
      const origG = imgData[i * 3 + 1];
      const origB = imgData[i * 3 + 2];
      const origLum = 0.299 * origR + 0.587 * origG + 0.114 * origB;
      const normLum = origLum / 225.0;

      let r, g, b;

      if (isPureWhite) {
        // Crisp studio white
        r = origR;
        g = origG;
        b = origB;
      } else if (isVeryDark) {
        // Black / Charcoal: Preserve fold contrast & studio softbox reflection
        const darkBase = 24;
        const foldShading = darkBase + (normLum * 44);
        const specular = Math.max(0, (normLum - 1.0) * 115);
        r = foldShading + specular + tr * 0.15;
        g = foldShading + specular + tg * 0.15;
        b = foldShading + specular + tb * 0.25;
      } else if (isMisty) {
        // Misty Heather / Abu Muda
        const heather = (normLum * 0.95) * 215;
        r = heather;
        g = heather;
        b = heather + 3; // subtle misty cool
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

    const filename = `tshirt-reguler-${col.id}.jpg`;
    const localFilePath = path.join(outDir, filename);

    await sharp(outData, { raw: { width: w, height: h, channels: 3 } })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(localFilePath);

    generatedUrls[col.id] = `/products/t-shirt-reguler/${filename}`;
    localPaths.push({ id: col.id, filename, localFilePath });
  }

  console.log(`\nAll 22 colors generated in public/products/t-shirt-reguler/!`);

  // Upload to Supabase Storage bucket 'site-assets'
  console.log(`\nUploading 22 color assets to Supabase Storage bucket "site-assets"...`);
  const storageUrls = {};

  for (const item of localPaths) {
    const fileBuffer = fs.readFileSync(item.localFilePath);
    const destPath = `t-shirt-reguler/${item.filename}`;

    const { error: uploadErr } = await supabase.storage
      .from('site-assets')
      .upload(destPath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.warn(`Failed to upload ${destPath} to Supabase:`, uploadErr.message);
    } else {
      const { data: pubUrlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(destPath);
      storageUrls[item.id] = pubUrlData.publicUrl;
      console.log(`Uploaded to Supabase: ${item.id} -> ${pubUrlData.publicUrl}`);
    }
  }

  // Update CustomGarment in Supabase
  console.log(`\nUpdating CustomGarment "T-Shirt Reguler" in Supabase database...`);
  // Top 5 highlight images for general catalog preview
  const primaryImages = [
    storageUrls['salmon'] || generatedUrls['salmon'],
    storageUrls['hitam'] || generatedUrls['hitam'],
    storageUrls['putih'] || generatedUrls['putih'],
    storageUrls['navy'] || generatedUrls['navy'],
    storageUrls['sage-green'] || generatedUrls['sage-green'],
  ];

  const { error: dbErr } = await supabase
    .from('CustomGarment')
    .update({
      images: JSON.stringify(primaryImages),
      updatedAt: new Date().toISOString(),
    })
    .or('slug.eq.t-shirt-reguler,id.eq.cmv6jodv90000sxrgtjjfhfae');

  if (dbErr) {
    console.error('Error updating CustomGarment in database:', dbErr);
  } else {
    console.log('Successfully updated CustomGarment in database with new high-res assets!');
  }

  // Save color map json locally for the frontend component to import
  const colorMapFile = path.join(__dirname, '..', 'src', 'data', 'tshirt_colors.json');
  fs.mkdirSync(path.dirname(colorMapFile), { recursive: true });
  fs.writeFileSync(
    colorMapFile,
    JSON.stringify(
      {
        localUrls: generatedUrls,
        storageUrls: storageUrls,
      },
      null,
      2
    )
  );
  console.log(`Saved color assets map to src/data/tshirt_colors.json!`);
}

generateAllColors();
