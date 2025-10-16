import React from 'react';
import { formatNumber } from '../../utils/calculations';
import { useLanguage } from '../../lib/i18n';

interface TaxInputProps {
  value: string;
  result: number;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const TaxInput: React.FC<TaxInputProps> = ({
  value,
  result,
  onChange,
  onKeyPress,
  inputRef,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {t('calculator.taxLabelWithValue', { value: formatNumber(result) })}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={t('calculator.taxPlaceholder')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      />
      <p className="text-xs text-gray-500">
        {t('calculator.taxHint')}
      </p>
    </div>
  );
};
