import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import receiptApiHandler from './functions/receipt-api.js';
import processReceiptHandler from './functions/process-receipt.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Debug: Log environment variables (remove in production)
console.log('🔍 Environment check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

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