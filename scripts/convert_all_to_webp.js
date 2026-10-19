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

async function convertFileToWebp(inputPath, outputPath, options = { quality: 82, effort: 6 }) {
  if (!fs.existsSync(inputPath)) {
    console.warn(`[Skip] Input not found: ${inputPath}`);
    return null;
  }
  const beforeStats = fs.statSync(inputPath);
  await sharp(inputPath)
    .webp(options)
    .toFile(outputPath);
  const afterStats = fs.statSync(outputPath);
  console.log(`✓ Converted: ${path.basename(inputPath)} (${(beforeStats.size / 1024).toFixed(1)} KB) -> ${path.basename(outputPath)} (${(afterStats.size / 1024).toFixed(1)} KB, -${((1 - afterStats.size / beforeStats.size) * 100).toFixed(1)}%)`);
  return outputPath;
}

async function run() {
  console.log('========================================');
  console.log('1. Converting local images to WebP');
  console.log('========================================');

  // 1. Background
  await convertFileToWebp(
    path.join(__dirname, '..', 'public', 'background.png'),
    path.join(__dirname, '..', 'public', 'background.webp'),
    { quality: 80, effort: 6 }
  );

  // 2. Logo brand
  await convertFileToWebp(
    path.join(__dirname, '..', 'public', 'logo-brand.png'),
    path.join(__dirname, '..', 'public', 'logo-brand.webp'),
    { quality: 90, effort: 6, lossless: true }
  );

  // 3. Img folder
  const imgDir = path.join(__dirname, '..', 'Img');
  if (fs.existsSync(imgDir)) {
    if (fs.existsSync(path.join(imgDir, 'Background.png'))) {
      await convertFileToWebp(
        path.join(imgDir, 'Background.png'),
        path.join(imgDir, 'Background.webp')
      );
    }
    if (fs.existsSync(path.join(imgDir, 'logo brand.png'))) {
      await convertFileToWebp(
        path.join(imgDir, 'logo brand.png'),
        path.join(imgDir, 'logo brand.webp'),
        { quality: 90, effort: 6, lossless: true }
      );
    }
    if (fs.existsSync(path.join(imgDir, 'database_flowchart.png'))) {
      await convertFileToWebp(
        path.join(imgDir, 'database_flowchart.png'),
        path.join(imgDir, 'database_flowchart.webp')
      );
    }
  }

  // 4. docs folder
  const docsDiagram = path.join(__dirname, '..', 'docs', 'diagrams', 'database_flowchart.png');
  if (fs.existsSync(docsDiagram)) {
    await convertFileToWebp(
      docsDiagram,
      path.join(__dirname, '..', 'docs', 'diagrams', 'database_flowchart.webp')
    );
  }

  // 5. T-shirt regular products
  const tshirtDir = path.join(__dirname, '..', 'public', 'products', 't-shirt-reguler');
  const convertedTshirtFiles = [];
  if (fs.existsSync(tshirtDir)) {
    const files = fs.readdirSync(tshirtDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    console.log(`\nFound ${files.length} t-shirt product images to convert...`);
    for (const f of files) {
      const ext = path.extname(f);
      const baseName = path.basename(f, ext);
      const input = path.join(tshirtDir, f);
      const output = path.join(tshirtDir, `${baseName}.webp`);
      await convertFileToWebp(input, output, { quality: 85, effort: 6 });
      convertedTshirtFiles.push(`${baseName}.webp`);
    }
  }

  console.log('\n========================================');
  console.log('2. Uploading WebP assets to Supabase Storage');
  console.log('========================================');

  // Check site-assets bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = (buckets || []).some(b => b.name === 'site-assets');
  if (!bucketExists) {
    console.log('Creating site-assets bucket...');
    await supabase.storage.createBucket('site-assets', { public: true });
  }

  // Upload root assets
  const rootUploads = [
    { local: 'public/background.webp', dest: 'background.webp' },
    { local: 'public/logo-brand.webp', dest: 'logo-brand.webp' },
  ];

  for (const item of rootUploads) {
    const fullPath = path.join(__dirname, '..', item.local);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      const { error } = await supabase.storage
        .from('site-assets')
        .upload(item.dest, buf, { contentType: 'image/webp', upsert: true });
      if (error) {
        console.error(`Upload error for ${item.dest}:`, error.message);
      } else {
        const { data: pub } = supabase.storage.from('site-assets').getPublicUrl(item.dest);
        console.log(`✓ Uploaded ${item.dest} -> ${pub.publicUrl}`);
      }
    }
  }

  // Upload t-shirt product WebP files
  for (const fileName of convertedTshirtFiles) {
    const fullPath = path.join(tshirtDir, fileName);
    const dest = `t-shirt-reguler/${fileName}`;
    const buf = fs.readFileSync(fullPath);
    const { error } = await supabase.storage
      .from('site-assets')
      .upload(dest, buf, { contentType: 'image/webp', upsert: true });
    if (error) {
      console.error(`Upload error for ${dest}:`, error.message);
    } else {
      console.log(`✓ Uploaded storage: ${dest}`);
    }
  }

  console.log('\n========================================');
  console.log('3. Updating tshirt_colors.json');
  console.log('========================================');

  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'tshirt_colors.json');
  if (fs.existsSync(jsonPath)) {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    for (const key of Object.keys(jsonContent.localUrls || {})) {
      jsonContent.localUrls[key] = jsonContent.localUrls[key].replace(/\.jpg$/, '.webp');
    }
    for (const key of Object.keys(jsonContent.storageUrls || {})) {
      jsonContent.storageUrls[key] = jsonContent.storageUrls[key].replace(/\.jpg$/, '.webp');
    }
    fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf-8');
    console.log(`✓ Updated ${jsonPath} with WebP URLs.`);
  }

  console.log('\n========================================');
  console.log('4. Updating Supabase ProductImage URLs');
  console.log('========================================');

  const { data: pImages } = await supabase.from('ProductImage').select('*');
  if (pImages && pImages.length > 0) {
    for (const img of pImages) {
      let updatedUrl = img.url;
      if (updatedUrl.includes('images.unsplash.com') && !updatedUrl.includes('fm=webp')) {
        updatedUrl = updatedUrl + '&fm=webp';
      } else if (updatedUrl.endsWith('.jpg') || updatedUrl.endsWith('.png')) {
        updatedUrl = updatedUrl.replace(/\.(jpg|png)$/, '.webp');
      }
      if (updatedUrl !== img.url) {
        const { error } = await supabase.from('ProductImage').update({ url: updatedUrl }).eq('id', img.id);
        if (error) {
          console.error(`Failed to update ProductImage ${img.id}:`, error.message);
        } else {
          console.log(`✓ Updated ProductImage ${img.id}: ${updatedUrl}`);
        }
      }
    }
  }

  console.log('\nConversion and migration to WebP complete!');
}

run().catch(console.error);
