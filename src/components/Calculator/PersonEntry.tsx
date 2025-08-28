import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import type { PersonEntry as PersonEntryType } from '../../types/calculator';

interface PersonEntryProps {
  person: PersonEntryType;
  index: number;
  onNameChange: (index: number, name: string) => void;
  onPriceChange: (index: number, price: string) => void;
  onClone: (index: number) => void;
  onDelete: (index: number) => void;
  onKeyPress: (e: React.KeyboardEvent, index: number) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const PersonEntry: React.FC<PersonEntryProps> = ({
  person,
  index,
  onNameChange,
  onPriceChange,
  onClone,
  onDelete,
  onKeyPress,
  inputRef,
}) => {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <input
        type="text"
        value={person.name}
        onChange={(e) => onNameChange(index, e.target.value)}
        placeholder={`Person_${index + 1}`}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      />
      
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={person.price}
          onChange={(e) => onPriceChange(index, e.target.value)}
          onKeyPress={(e) => onKeyPress(e, index)}
          placeholder="5000+7000"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
        
        <button
          onClick={() => onClone(index)}
          className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
          title="Clone entry"
        >
          <Copy size={16} />
        </button>
        
        <button
          onClick={() => onDelete(index)}
          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
          title="Delete entry"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};