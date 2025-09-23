import type { PersonEntry } from '../types/calculator';

export const parseAdditionString = (input: string): number => {
  if (!input.trim()) return 0;
  
  try {
    const numbers = input.split('+').map(str => {
      const num = parseFloat(str.trim());
      return isNaN(num) ? 0 : num;
    });
    return numbers.reduce((sum, num) => sum + num, 0);
  } catch {
    return 0;
  }
};

export const formatNumber = (number: number): string => {
  return Math.round(number).toString();
};

export const calculatePersonTotal = (
  personPrice: number,
  overallTotal: number,
  totalDiscount: number,
  totalTax: number
) => {
  if (overallTotal === 0) {
    return {
      percentageOfTotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      finalAmount: personPrice,
    };
  }

  const percentageOfTotal = personPrice / overallTotal;
  const discountAmount = percentageOfTotal * totalDiscount;
  const taxAmount = percentageOfTotal * totalTax;
  const finalAmount = personPrice - discountAmount + taxAmount;

  return {
    percentageOfTotal,
    discountAmount,
    taxAmount,
    finalAmount,
  };
};

export const calculateOverallTotal = (persons: PersonEntry[]): number => {
  return persons.reduce((total, person) => total + person.totalPrice, 0);
};

export const calculateFinalTotal = (persons: PersonEntry[]): number => {
  return persons.reduce((total, person) => total + person.totalToPay, 0);
};