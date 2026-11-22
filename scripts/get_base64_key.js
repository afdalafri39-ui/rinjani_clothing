// Script untuk menampilkan nilai Base64 serviceAccountKey.json untuk dimasukkan ke Vercel Environment Variables
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve(process.cwd(), 'scripts', 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('File scripts/serviceAccountKey.json tidak ditemukan.');
  process.exit(1);
}

const content = fs.readFileSync(keyPath, 'utf8');
const base64 = Buffer.from(content.trim()).toString('base64');

console.log('\n================ SALIN NILAI DI BAWAH INI UNTUK VERCEL ================');
console.log('Key Name: FIREBASE_SERVICE_ACCOUNT_BASE64');
console.log('Value:');
console.log(base64);
console.log('========================================================================\n');
