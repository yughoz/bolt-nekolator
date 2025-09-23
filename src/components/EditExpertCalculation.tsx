import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getExpertCalculation } from '../services/expertCalculationService';
import { ExpertCalculator } from './ExpertCalculator/ExpertCalculator';
import type { ExpertCalculationData } from '../services/expertCalculationService';

export const EditExpertCalculation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [calculation, setCalculation] = useState<ExpertCalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!id) {
        setError('No calculation ID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await getExpertCalculation(id);
        if (data) {
          setCalculation(data);
        } else {
          setError('Calculation not found');
        }
      } catch (err) {
        setError('Failed to load calculation');
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
          <p className="text-gray-600">Loading calculation...</p>
        </div>
      </div>
    );
  }

  if (error || !calculation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculation Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The calculation you\'re looking for doesn\'t exist.'}</p>
          <Link
            to="/expert"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Expert Calculator
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