import express from 'express';
import cors from 'cors';

// Bun automatically loads .env files - no dotenv needed!
const app = express();
const PORT = process.env.SERVER_PORT || 3001;

console.log('🔍 Environment Variables Check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ SET' : '❌ MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING');

// Import handlers AFTER environment variables are loaded
const { default: receiptApiHandler } = await import('./functions/receipt-api.js');
const { default: processReceiptHandler } = await import('./functions/process-receipt.js');

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