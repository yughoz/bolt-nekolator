import { createClient } from '@supabase/supabase-js';

const processReceiptHandler = async (req, res) => {
  try {
    // Initialize Supabase client here (after env vars are loaded)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    // Check if Supabase client is initialized
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Missing Supabase credentials',
        details: 'Missing required environment variables. Please check your .env file.'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Processing receipt data:', JSON.stringify(req.body, null, 2));

    const receiptData = req.body;

    // Generate transaction_id if missing
    if (!receiptData.transaction_id) {
      receiptData.transaction_id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 Generated transaction_id:', receiptData.transaction_id);
    }

    // Validate required fields
    if (!receiptData.items || !Array.isArray(receiptData.items)) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "items array is required"
      });
    }

    // Convert receipt items to expert calculator format
    const items = receiptData.items.flatMap((item, index) => {
      if (item.quantity > 1) {
        // Create multiple items for quantities > 1
        return Array.from({ length: item.quantity }, (_, qIndex) => ({
          id: `item-${index}-${qIndex}`,
          name: `${item.name} (${qIndex + 1}/${item.quantity})`,
          price: Math.round(item.unit_price),
          category: 'food'
        }));
      } else {
        // Single item
        return [{
          id: `item-${index}`,
          name: item.name,
          price: Math.round(item.total),
          category: 'food'
        }];
      }
    });

    // Create default person
    const persons = [
      { id: '1', name: receiptData.customer_name || 'Customer', color: '#8B5CF6' }
    ];

    // No assignments by default (user will assign manually)
    const assignments = [];

    const discount = Math.round(receiptData.total_discounts || 0);
    const tax = Math.round(receiptData.total_fees || 0);
    const subtotal = Math.round(receiptData.subtotal || 0);
    const finalTotal = Math.round(receiptData.final_total || 0);

    console.log('💾 Saving to database...');

    // Save to expert_calculations table
    const { data: result, error } = await supabase
      .from('expert_calculations')
      .insert({
        items,
        persons,
        assignments,
        discount_value: receiptData.total_discounts?.toString() || '',
        tax_value: receiptData.total_fees?.toString() || '',
        discount,
        tax,
        subtotal,
        final_total: finalTotal,
        receipt_data: receiptData,
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to save calculation', 
        details: error.message 
      });
    }

    console.log('✅ Calculation saved with ID:', result.id);

    // Return the URL for accessing the calculation
    const baseUrl = req.get('origin') || req.get('host') ? `${req.protocol}://${req.get('host')}` : `http://localhost:${process.env.VITE_PORT || 5173}`;
    const calculationUrl = `${baseUrl}/expert/${result.id}`;

    const response = {
      success: true,
      calculation_id: result.id,
      url: calculationUrl,
      edit_url: `${baseUrl}/expert/${result.id}/edit`,
      message: 'Receipt processed and calculation created successfully'
    };

    console.log('📤 Sending response:', response);
    res.json(response);

  } catch (error) {
    console.error('💥 Error processing receipt:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
};

export default processReceiptHandler;