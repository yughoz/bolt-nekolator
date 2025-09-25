import { supabase } from '../lib/supabase';
import type { Item, Person, Assignment } from '../types/expert';

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

interface ApiResponse {
  success: boolean;
  calculation_id?: string;
  url?: string;
  edit_url?: string;
  message?: string;
  error?: string;
}

export class ReceiptApiHandler {
  static async processReceipt(receiptData: ReceiptData): Promise<ApiResponse> {
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
      const assignments: Assignment[] = [];

      const discount = Math.round(receiptData.total_discounts);
      const tax = Math.round(receiptData.total_fees);
      const subtotal = Math.round(receiptData.subtotal);
      const finalTotal = Math.round(receiptData.final_total);

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
        return {
          success: false,
          error: `Failed to save calculation: ${error.message}`
        };
      }

      // Generate URLs
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/expert/${result.id}`;
      const editUrl = `${baseUrl}/expert/${result.id}/edit`;

      return {
        success: true,
        calculation_id: result.id,
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
  }
}

// Export a simple function for direct use
export const processReceiptApi = async (receiptData: ReceiptData): Promise<ApiResponse> => {
  return ReceiptApiHandler.processReceipt(receiptData);
};