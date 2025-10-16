import React, { useState, useCallback, useRef } from 'react';
import { Plus, Save, Share2, Trash2, GripVertical, ArrowLeft, Home } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ItemEntry } from './ItemEntry';
import { PersonAssignment } from './PersonAssignment';
import { ExpertResults } from './ExpertResults';
import type { Item, Person, Assignment } from '../../types/expert';
import { calculateExpertTotals } from '../../utils/expertCalculations';
import { saveExpertCalculation, updateExpertCalculation } from '../../services/expertCalculationService';
import type { ExpertCalculationData } from '../../services/expertCalculationService';
import { createShortLink, getExistingShortLink } from '../../services/shortLinkService';
import { parseAdditionString } from '../../utils/calculations';
import { Notification } from '../common/Notification';
import {
  downloadImageDataUrl,
  generateNodeImage,
  isMobileDevice,
  openWhatsAppShare,
  shareImageViaWebShare,
} from '../../utils/shareUtils';
import { useLanguage } from '../../lib/i18n';

interface ExpertCalculatorProps {
  calculationId?: string;
  initialData?: ExpertCalculationData;
}

export const ExpertCalculator: React.FC<ExpertCalculatorProps> = ({
  calculationId,
  initialData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Get initial data from receipt upload if available
  const locationData = location.state;
  const dataToUse = initialData || locationData;
  
  const [items, setItems] = useState<Item[]>(
    dataToUse?.items || [{ id: '1', name: '', price: 0, category: 'food' }]
  );
  const [persons, setPersons] = useState<Person[]>(
    dataToUse?.persons || [{ id: '1', name: '', color: '#8B5CF6' }]
  );
  const [assignments, setAssignments] = useState<Assignment[]>(dataToUse?.assignments || []);
  const [discountValue, setDiscountValue] = useState(() => {
    // If we have discountValue from data, use it; otherwise try to reconstruct from discount amount
    if (dataToUse?.discountValue) {
      return dataToUse.discountValue;
    } else if (dataToUse?.discount && dataToUse.discount > 0) {
      return dataToUse.discount.toString();
    }
    return '';
  });
  const [taxValue, setTaxValue] = useState(() => {
    // If we have taxValue from data, use it; otherwise try to reconstruct from tax amount
    if (dataToUse?.taxValue) {
      return dataToUse.taxValue;
    } else if (dataToUse?.tax && dataToUse.tax > 0) {
      return dataToUse.tax.toString();
    }
    return '';
  });
  const [discount, setDiscount] = useState(dataToUse?.discount || 0);
  const [tax, setTax] = useState(dataToUse?.tax || 0);
  const [receiptData, setReceiptData] = useState(dataToUse?.receiptData || null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCalculationId, setCurrentCalculationId] = useState(calculationId);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const notificationTimeoutRef = useRef<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, 4000);
  }, []);

  const handleNotificationClose = useCallback(() => {
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
    setNotification(null);
  }, []);

  const buildShareUrl = useCallback(async (calcId: string) => {
    let shortCode = await getExistingShortLink(calcId, 'expert');
    if (!shortCode) {
      shortCode = await createShortLink(calcId, 'expert');
    }
    return shortCode ? `${window.location.origin}/s/${shortCode}` : `${window.location.origin}/expert/${calcId}`;
  }, []);

  // Debug logging to see what data we're getting
  React.useEffect(() => {
    console.log('ExpertCalculator data debug:', {
      dataToUse,
      discountValue: dataToUse?.discountValue,
      taxValue: dataToUse?.taxValue,
      discount: dataToUse?.discount,
      tax: dataToUse?.tax
    });
  }, [dataToUse]);

  React.useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!currentCalculationId) {
      setShareUrl(null);
      return;
    }

    let isActive = true;
    const ensureShareLink = async () => {
      try {
        const url = await buildShareUrl(currentCalculationId);
        if (isActive) {
          setShareUrl(url);
        }
      } catch (error) {
        console.error('Failed to load expert short link:', error);
      }
    };

    ensureShareLink();

    return () => {
      isActive = false;
    };
  }, [currentCalculationId, buildShareUrl]);

  const addItem = useCallback(() => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: '',
      price: 0
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setAssignments(prev => prev.filter(assignment => assignment.itemId !== id));
  }, []);

  const addPerson = useCallback(() => {
    const colors = ['#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#F97316'];
    const newPerson: Person = {
      id: Date.now().toString(),
      name: '',
      color: colors[persons.length % colors.length]
    };
    setPersons(prev => [...prev, newPerson]);
  }, [persons.length]);

  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setPersons(prev => prev.map(person => 
      person.id === id ? { ...person, ...updates } : person
    ));
  }, []);

  const deletePerson = useCallback((id: string) => {
    if (persons.length > 1) {
      setPersons(prev => prev.filter(person => person.id !== id));
      setAssignments(prev => prev.filter(assignment => assignment.personId !== id));
    }
  }, [persons.length]);

  const toggleAssignment = useCallback((itemId: string, personId: string) => {
    setAssignments(prev => {
      const existingIndex = prev.findIndex(
        a => a.itemId === itemId && a.personId === personId
      );
      
      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        return [...prev, { itemId, personId }];
      }
    });
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  }, [items]);

  const totals = calculateExpertTotals(items, persons, assignments, discount, tax);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const calculationData: ExpertCalculationData = {
        items,
        persons,
        assignments,
        discountValue,
        taxValue,
        discount,
        tax,
        subtotal: totals.subtotal,
        finalTotal: totals.finalTotal,
        receiptData,
      };

      if (currentCalculationId) {
        // Update existing calculation
        const success = await updateExpertCalculation(currentCalculationId, calculationData);
        if (success) {
          const updatedShareUrl = await buildShareUrl(currentCalculationId);
          setShareUrl(updatedShareUrl);
          showNotification(t('common.calculationUpdated'));
        } else {
          showNotification(t('common.calculationUpdateFailed'), 'error');
        }
      } else {
        // Create new calculation
        const id = await saveExpertCalculation(calculationData);
        if (id) {
          // Update the current calculation ID so we can update instead of creating new ones
          setCurrentCalculationId(id);

          const newShareUrl = await buildShareUrl(id);
          setShareUrl(newShareUrl);
          showNotification(t('common.calculationSaved'));

          // Update URL without navigation to avoid reload
          window.history.replaceState(null, '', `/expert/${id}/edit`);
        } else {
          showNotification(t('common.calculationSaveFailed'), 'error');
        }
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      showNotification(t('common.calculationSaveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!currentCalculationId) {
      showNotification(t('common.pleaseSaveFirstShareLink'), 'error');
      return;
    }

    try {
      const shareLink = await buildShareUrl(currentCalculationId);
      setShareUrl(shareLink);

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(shareLink);
        } catch (error) {
          console.warn('Unable to copy share link automatically:', error);
        }
      }

      if (!resultsRef.current) {
        showNotification(t('common.resultsNotReady'), 'error');
        return;
      }

      const imageDataUrl = await generateNodeImage(resultsRef.current);
      if (!imageDataUrl) {
        showNotification(t('common.failedGenerateImage'), 'error');
        return;
      }

      const filename = 'nekolators-expert-results.png';
      const shareText = shareLink
        ? t('expert.shareMessageWithLink', { link: shareLink })
        : t('expert.shareMessage');
      const shared = await shareImageViaWebShare(imageDataUrl, filename, shareText);

      if (shared) {
        showNotification(t('common.shareSheetOpened'));
        return;
      }

      if (isMobileDevice()) {
        openWhatsAppShare(shareText);
        downloadImageDataUrl(imageDataUrl, filename);
        showNotification(t('common.whatsappShareOpened'));
        return;
      }

      downloadImageDataUrl(imageDataUrl, filename);
      showNotification(t('common.resultsDownloaded'));
    } catch (error) {
      console.error('Error sharing expert calculation:', error);
      showNotification(t('common.failedShare'), 'error');
    }
  };

  const handleCopyShareUrl = useCallback(async () => {
    if (!shareUrl) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showNotification(t('common.copyShareLink'));
        return;
      } catch {
        showNotification(t('common.unableToCopy'), 'error');
        return;
      }
    }

    showNotification(t('common.clipboardUnavailable'), 'error');
  }, [shareUrl, showNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      {notification && (
        <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
          <div className="pointer-events-auto">
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={handleNotificationClose}
            />
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} />
            <Home size={20} />
            <span className="hidden sm:inline">{t('common.home')}</span>
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            <span className="hidden sm:inline">
                {isSaving
                  ? t('common.saving')
                  : currentCalculationId
                  ? t('common.update')
                  : t('common.save')}
            </span>
          </button>
          
          <button
            onClick={handleShare}
              disabled={!currentCalculationId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Share2 size={16} />
              <span className="hidden sm:inline">{t('common.share')}</span>
          </button>
        </div>
      </div>
      {shareUrl && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md bg-white/10 px-4 py-3 text-white">
            <span className="text-sm font-semibold">{t('common.shareLinkLabel')}</span>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-full truncate font-mono text-sm underline-offset-2 hover:underline"
            >
              {shareUrl}
            </a>
            <button
              onClick={handleCopyShareUrl}
              className="rounded-md bg-white/20 px-3 py-1 text-sm font-semibold transition-colors hover:bg-white/30"
            >
              {t('common.copy')}
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            {t('expert.title')}
          </h1>
          <p className="text-white/80">
            {receiptData
              ? t('expert.receiptLabel', { id: receiptData.transaction_id })
              : currentCalculationId
              ? t('expert.editingSaved')
              : t('expert.dragAndAssign')}
          </p>
          {receiptData && (
            <div className="mt-2 text-sm text-white/60">
              {t('expert.receiptMeta', {
                date: receiptData.transaction_date,
                customer: receiptData.customer_name,
              })}
            </div>
          )}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Section */}
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{t('expert.itemsTitle')}</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm min-h-[40px]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">{t('common.addItem')}</span>
                <span className="sm:hidden">{t('common.add')}</span>
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <ItemEntry
                              item={item}
                              onUpdate={updateItem}
                              onDelete={deleteItem}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Discount and Tax */}
            <div className="mt-6 space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('expert.discountLabel', {
                    value: new Intl.NumberFormat('id-ID').format(Math.round(discount)),
                  })}
                </label>
                <input
                  type="text"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value);
                    const result = parseAdditionString(e.target.value);
                    setDiscount(result);
                  }}
                  placeholder="10000+5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[40px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('expert.discountHint')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('expert.taxLabel', {
                    value: new Intl.NumberFormat('id-ID').format(Math.round(tax)),
                  })}
                </label>
                <input
                  type="text"
                  value={taxValue}
                  onChange={(e) => {
                    setTaxValue(e.target.value);
                    const result = parseAdditionString(e.target.value);
                    setTax(result);
                  }}
                  placeholder="7000+3000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[40px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('expert.taxHint')}
                </p>
              </div>
            </div>
          </div>

          {/* People Section */}
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{t('expert.peopleTitle')}</h3>
              <button
                onClick={addPerson}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm min-h-[40px]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">{t('common.addPerson')}</span>
                <span className="sm:hidden">{t('common.add')}</span>
              </button>
            </div>

            <div className="space-y-3">
              {persons.map((person, index) => (
                <div key={person.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg min-h-[56px]">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: person.color }}
                  />
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                    placeholder={t('expert.personPlaceholder', { index: index + 1 })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[40px]"
                  />
                  <button
                    onClick={() => deletePerson(person.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Section */}
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('expert.assignmentsTitle')}</h3>
            <PersonAssignment
              items={items}
              persons={persons}
              assignments={assignments}
              onToggleAssignment={toggleAssignment}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 px-2 sm:px-0">
          <ExpertResults
            ref={resultsRef}
            persons={persons}
            totals={totals}
            discount={discount}
            tax={tax}
          />
        </div>
      </div>
    </div>
  );
};
