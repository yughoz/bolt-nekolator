import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import receiptApiHandler from './functions/receipt-api.js';
import processReceiptHandler from './functions/process-receipt.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the project root
const envPath = join(__dirname, '..', '.env');
console.log('🔍 Looking for .env file at:', envPath);
console.log('📁 .env file exists:', existsSync(envPath));

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
}

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Debug: Log environment variables (remove in production)
console.log('🔍 Environment check:');
console.log('Current working directory:', process.cwd());
console.log('Server directory:', __dirname);
console.log('Env file path:', envPath);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

// If still missing, try to load from current directory
if (!process.env.VITE_SUPABASE_URL) {
  console.log('🔄 Trying to load .env from current directory...');
  const currentDirEnv = join(process.cwd(), '.env');
  console.log('📁 Checking:', currentDirEnv);
  if (existsSync(currentDirEnv)) {
    const result2 = dotenv.config({ path: currentDirEnv });
    if (!result2.error) {
      console.log('✅ .env loaded from current directory');
      console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Now Set' : '❌ Still Missing');
    }
  }
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