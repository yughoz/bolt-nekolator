import { pb } from '../lib/pocketbase';
import type { PersonEntry } from '../types/calculator';
import type { Calculation } from '../lib/pocketbase';

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
    const record = await pb.collection('bolt_calculations').create<Calcination>({
      discount_value: data.discountValue,
      discount_result: data.discountResult,
      tax_value: data.taxValue,
      tax_result: data.taxResult,
      persons: data.persons,
      overall_total: data.overallTotal,
      final_total: data.finalTotal,
    });

    return record.id || null;
  } catch (error) {
    console.error('Error saving calculation:', error);
    return null;
  }
};

export const getCalculation = async (id: string): Promise<CalculationData | null> => {
  try {
    const data = await pb.collection('bolt_calculations').getOne<Calculation>(id);

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
    console.error('Error getting calculation:', error);
    return null;
  }
};

export const updateCalculation = async (id: string, data: Partial<CalculationData>): Promise<boolean> => {
  try {
    const updateData: any = {};

    if (data.discountValue !== undefined) updateData.discount_value = data.discountValue;
    if (data.discountResult !== undefined) updateData.discount_result = data.discountResult;
    if (data.taxValue !== undefined) updateData.tax_value = data.taxValue;
    if (data.taxResult !== undefined) updateData.tax_result = data.taxResult;
    if (data.persons !== undefined) updateData.persons = data.persons;
    if (data.overallTotal !== undefined) updateData.overall_total = data.overallTotal;
    if (data.finalTotal !== undefined) updateData.final_total = data.finalTotal;

    await pb.collection('bolt_calculations').update(id, updateData);
    return true;
  } catch (error) {
    console.error('Error updating calculation:', error);
    return false;
  }
};
