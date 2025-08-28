import React from 'react';
import { formatNumber } from '../../utils/calculations';

interface DiscountInputProps {
  value: string;
  result: number;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const DiscountInput: React.FC<DiscountInputProps> = ({
  value,
  result,
  onChange,
  onKeyPress,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Disc: {formatNumber(result)}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="0"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      />
      <p className="text-xs text-gray-500">
        Masukan total disc / promo contoh 5000+7000
      </p>
    </div>
  );
};