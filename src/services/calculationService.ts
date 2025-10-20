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
    // Get current user to associate with calculation
    const { data: { user } } = await supabase.auth.getUser();

    const { data: result, error } = await supabase
      .from('calculations')
      .insert({
        user_id: user?.id || null,
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
    // Get current user to associate with calculation
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('calculations')
      .update({
        user_id: user?.id || null,
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

export const getUserCalculations = async (): Promise<CalculationData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user calculations:', error);
      return [];
    }

    return data.map(calc => ({
      id: calc.id,
      discountValue: calc.discount_value,
      discountResult: calc.discount_result,
      taxValue: calc.tax_value,
      taxResult: calc.tax_result,
      persons: calc.persons,
      overallTotal: calc.overall_total,
      finalTotal: calc.final_total,
    }));
  } catch (error) {
    console.error('Error fetching user calculations:', error);
    return [];
  }
};