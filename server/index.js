import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import receiptApiHandler from './functions/receipt-api.js';
import processReceiptHandler from './functions/process-receipt.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually load environment variables from the project root
const envPath = join(__dirname, '..', '.env');
console.log('🔍 Looking for .env file at:', envPath);
console.log('📁 .env file exists:', existsSync(envPath));

// Manually parse .env file
if (existsSync(envPath)) {
  try {
    const envContent = readFileSync(envPath, 'utf8');
    console.log('📄 .env file content preview:');
    console.log(envContent.substring(0, 100) + '...');
    
    // Parse each line
    const lines = envContent.split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
        console.log(`✅ Set ${key.trim()}: ${value.substring(0, 20)}...`);
      }
    });
    console.log('✅ .env file loaded successfully');
  } catch (error) {
    console.error('❌ Error reading .env file:', error);
  }
} else {
  console.error('❌ .env file not found at:', envPath);
}

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Debug: Log environment variables
console.log('🔍 Environment check:');
console.log('Current working directory:', process.cwd());
console.log('Server directory:', __dirname);
console.log('Env file path:', envPath);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (process.env.VITE_SUPABASE_URL) {
  console.log('🔗 VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
}
if (process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('🔑 VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY.substring(0, 30) + '...');
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/functions/v1/receipt-api', receiptApiHandler);
app.post('/functions/v1/process-receipt', processReceiptHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📝 Receipt API: http://localhost:${PORT}/functions/v1/receipt-api`);
  console.log(`🔄 Process Receipt: http://localhost:${PORT}/functions/v1/process-receipt`);
});