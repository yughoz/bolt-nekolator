import React from 'react';
import { formatNumber } from '../../utils/calculations';

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
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Total Ongkir & tax: {formatNumber(result)}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="ongkir"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      />
      <p className="text-xs text-gray-500">
        Masukan pajak dan ongkir dan biaya lain contoh 5000+7000
      </p>
    </div>
  );
};