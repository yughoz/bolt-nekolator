import { createClient } from '@supabase/supabase-js';

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
    // Initialize Supabase client here (after env vars are loaded)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    // Check if Supabase client is initialized
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        error: 'Missing Supabase credentials',
        details: 'Missing environment variables. Please check your .env file.'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📨 Received receipt data:', JSON.stringify(req.body, null, 2));

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

    // Create short link
    let shortCode = null;
    try {
      const shortLinkResult = await supabase
        .from('short_links')
        .insert({
          calculation_type: 'expert',
          calculation_id: result.id,
          short_code: 'temp',
        })
        .select('id')
        .single();

      if (!shortLinkResult.error) {
        // Generate short code from auto-increment ID (base-36)
        shortCode = shortLinkResult.data.id.toString(36);
        
        // Update with actual short code
        await supabase
          .from('short_links')
          .update({ short_code: shortCode })
          .eq('id', shortLinkResult.data.id);
      }
    } catch (shortLinkError) {
      console.warn('Failed to create short link:', shortLinkError);
    }

    // Return success response with calculation details
    const baseUrl = req.get('origin') || req.get('host') ? `${req.protocol}://${req.get('host')}` : `http://localhost:${process.env.VITE_PORT || 5173}`;
    const calculationUrl = shortCode ? `${baseUrl}/s/${shortCode}` : `${baseUrl}/expert/${result.id}`;

    const response = {
      success: true,
      calculation_id: result.id,
      short_code: shortCode,
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