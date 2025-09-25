# Receipt Processing API

A simple Node.js API endpoint for processing receipt JSON data and creating expert calculations.

## Quick Start

### 1. Start the API Server

```bash
# Development mode (with auto-reload)
npm run api:dev

# Production mode
npm run api
```

The server will start on `http://localhost:3001`

### 2. Test the API

```bash
# Health check
curl http://localhost:3001/health

# Process receipt
curl -X POST http://localhost:3001/api/process-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "F-2964671742",
    "transaction_date": "2025-09-03",
    "customer_name": "Alvian Yusuf",
    "total_paid": 88200,
    "billing_amount": 132000,
    "items": [
      {
        "name": "Java Aren",
        "quantity": 1,
        "unit_price": 22000,
        "total": 22000
      }
    ],
    "fees": [
      {
        "type": "Biaya penanganan dan pengiriman",
        "amount": 19000
      }
    ],
    "total_fees": 19000,
    "discounts": [
      {
        "type": "Diskon PLUS",
        "amount": 10000
      }
    ],
    "total_discounts": 10000,
    "subtotal": 22000,
    "final_total": 31000
  }'
```

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

### `POST /api/process-receipt`
Process receipt JSON data and create expert calculation.

**Request Body:**
```json
{
  "transaction_id": "string",
  "transaction_date": "string",
  "customer_name": "string",
  "total_paid": number,
  "billing_amount": number,
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unit_price": number,
      "total": number
    }
  ],
  "fees": [
    {
      "type": "string",
      "amount": number
    }
  ],
  "total_fees": number,
  "discounts": [
    {
      "type": "string",
      "amount": number
    }
  ],
  "total_discounts": number,
  "subtotal": number,
  "final_total": number
}
```

**Success Response (200):**
```json
{
  "success": true,
  "calculation_id": "uuid-here",
  "url": "https://your-app.com/expert/uuid-here",
  "edit_url": "https://your-app.com/expert/uuid-here/edit",
  "message": "Receipt processed and calculation created successfully"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Features

- ✅ **CORS enabled** - Works from any frontend
- ✅ **JSON validation** - Validates required fields
- ✅ **Error handling** - Comprehensive error responses
- ✅ **Database integration** - Saves to Supabase
- ✅ **URL generation** - Returns shareable links
- ✅ **Health check** - Monitor API status
- ✅ **TypeScript** - Full type safety

## Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Development

The API uses the same Supabase connection as your main application, so no additional database setup is required.

### File Structure

```
src/api/
├── receiptApi.ts    # Core receipt processing logic
├── server.ts        # Express server setup
└── README.md        # This file
```

### Adding New Endpoints

Add new routes in `server.ts`:

```typescript
app.post('/api/new-endpoint', async (req, res) => {
  // Your logic here
});
```