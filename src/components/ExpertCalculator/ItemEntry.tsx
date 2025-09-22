import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import type { Item } from '../../types/expert';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface ItemEntryProps {
  item: Item;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const ItemEntry: React.FC<ItemEntryProps> = ({
  item,
  onUpdate,
  onDelete,
  dragHandleProps,
}) => {
  const categoryColors = {
    food: 'bg-green-100 text-green-800',
    drink: 'bg-blue-100 text-blue-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 self-start sm:self-center"
      >
        <GripVertical size={16} />
      </div>
      
      <div className="flex-1 w-full space-y-2">
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, { name: e.target.value })}
          placeholder="Item name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-h-[40px]"
        />
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            value={item.price}
            onChange={(e) => onUpdate(item.id, { price: Number(e.target.value) || 0 })}
            placeholder="Price"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-h-[40px]"
          />
          
          <select
            value={item.category}
            onChange={(e) => onUpdate(item.id, { category: e.target.value as Item['category'] })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-h-[40px]"
          >
            <option value="food">Food</option>
            <option value="drink">Drink</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 w-full sm:w-auto">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
          {item.category}
        </span>
        
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};