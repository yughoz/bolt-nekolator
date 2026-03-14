import PocketBase from 'pocketbase';

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://pocket.nekoclaw.my.id';

export const pb = new PocketBase(pocketbaseUrl);

// Types for calculations
export interface PersonEntry {
  id: string;
  name: string;
  price: string;
  totalPrice: number;
  totalToPay: number;
}

export interface Calculation {
  id?: string;
  discount_value: string;
  discount_result: number;
  tax_value: string;
  tax_result: number;
  persons: PersonEntry[];
  overall_total: number;
  final_total: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExpertCalculation {
  id?: string;
  items: any[];
  persons: any[];
  assignments: any[];
  discount_value: string;
  tax_value: string;
  discount: number;
  tax: number;
  subtotal: number;
  final_total: number;
  receipt_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ShortLink {
  id?: string;
  code: string;
  target_type: 'basic' | 'expert';
  calculation_id: string;
  created_at?: string;
}
