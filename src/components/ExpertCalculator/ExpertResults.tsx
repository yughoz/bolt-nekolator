import React from 'react';
import type { Person, ExpertTotals } from '../../types/expert';

interface ExpertResultsProps {
  persons: Person[];
  totals: ExpertTotals;
  discount: number;
  tax: number;
}

export const ExpertResults: React.FC<ExpertResultsProps> = ({
  persons,
  totals,
  discount,
  tax,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Results</h3>
      
      <div className="space-y-4">
        {persons.map((person) => {
          const personTotal = totals.personTotals[person.id] || 0;
          
          return (
            <div key={person.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: person.color }}
                />
                <span className="font-medium">
                  {person.name || `Person ${persons.indexOf(person) + 1}`}
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-orange-600">
                  {Math.round(personTotal).toString()}
                </div>
                <div className="text-xs text-gray-500">
                  Items: {Math.round(totals.personItemTotals[person.id] || 0).toString()}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t-2 border-orange-200">
          <div className="space-y-2 text-sm text-gray-600 mb-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{Math.round(totals.subtotal).toString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{Math.round(discount).toString()}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax & Shipping:</span>
                <span>{Math.round(tax).toString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center text-xl font-bold text-orange-600">
            <span>Total Final:</span>
            <span>{Math.round(totals.finalTotal).toString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};