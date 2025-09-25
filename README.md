# Nekolators - Bill Splitting Calculator

A smart bill splitting calculator with basic and expert modes, built with React, TypeScript, and Supabase.

## Features

- **Basic Calculator**: Simple bill splitting with manual entry
- **Expert Mode**: Advanced calculator with drag & drop items and person assignments
- **Receipt Upload**: Upload receipt images to automatically extract items
- **Save & Share**: Save calculations and share them via links
- **Real-time Calculations**: Automatic calculation of proportional discounts and taxes

## API Endpoints

### Receipt Processing API

Process receipt data and create expert calculations.

**Endpoint**: `POST /functions/v1/receipt-api`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

**Request Body**:
```json
{
  "transaction_id": "F-2964671742",
  "transaction_date": "2025-09-03",
  "customer_name": "Alvian Yusuf",
  "total_paid": 88200,
  "billing_amount": 132000,
  "items": [
    {
      "name": "5 Java Aren",
      "quantity": 1,
      "unit_price": 88000,
      "total": 88000
    },
    {
      "name": "Java Latte (No Sugar)",
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
  "total_discounts": 62800,
  "subtotal": 132000,
  "final_total": 88200
}
```

**Response**:
```json
{
  "success": true,
  "calculation_id": "uuid-here",
  "url": "https://your-app.com/expert/uuid-here",
  "edit_url": "https://your-app.com/expert/uuid-here/edit",
  "message": "Receipt processed and calculation created successfully",
  "data": {
    "items_count": 3,
    "persons_count": 1,
    "subtotal": 132000,
    "discount": 62800,
    "tax": 19000,
    "final_total": 88200
  }
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Fill in your Supabase credentials
```

3. Start Supabase locally (if using local development):
```bash
# Install Supabase CLI first: https://supabase.com/docs/guides/cli
supabase start
```

4. Start development server:
```bash
npm run dev
```

## Local Development with Supabase

If you're running Supabase locally, the Edge Functions will be available at:
- **Base URL**: `http://localhost:54321`
- **Functions URL**: `http://localhost:54321/functions/v1/`
- **Receipt API**: `http://localhost:54321/functions/v1/receipt-api`

Make sure to update your `.env` file:
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key-from-supabase-start
```

### Testing the API locally:

```bash
curl -X POST "http://localhost:54321/functions/v1/receipt-api" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LOCAL_ANON_KEY" \
  -d '{
    "transaction_id": "F-2964671742",
    "transaction_date": "2025-09-03",
    "customer_name": "Alvian Yusuf",
    "total_paid": 88200,
    "billing_amount": 132000,
    "items": [
      {
        "name": "5 Java Aren",
        "quantity": 1,
        "unit_price": 88000,
        "total": 88000
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
    "subtotal": 132000,
    "final_total": 88200
  }'
```

## Database Schema

The application uses two main tables:

- `calculations`: For basic calculator data
- `expert_calculations`: For expert mode data with items, persons, and assignments

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Routing**: React Router
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React