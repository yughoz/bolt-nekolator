import React from 'react';
import { Calculator, Users, Share2, Save, Sparkles, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-orange-400 mb-4">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2">
            {t('home.heroSubtitle')}
          </p>
          <p className="text-lg text-white/70">
            {t('home.heroDescription')}
          </p>
        </div>

        {/* Calculator Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl w-full">
          {/* Basic Calculator */}
          <Link
            to="/calculator"
            className="group relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
              <div className="text-center">
                <Calculator size={60} className="text-purple-600 group-hover:text-purple-700 transition-colors mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('home.basicCalculator')}</h3>
                <p className="text-gray-600">{t('home.basicCalculatorDescription')}</p>
              </div>
            </div>
          </Link>

          {/* Expert Calculator */}
          <Link
            to="/upload"
            className="group relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
              <div className="text-center">
                <div className="relative">
                  <Calculator size={60} className="text-purple-600 group-hover:text-purple-700 transition-colors mx-auto mb-4" />
                  <Sparkles size={24} className="text-orange-400 absolute -top-2 -right-2" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('home.expertMode')}</h3>
                <p className="text-gray-600">{t('home.expertModeDescription')}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300">
            <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('home.multiplePeopleTitle')}</h3>
            <p className="text-white/80">{t('home.multiplePeopleDescription')}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300">
            <Save className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('home.saveEditTitle')}</h3>
            <p className="text-white/80">{t('home.saveEditDescription')}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300">
            <Share2 className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('home.easySharingTitle')}</h3>
            <p className="text-white/80">{t('home.easySharingDescription')}</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-16 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white mb-6">{t('home.howItWorksTitle')}</h2>
          <div className="space-y-4 text-white/80">
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <p>{t('home.stepOne')}</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <p>{t('home.stepTwo')}</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <p>{t('home.stepThree')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
