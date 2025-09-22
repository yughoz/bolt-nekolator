export interface Item {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'other';
}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface Assignment {
  itemId: string;
  personId: string;
}

export interface ExpertTotals {
  subtotal: number;
  finalTotal: number;
  personTotals: Record<string, number>;
  personItemTotals: Record<string, number>;
}