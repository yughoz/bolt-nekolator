import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import type { Item } from '../../types/expert';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useLanguage } from '../../lib/i18n';

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
  const { t } = useLanguage();

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-2"
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, { name: e.target.value })}
          placeholder={t('expert.itemNamePlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-h-[40px] mb-2"
        />

        <input
          type="number"
          value={item.price}
          onChange={(e) => onUpdate(item.id, { price: Number(e.target.value) || 0 })}
          placeholder={t('expert.itemPricePlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm min-h-[40px]"
        />
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
