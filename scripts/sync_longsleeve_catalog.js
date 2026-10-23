const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

function generateId(prefix = '') {
  const p = prefix ? `${prefix}_` : '';
  return `${p}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
}

const COLORS = [
  'Hitam', 'Putih', 'Salmon', 'Navy Blue', 'Misty / Abu Muda', 'Abu-abu Tua',
  'Maroon', 'Merah Cabe', 'Royal Blue', 'Baby Blue', 'Hijau Botol', 'Hijau Army',
  'Sage Green', 'Kuning Kenari', 'Mustard', 'Orange', 'Terracotta', 'Dusty Pink',
  'Ungu Tua', 'Lilac', 'Cream / Krem', 'Coklat Kopi'
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

async function syncCatalog() {
  // 1. Ensure "Long Sleeve" Category exists
  let { data: cat } = await supabase.from('Category').select('*').eq('slug', 'long-sleeve').maybeSingle();
  if (!cat) {
    console.log('Creating Category "Long Sleeve"...');
    const newId = generateId('cat');
    const { data: newCat, error: cErr } = await supabase.from('Category').insert({
      id: newId,
      name: 'Long Sleeve',
      slug: 'long-sleeve',
      description: 'Kaos lengan panjang dengan rib manset premium untuk segala suasana',
      displayOrder: 3,
      active: true,
      updatedAt: new Date().toISOString()
    }).select().single();
    if (cErr) console.error('Error creating Category:', cErr);
    else cat = newCat;
  } else {
    console.log('Category "Long Sleeve" exists:', cat.id);
  }

  // 2. Link Trail Long Sleeve to Category
  const { data: prod } = await supabase.from('Product').select('id, name, slug').eq('slug', 'trail-long-sleeve').maybeSingle();
  if (prod) {
    if (cat?.id) {
      await supabase.from('Product').update({
        categoryId: cat.id,
        updatedAt: new Date().toISOString()
      }).eq('id', prod.id);
      console.log('Updated Trail Long Sleeve categoryId to', cat.id);
    }

    // 3. Populate 22 colors in ProductVariant
    console.log('Updating ProductVariants for 22 colors...');
    await supabase.from('ProductVariant').delete().eq('productId', prod.id);

    const variantsToInsert = [];
    for (const size of SIZES) {
      for (const color of COLORS) {
        variantsToInsert.push({
          id: generateId('var'),
          productId: prod.id,
          size,
          color,
          stock: 15,
          sku: `trail-long-sleeve-${size.toLowerCase()}-${color.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        });
      }
    }
    const { error: vErr } = await supabase.from('ProductVariant').insert(variantsToInsert);
    if (vErr) {
      console.error('Error inserting variants:', vErr);
    } else {
      console.log(`Successfully added ${variantsToInsert.length} variants across 22 colors!`);
    }
  }

  console.log('Catalog sync complete!');
}

syncCatalog().catch(console.error);
