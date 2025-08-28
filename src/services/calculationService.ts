import { supabase } from '../lib/supabase';
import type { PersonEntry } from '../types/calculator';

export interface CalculationData {
  id?: string;
  discountValue: string;
  discountResult: number;
  taxValue: string;
  taxResult: number;
  persons: PersonEntry[];
  overallTotal: number;
  finalTotal: number;
}

export const saveCalculation = async (data: CalculationData): Promise<string | null> => {
  try {
    const { data: result, error } = await supabase
      .from('calculations')
      .insert({
        discount_value: data.discountValue,
        discount_result: data.discountResult,
        tax_value: data.taxValue,
        tax_result: data.taxResult,
        persons: data.persons,
        overall_total: data.overallTotal,
        final_total: data.finalTotal,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving calculation:', error);
      return null;
    }

    return result.id;
  } catch (error) {
    console.error('Error saving calculation:', error);
    return null;
  }
};

export const getCalculation = async (id: string): Promise<CalculationData | null> => {
  try {
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching calculation:', error);
      return null;
    }

    return {
      id: data.id,
      discountValue: data.discount_value,
      discountResult: data.discount_result,
      taxValue: data.tax_value,
      taxResult: data.tax_result,
      persons: data.persons,
      overallTotal: data.overall_total,
      finalTotal: data.final_total,
    };
  } catch (error) {
    console.error('Error fetching calculation:', error);
    return null;
  }
};

export const updateCalculation = async (id: string, data: Partial<CalculationData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('calculations')
      .update({
        discount_value: data.discountValue,
        discount_result: data.discountResult,
        tax_value: data.taxValue,
        tax_result: data.taxResult,
        persons: data.persons,
        overall_total: data.overallTotal,
        final_total: data.finalTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating calculation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating calculation:', error);
    return false;
  }
};