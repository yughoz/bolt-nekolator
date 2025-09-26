interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ReceiptFee {
  type: string;
  amount: number;
}

interface ReceiptDiscount {
  type: string;
  amount: number;
}

interface ReceiptData {
  transaction_id: string;
  transaction_date: string;
  customer_name: string;
  total_paid: number;
  billing_amount: number;
  items: ReceiptItem[];
  fees: ReceiptFee[];
  total_fees: number;
  discounts: ReceiptDiscount[];
  total_discounts: number;
  subtotal: number;
  final_total: number;
}

interface Item {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'other';
}

interface Person {
  id: string;
  name: string;
  color: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    let receiptData: ReceiptData;
    try {
      receiptData = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "JSON parse failed"
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Generate transaction_id if missing
    if (!receiptData.transaction_id) {
      receiptData.transaction_id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Validate required fields
    if (!receiptData.items || !Array.isArray(receiptData.items)) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          details: "items array is required"
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Convert receipt items to expert calculator format
    const items: Item[] = receiptData.items.flatMap((item, index) => {
      if (item.quantity > 1) {
        // Create multiple items for quantities > 1
        return Array.from({ length: item.quantity }, (_, qIndex) => ({
          id: `item-${index}-${qIndex}`,
          name: `${item.name} (${qIndex + 1}/${item.quantity})`,
          price: Math.round(item.unit_price),
          category: 'food' as const
        }));
      } else {
        // Single item
        return [{
          id: `item-${index}`,
          name: item.name,
          price: Math.round(item.total),
          category: 'food' as const
        }];
      }
    });

    // Create default person
    const persons: Person[] = [
      { id: '1', name: receiptData.customer_name || 'Customer', color: '#8B5CF6' }
    ];

    // No assignments by default (user will assign manually)
    const assignments: any[] = [];

    const discount = Math.round(receiptData.total_discounts);
    const tax = Math.round(receiptData.total_fees);
    const subtotal = Math.round(receiptData.subtotal);
    const finalTotal = Math.round(receiptData.final_total);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save to expert_calculations table
    const { data: result, error } = await supabase
      .from('expert_calculations')
      .insert({
        items,
        persons,
        assignments,
        discount_value: receiptData.total_discounts.toString(),
        tax_value: receiptData.total_fees.toString(),
        discount,
        tax,
        subtotal,
        final_total: finalTotal,
        receipt_data: receiptData,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save calculation', details: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Return the URL for accessing the calculation
    const baseUrl = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://your-app-domain.com';
    const calculationUrl = `${baseUrl}/expert/${result.id}`;

    return new Response(
      JSON.stringify({
        success: true,
        calculation_id: result.id,
        url: calculationUrl,
        edit_url: `${baseUrl}/expert/${result.id}/edit`,
        message: 'Receipt processed and calculation created successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});