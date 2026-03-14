import { pb } from '../lib/pocketbase';
import type { Item, Person, Assignment } from '../types/expert';
import type { ExpertCalculation } from '../lib/pocketbase';

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
    const record = await pb.collection('bolt_expert_calculations').create<ExpertCalculation>({
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
    });

    return record.id || null;
  } catch (error) {
    console.error('Error saving expert calculation:', error);
    return null;
  }
};

export const getExpertCalculation = async (id: string): Promise<ExpertCalculationData | null> => {
  try {
    const data = await pb.collection('bolt_expert_calculations').getOne<ExpertCalculation>(id);

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
    const updateData: any = {};

    if (data.items !== undefined) updateData.items = data.items;
    if (data.persons !== undefined) updateData.persons = data.persons;
    if (data.assignments !== undefined) updateData.assignments = data.assignments;
    if (data.discountValue !== undefined) updateData.discount_value = data.discountValue;
    if (data.taxValue !== undefined) updateData.tax_value = data.taxValue;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.tax !== undefined) updateData.tax = data.tax;
    if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
    if (data.finalTotal !== undefined) updateData.final_total = data.finalTotal;
    if (data.receiptData !== undefined) updateData.receipt_data = data.receiptData;

    await pb.collection('bolt_expert_calculations').update(id, updateData);
    return true;
  } catch (error) {
    console.error('Error updating expert calculation:', error);
    return false;
  }
};
