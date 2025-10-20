import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calculator, Star, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCalculations } from '../../services/calculationService';
import { getUserExpertCalculations } from '../../services/expertCalculationService';
import { formatNumber } from '../../utils/calculations';
import { useLanguage } from '../../lib/i18n';
import type { CalculationData } from '../../services/calculationService';
import type { ExpertCalculationData } from '../../services/expertCalculationService';

interface HistoryItem {
  id: string;
  type: 'basic' | 'expert';
  title: string;
  date: string;
  totalAmount: number;
  personsCount: number;
  data: CalculationData | ExpertCalculationData;
}

export const History: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'basic' | 'expert'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [basicCalculations, expertCalculations] = await Promise.all([
          getUserCalculations(),
          getUserExpertCalculations(),
        ]);

        const items: HistoryItem[] = [];

        // Process basic calculations
        basicCalculations.forEach((calc) => {
          items.push({
            id: calc.id,
            type: 'basic',
            title: `${t('history.basicCalculation')} - ${calc.persons[0]?.name || t('history.unnamed')}`,
            date: new Date().toISOString(), // We'll use created_at from the DB when available
            totalAmount: calc.finalTotal,
            personsCount: calc.persons.length,
            data: calc,
          });
        });

        // Process expert calculations
        expertCalculations.forEach((calc) => {
          items.push({
            id: calc.id,
            type: 'expert',
            title: `${t('history.expertCalculation')} - ${calc.persons[0]?.name || t('history.unnamed')}`,
            date: new Date().toISOString(), // We'll use created_at from the DB when available
            totalAmount: calc.finalTotal,
            personsCount: calc.persons.length,
            data: calc,
          });
        });

        // Sort by date (newest first)
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistoryItems(items);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, t]);

  const filteredItems = historyItems.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">{t('history.signInRequired')}</h2>
          <p className="text-white/80">{t('history.signInMessage')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('common.home')}</span>
          </Link>

          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Clock size={32} />
            {t('history.title')}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-orange-400 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t('history.allCalculations')} ({historyItems.length})
          </button>
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'basic'
                ? 'bg-orange-400 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t('history.basic')} ({historyItems.filter(item => item.type === 'basic').length})
          </button>
          <button
            onClick={() => setActiveTab('expert')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'expert'
                ? 'bg-orange-400 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t('history.expert')} ({historyItems.filter(item => item.type === 'expert').length})
          </button>
        </div>

        {/* History Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 mx-auto mb-4 text-white/50" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'all' ? t('history.noCalculations') : t('history.noCalculationsInCategory')}
            </h3>
            <p className="text-white/70 mb-6">
              {t('history.startCalculating')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
              >
                <Calculator size={20} />
                {t('home.basicCalculator')}
              </Link>
              <Link
                to="/expert"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors font-medium"
              >
                <Star size={20} />
                {t('home.expertMode')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.type === 'basic' ? (
                        <Calculator className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Star className="w-5 h-5 text-orange-400" />
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        item.type === 'basic'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {t(`history.${item.type}`)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{t('history.personsCount', { count: item.personsCount })}</span>
                      <span className="font-semibold text-gray-800">
                        {t('history.total')}: {formatNumber(item.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={item.type === 'basic' ? `/${item.id}` : `/expert/${item.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title={t('common.view')}
                    >
                      <Calculator size={18} />
                    </Link>
                    <Link
                      to={item.type === 'basic' ? `/${item.id}/insert` : `/expert/${item.id}/edit`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};