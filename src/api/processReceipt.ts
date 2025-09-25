import { saveExpertCalculation } from '../services/expertCalculationService';
import type { Item, Person } from '../types/expert';

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

export const processReceiptData = async (receiptData: ReceiptData): Promise<{
  success: boolean;
  calculation_id?: string;
  url?: string;
  edit_url?: string;
  message?: string;
  error?: string;
}> => {
  try {
    // Validate required fields
    if (!receiptData.transaction_id || !receiptData.items || !Array.isArray(receiptData.items)) {
      return {
        success: false,
        error: 'Missing required fields: transaction_id and items array are required'
      };
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

    // Save to database
    const calculationId = await saveExpertCalculation({
      items,
      persons,
      assignments,
      discountValue: receiptData.total_discounts.toString(),
      taxValue: receiptData.total_fees.toString(),
      discount,
      tax,
      subtotal,
      finalTotal,
      receiptData,
    });

    if (!calculationId) {
      return {
        success: false,
        error: 'Failed to save calculation to database'
      };
    }

    // Generate URLs
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/expert/${calculationId}`;
    const editUrl = `${baseUrl}/expert/${calculationId}/edit`;

    return {
      success: true,
      calculation_id: calculationId,
      url,
      edit_url: editUrl,
      message: 'Receipt processed and calculation created successfully'
    };

  } catch (error) {
    console.error('Error processing receipt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};