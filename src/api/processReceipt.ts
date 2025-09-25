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

interface ProcessReceiptResponse {
  success: boolean;
  calculation_id?: string;
  url?: string;
  edit_url?: string;
  message?: string;
  error?: string;
  data?: {
    items_count: number;
    persons_count: number;
    subtotal: number;
    discount: number;
    tax: number;
    final_total: number;
  };
}

export const processReceiptData = async (receiptData: ReceiptData): Promise<ProcessReceiptResponse> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL is not configured');
    }

    const apiUrl = `${supabaseUrl}/functions/v1/receipt-api`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(receiptData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error processing receipt data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process receipt data'
    };
  }
};