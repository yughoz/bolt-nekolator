import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Environment Variable Debug Test');
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);

// Try different .env file locations
const envPaths = [
  join(process.cwd(), '.env'),
  join(__dirname, '.env'),
  '.env'
];

console.log('\n📁 Checking .env file locations:');
envPaths.forEach(path => {
  console.log(`${path}: ${existsSync(path) ? '✅ EXISTS' : '❌ NOT FOUND'}`);
});

// Find the correct .env file
let envPath = null;
for (const path of envPaths) {
  if (existsSync(path)) {
    envPath = path;
    break;
  }
}

if (envPath) {
  console.log(`\n📄 Reading .env file from: ${envPath}`);
  try {
    const envContent = readFileSync(envPath, 'utf8');
    console.log('File content preview:');
    console.log(envContent.substring(0, 200) + '...');
    
    // Load the environment variables
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.error('❌ Error loading .env:', result.error);
    } else {
      console.log('✅ .env loaded successfully');
    }
  } catch (error) {
    console.error('❌ Error reading .env file:', error);
  }
} else {
  console.log('\n❌ No .env file found in any location');
}

console.log('\n🔍 Environment Variables Check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ SET' : '❌ MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING');

if (process.env.VITE_SUPABASE_URL) {
  console.log('VITE_SUPABASE_URL value:', process.env.VITE_SUPABASE_URL);
}
if (process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('VITE_SUPABASE_ANON_KEY value:', process.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...');
}