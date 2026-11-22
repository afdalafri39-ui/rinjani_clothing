const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('=== VERIFIKASI DATA SUPABASE ===');
  
  // 1. Users
  const { data: users, error: uErr } = await supabase.from('User').select('id, name, email, role, passwordHash');
  console.log('Users di Supabase:', users);

  // 2. Custom Orders count
  const { count: coCount, error: coErr } = await supabase.from('CustomOrder').select('*', { count: 'exact', head: true });
  console.log('Total Custom Orders di Supabase:', coCount);

  // 3. Product Orders count
  const { count: poCount, error: poErr } = await supabase.from('ProductOrder').select('*', { count: 'exact', head: true });
  console.log('Total Product Orders di Supabase:', poCount);

  // 4. Sample CustomOrder
  const { data: sampleCO } = await supabase.from('CustomOrder').select('id, orderNumber, customerName, adminNotes').limit(2);
  console.log('Sample Custom Orders:', sampleCO?.map(c => ({
    id: c.id,
    orderNumber: c.orderNumber,
    customerName: c.customerName,
    hasPaymentHistoryInAdminNotes: c.adminNotes?.includes('PAYMENT_HISTORY_JSON')
  })));

  // 5. Sample ProductOrder
  const { data: samplePO } = await supabase.from('ProductOrder').select('id, orderNumber, customerName, adminNotes').limit(2);
  console.log('Sample Product Orders:', samplePO?.map(p => ({
    id: p.id,
    orderNumber: p.orderNumber,
    customerName: p.customerName,
    hasPaymentHistoryInAdminNotes: p.adminNotes?.includes('PAYMENT_HISTORY_JSON')
  })));
}

check().catch(console.error);
