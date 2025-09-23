import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { getExpertCalculation } from '../services/expertCalculationService';
import { ExpertResults } from './ExpertCalculator/ExpertResults';
import { calculateExpertTotals } from '../utils/expertCalculations';
import type { ExpertCalculationData } from '../services/expertCalculationService';

export const ViewExpertCalculation: React.FC = () => {
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

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      alert(`Share this link: ${shareUrl}`);
    });
  };

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
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Create New Calculation
          </Link>
        </div>
      </div>
    );
  }

  const totals = calculateExpertTotals(
    calculation.items,
    calculation.persons,
    calculation.assignments,
    calculation.discount,
    calculation.tax
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            Nekolators Expert
          </h1>
          <p className="text-white/80">Shared Calculation</p>
          {calculation.receiptData && (
            <div className="mt-2 text-sm text-white/60">
              Receipt: {calculation.receiptData.transaction_id} • {calculation.receiptData.transaction_date}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Calculation Summary</h2>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Items: </span>
              <span className="font-medium">{calculation.items.length}</span>
            </div>
            <div>
              <span className="text-gray-600">People: </span>
              <span className="font-medium">{calculation.persons.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Assignments: </span>
              <span className="font-medium">{calculation.assignments.length}</span>
            </div>
          </div>
          
          {calculation.discount > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Discount: </span>
              <span className="font-medium">{new Intl.NumberFormat('id-ID').format(Math.round(calculation.discount))}</span>
            </div>
          )}
          
          {calculation.tax > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Tax & Shipping: </span>
              <span className="font-medium">{new Intl.NumberFormat('id-ID').format(Math.round(calculation.tax))}</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Items</h3>
          <div className="space-y-3">
            {calculation.items.map((item) => {
              const assignedPersons = calculation.assignments
                .filter(a => a.itemId === item.id)
                .map(a => calculation.persons.find(p => p.id === a.personId))
                .filter(Boolean);

              return (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {new Intl.NumberFormat('id-ID').format(Math.round(item.price))} • {item.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignedPersons.length > 0 ? (
                      <div className="flex -space-x-1">
                        {assignedPersons.map((person) => (
                          <div
                            key={person!.id}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            style={{ backgroundColor: person!.color }}
                            title={person!.name || 'Unnamed Person'}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ExpertResults
          persons={calculation.persons}
          totals={totals}
          discount={calculation.discount}
          tax={calculation.tax}
        />

        <div className="mt-6 text-center">
          <Link
            to="/expert"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Expert Calculator
          </Link>
        </div>
      </div>
    </div>
  );
};