import { supabase } from '../lib/supabase';
import type { Item, Person, Assignment } from '../types/expert';

export interface ExpertCalculationData {
  id?: string;
  items: Item[];
  persons: Person[];
  assignments: Assignment[];
  discountValue?: string;
  taxValue?: string;
  discount: number;
  tax: number;
  subtotal: number;
  finalTotal: number;
  receiptData?: any;
}

export const saveExpertCalculation = async (data: ExpertCalculationData): Promise<string | null> => {
  try {
    // Get current user to associate with calculation
    const { data: { user } } = await supabase.auth.getUser();

    const { data: result, error } = await supabase
      .from('expert_calculations')
      .insert({
        user_id: user?.id || null,
        items: data.items,
        persons: data.persons,
        assignments: data.assignments,
        discount_value: data.discountValue || '',
        tax_value: data.taxValue || '',
        discount: data.discount,
        tax: data.tax,
        subtotal: data.subtotal,
        final_total: data.finalTotal,
        receipt_data: data.receiptData,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving expert calculation:', error);
      return null;
    }

    return result.id;
  } catch (error) {
    console.error('Error saving expert calculation:', error);
    return null;
  }
};

export const getExpertCalculation = async (id: string): Promise<ExpertCalculationData | null> => {
  try {
    const { data, error } = await supabase
      .from('expert_calculations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching expert calculation:', error);
      return null;
    }

    return {
      id: data.id,
      items: data.items,
      persons: data.persons,
      assignments: data.assignments,
      discountValue: data.discount_value || '',
      taxValue: data.tax_value || '',
      discount: data.discount,
      tax: data.tax,
      subtotal: data.subtotal,
      finalTotal: data.final_total,
      receiptData: data.receipt_data,
    };
  } catch (error) {
    console.error('Error fetching expert calculation:', error);
    return null;
  }
};

export const updateExpertCalculation = async (id: string, data: Partial<ExpertCalculationData>): Promise<boolean> => {
  try {
    // Get current user to associate with calculation
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('expert_calculations')
      .update({
        user_id: user?.id || null,
        items: data.items,
        persons: data.persons,
        assignments: data.assignments,
        discount_value: data.discountValue,
        tax_value: data.taxValue,
        discount: data.discount,
        tax: data.tax,
        subtotal: data.subtotal,
        final_total: data.finalTotal,
        receipt_data: data.receiptData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating expert calculation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating expert calculation:', error);
    return false;
  }
};

export const getUserExpertCalculations = async (): Promise<ExpertCalculationData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('expert_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user expert calculations:', error);
      return [];
    }

    return data.map(calc => ({
      id: calc.id,
      items: calc.items,
      persons: calc.persons,
      assignments: calc.assignments,
      discountValue: calc.discount_value || '',
      taxValue: calc.tax_value || '',
      discount: calc.discount,
      tax: calc.tax,
      subtotal: calc.subtotal,
      finalTotal: calc.final_total,
      receiptData: calc.receipt_data,
    }));
  } catch (error) {
    console.error('Error fetching user expert calculations:', error);
    return [];
  }
};