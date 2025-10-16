import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { getCalculation } from '../services/calculationService';
import { ResultsDisplay } from './Calculator/ResultsDisplay';
import type { CalculationData } from '../services/calculationService';
import { createShortLink, getExistingShortLink } from '../services/shortLinkService';
import { useLanguage } from '../lib/i18n';

export const ViewCalculation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [calculation, setCalculation] = useState<CalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!id) {
        setErrorKey('common.noCalculationId');
        setLoading(false);
        return;
      }

      try {
        const data = await getCalculation(id);
        if (data) {
          setCalculation(data);
        } else {
          setErrorKey('common.calculationNotFound');
        }
      } catch (err) {
        setErrorKey('common.failedLoadCalculation');
        console.error('Error fetching calculation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [id]);

  const handleShare = async () => {
    if (!id) return;

    const tryCopyShareUrl = async (url: string, successKey: string) => {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          alert(t(successKey));
          return;
        } catch {
          // Fallback to manual sharing below
        }
      }
      alert(t('common.shareThisLink', { link: url }));
    };

    try {
      // Check if short link already exists
      let shortCode = await getExistingShortLink(id, 'basic');
      
      // Create new short link if doesn't exist
      if (!shortCode) {
        shortCode = await createShortLink(id, 'basic');
      }

      if (shortCode) {
        const shareUrl = `${window.location.origin}/s/${shortCode}`;
        await tryCopyShareUrl(shareUrl, 'common.shortLinkCopied');
      } else {
        // Fallback to current URL
        const shareUrl = window.location.href;
        await tryCopyShareUrl(shareUrl, 'common.copyShareLink');
      }
    } catch (error) {
      console.error('Error creating short link:', error);
      // Fallback to current URL
      const shareUrl = window.location.href;
      await tryCopyShareUrl(shareUrl, 'common.copyShareLink');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loadingCalculation')}</p>
        </div>
      </div>
    );
  }

  if (errorKey || !calculation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('common.calculationNotFound')}</h2>
          <p className="text-gray-600 mb-6">
            {errorKey ? t(errorKey) : t('common.errorNotFoundDescription')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            {t('common.createNewCalculation')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-white/80">{t('view.sharedTitle')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{t('common.calculationSummary')}</h2>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Share2 size={16} />
              {t('common.share')}
            </button>
          </div>
          
          {calculation.discountResult > 0 && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">{t('view.discount')} </span>
              <span className="font-medium">{new Intl.NumberFormat('id-ID').format(Math.round(calculation.discountResult))}</span>
            </div>
          )}
          
          {calculation.taxResult > 0 && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">{t('view.taxShipping')} </span>
              <span className="font-medium">{new Intl.NumberFormat('id-ID').format(Math.round(calculation.taxResult))}</span>
            </div>
          )}
          
          <div className="mb-2">
            <span className="text-sm text-gray-600">{t('view.totalBeforeAdjustments')} </span>
            <span className="font-medium">{new Intl.NumberFormat('id-ID').format(Math.round(calculation.overallTotal))}</span>
          </div>
        </div>

        <ResultsDisplay
          persons={calculation.persons}
          totalDiscount={calculation.discountResult}
          totalTax={calculation.taxResult}
          overallTotal={calculation.overallTotal}
          finalTotal={calculation.finalTotal}
          showDetails={true}
          onToggleDetails={() => {}}
          readOnly={true}
        />

        <div className="mt-6 text-center">
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            {t('view.backToCalculator')}
          </Link>
        </div>
      </div>
    </div>
  );
};
