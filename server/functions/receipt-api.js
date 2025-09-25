import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to determine item category based on name
function determineCategory(itemName) {
  const name = itemName.toLowerCase();
  
  // Check for drink keywords
  if (name.includes('java') || name.includes('latte') || name.includes('coffee') || 
      name.includes('tea') || name.includes('juice') || name.includes('drink')) {
    return 'drink';
  }
  
  // Check for food keywords
  if (name.includes('food') || name.includes('meal') || name.includes('snack')) {
    return 'food';
  }
  
  // Default to food for most items
  return 'food';
}

const receiptApiHandler = async (req, res) => {
  try {
    console.log('📨 Received receipt data:', JSON.stringify(req.body, null, 2));

    const receiptData = req.body;

    // Validate required fields
    if (!receiptData.transaction_id || !receiptData.items || !Array.isArray(receiptData.items)) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "transaction_id and items array are required"
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
          category: determineCategory(item.name)
        }));
      } else {
        // Single item
        return [{
          id: `item-${index}`,
          name: item.name,
          price: Math.round(item.total),
          category: determineCategory(item.name)
        }];
      }
    });

    // Create default person based on customer name
    const persons = [
      { 
        id: '1', 
        name: receiptData.customer_name || 'Customer', 
        color: '#8B5CF6' 
      }
    ];

    // No assignments by default (user will assign manually)
    const assignments = [];

    const discount = Math.round(receiptData.total_discounts || 0);
    const tax = Math.round(receiptData.total_fees || 0);
    const subtotal = Math.round(receiptData.subtotal || 0);
    const finalTotal = Math.round(receiptData.final_total || 0);

    // Create discount and tax value strings
    const discountValue = (receiptData.discounts || [])
      .map(d => d.amount.toString())
      .join('+');
    const taxValue = (receiptData.fees || [])
      .map(f => f.amount.toString())
      .join('+');

    console.log('💾 Saving to database...');

    // Save to expert_calculations table
    const { data: result, error } = await supabase
      .from('expert_calculations')
      .insert({
        items,
        persons,
        assignments,
        discount_value: discountValue,
        tax_value: taxValue,
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

    // Return success response with calculation details
    const baseUrl = req.get('origin') || `http://localhost:${process.env.VITE_PORT || 5173}`;
    const calculationUrl = `${baseUrl}/expert/${result.id}`;

    const response = {
      success: true,
      calculation_id: result.id,
      url: calculationUrl,
      edit_url: `${baseUrl}/expert/${result.id}/edit`,
      message: 'Receipt processed and calculation created successfully',
      data: {
        items_count: items.length,
        persons_count: persons.length,
        subtotal,
        discount,
        tax,
        final_total: finalTotal
      }
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

export default receiptApiHandler;