import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getExpertCalculation } from '../services/expertCalculationService';
import { ExpertCalculator } from './ExpertCalculator/ExpertCalculator';
import type { ExpertCalculationData } from '../services/expertCalculationService';
import { useLanguage } from '../lib/i18n';

export const EditExpertCalculation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [calculation, setCalculation] = useState<ExpertCalculationData | null>(null);
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
        const data = await getExpertCalculation(id);
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
            to="/expert"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            {t('view.backToExpert')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ExpertCalculator
      calculationId={id}
      initialData={calculation}
    />
  );
};
