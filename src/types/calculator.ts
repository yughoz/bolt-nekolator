export interface PersonEntry {
  id: string;
  name: string;
  price: string;
  totalPrice: number;
  totalToPay: number;
}

export interface CalculationBreakdown {
  percentageOfTotal: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
}