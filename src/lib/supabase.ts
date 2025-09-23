import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      calculations: {
        Row: {
          id: string;
          discount_value: string;
          discount_result: number;
          tax_value: string;
          tax_result: number;
          persons: PersonEntry[];
          overall_total: number;
          final_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          discount_value?: string;
          discount_result?: number;
          tax_value?: string;
          tax_result?: number;
          persons?: PersonEntry[];
          overall_total?: number;
          final_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          discount_value?: string;
          discount_result?: number;
          tax_value?: string;
          tax_result?: number;
          persons?: PersonEntry[];
          overall_total?: number;
          final_total?: number;
          updated_at?: string;
        };
      };
      expert_calculations: {
        Row: {
          id: string;
          items: Item[];
          persons: Person[];
          assignments: Assignment[];
          discount: number;
          tax: number;
          subtotal: number;
          final_total: number;
          receipt_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          items?: Item[];
          persons?: Person[];
          assignments?: Assignment[];
          discount?: number;
          tax?: number;
          subtotal?: number;
          final_total?: number;
          receipt_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          items?: Item[];
          persons?: Person[];
          assignments?: Assignment[];
          discount?: number;
          tax?: number;
          subtotal?: number;
          final_total?: number;
          receipt_data?: any;
          updated_at?: string;
        };
      };
    };
  };
};

import type { Item, Person, Assignment } from '../types/expert';

export interface PersonEntry {
  id: string;
  name: string;
  price: string;
  totalPrice: number;
  totalToPay: number;
}