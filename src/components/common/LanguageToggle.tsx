import React from 'react';
import { useLanguage } from '../../lib/i18n';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (value: 'en' | 'id') => {
    if (language !== value) {
      setLanguage(value);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex overflow-hidden rounded-full bg-white/90 text-sm font-semibold shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={() => handleChange('en')}
          className={`px-3 py-2 transition-colors ${
            language === 'en'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-purple-100'
          }`}
          aria-pressed={language === 'en'}
          aria-label={t('language.english')}
        >
          {t('common.englishShort')}
        </button>
        <button
          type="button"
          onClick={() => handleChange('id')}
          className={`px-3 py-2 transition-colors ${
            language === 'id'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-purple-100'
          }`}
          aria-pressed={language === 'id'}
          aria-label={t('language.indonesian')}
        >
          {t('common.indonesianShort')}
        </button>
      </div>
    </div>
  );
};

