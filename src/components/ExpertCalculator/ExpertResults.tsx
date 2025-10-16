import React, { forwardRef } from 'react';
import type { Person, ExpertTotals } from '../../types/expert';
import { useLanguage } from '../../lib/i18n';

interface ExpertResultsProps {
  persons: Person[];
  totals: ExpertTotals;
  discount: number;
  tax: number;
}

export const ExpertResults = forwardRef<HTMLDivElement, ExpertResultsProps>(
  ({ persons, totals, discount, tax }, ref) => {
    const { t } = useLanguage();

    return (
      <div ref={ref} className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('expert.resultsTitle')}</h3>
        
        <div className="space-y-4">
          {persons.map((person, index) => {
            const personTotal = totals.personTotals[person.id] || 0;
            
            return (
              <div key={person.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: person.color }}
                  />
                  <span className="font-medium">
                    {person.name || t('expert.personFallback', { index: index + 1 })}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-orange-600">
                    {new Intl.NumberFormat('id-ID').format(Math.round(personTotal))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('expert.personItemsLabel', {
                      value: new Intl.NumberFormat('id-ID').format(
                        Math.round(totals.personItemTotals[person.id] || 0)
                      ),
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t-2 border-orange-200">
            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div className="flex justify-between">
                <span>{t('expert.subtotalLabel')}</span>
                <span>{new Intl.NumberFormat('id-ID').format(Math.round(totals.subtotal))}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>{t('expert.discountShortLabel')}</span>
                  <span>-{new Intl.NumberFormat('id-ID').format(Math.round(discount))}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>{t('expert.taxShortLabel')}</span>
                  <span>{new Intl.NumberFormat('id-ID').format(Math.round(tax))}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center text-xl font-bold text-orange-600">
              <span>{t('expert.finalTotalLabel')}</span>
              <span>{new Intl.NumberFormat('id-ID').format(Math.round(totals.finalTotal))}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ExpertResults.displayName = 'ExpertResults';
