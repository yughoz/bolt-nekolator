import React from 'react';
import { MoreVertical, Download } from 'lucide-react';
import type { PersonEntry } from '../../types/calculator';
import { formatNumber, calculatePersonTotal } from '../../utils/calculations';

interface ResultsDisplayProps {
  persons: PersonEntry[];
  totalDiscount: number;
  totalTax: number;
  overallTotal: number;
  finalTotal: number;
  showDetails: boolean;
  onToggleDetails: () => void;
  readOnly?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  persons,
  totalDiscount,
  totalTax,
  overallTotal,
  finalTotal,
  showDetails,
  onToggleDetails,
  readOnly = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        {persons.map((person, index) => {
          const breakdown = calculatePersonTotal(
            person.totalPrice,
            overallTotal,
            totalDiscount,
            totalTax
          );

          return (
            <div key={person.id} className="border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {person.name || `Person ${index + 1}`}
                </span>
                {!showDetails && (
                  <span className="text-lg font-semibold text-orange-600">
                    {formatNumber(breakdown.finalAmount)}
                  </span>
                )}
              </div>
              
              {showDetails && (
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>{formatNumber(person.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disc:</span>
                    <span>-{formatNumber(breakdown.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatNumber(breakdown.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-orange-600 border-t border-gray-200 pt-1">
                    <span>Total:</span>
                    <span>{formatNumber(breakdown.finalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="pt-4 border-t-2 border-orange-200">
          <div className="flex justify-between items-center text-xl font-bold text-orange-600">
            <span>Total final:</span>
            <span>{formatNumber(finalTotal)}</span>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex gap-2 mt-6">
        <button
          onClick={onToggleDetails}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <MoreVertical size={16} />
          Details
        </button>
        
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
        >
          <Download size={16} />
          Download
        </button>
      </div>
      )}
    </div>
  );
};