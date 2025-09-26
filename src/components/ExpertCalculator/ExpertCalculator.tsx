import React, { useState, useCallback } from 'react';
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
  const [discountValue, setDiscountValue] = useState(dataToUse?.discountValue || '');
  const [taxValue, setTaxValue] = useState(dataToUse?.taxValue || '');
  const [discount, setDiscount] = useState(dataToUse?.discount || 0);
  const [tax, setTax] = useState(dataToUse?.tax || 0);
  const [receiptData, setReceiptData] = useState(dataToUse?.receiptData || null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCalculationId, setCurrentCalculationId] = useState(calculationId);

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

  const addItem = useCallback(() => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      category: 'food'
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
          alert('Calculation updated successfully!');
        } else {
          alert('Failed to update calculation');
        }
      } else {
        // Create new calculation
        const id = await saveExpertCalculation(calculationData);
        if (id) {
          setCurrentCalculationId(id);
          // Update the URL without full navigation to avoid component remount
          window.history.replaceState(null, '', `/expert/${id}/edit`);
          alert(`Calculation saved! Share this link: ${window.location.origin}/expert/${id}`);
        } else {
          alert('Failed to save calculation');
        }
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Failed to save calculation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    handleShareWithShortLink();
  };

  const handleShareWithShortLink = async () => {
    if (!currentCalculationId) {
      alert('Please save the calculation first to get a share link');
      return;
    }

    try {
      // Check if short link already exists
      let shortCode = await getExistingShortLink(currentCalculationId, 'expert');
      
      // Create new short link if doesn't exist
      if (!shortCode) {
        shortCode = await createShortLink(currentCalculationId, 'expert');
      }

      if (shortCode) {
        const shareUrl = `${window.location.origin}/s/${shortCode}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Short link copied to clipboard!');
        }).catch(() => {
          alert(`Share this link: ${shareUrl}`);
        });
      } else {
        // Fallback to regular link
        const shareUrl = `${window.location.origin}/expert/${currentCalculationId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Share link copied to clipboard!');
        }).catch(() => {
          alert(`Share this link: ${shareUrl}`);
        });
      }
    } catch (error) {
      console.error('Error creating short link:', error);
      // Fallback to regular link
      const shareUrl = `${window.location.origin}/expert/${currentCalculationId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        alert(`Share this link: ${shareUrl}`);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} />
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              <span className="hidden sm:inline">
                {isSaving ? 'Saving...' : currentCalculationId ? 'Update' : 'Save'}
              </span>
            </button>
            
            <button
              onClick={handleShare}
              disabled={!currentCalculationId}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            Expert Calculator
          </h1>
          <p className="text-white/80">
            {receiptData ? `Receipt: ${receiptData.transaction_id}` : currentCalculationId ? 'Editing saved calculation' : 'Drag & drop items and assign to people'}
          </p>
          {receiptData && (
            <div className="mt-2 text-sm text-white/60">
              {receiptData.transaction_date} • {receiptData.customer_name}
            </div>
          )}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Section */}
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Items</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm min-h-[40px]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Item</span>
                <span className="sm:hidden">Add</span>
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
                  Total Discount: {new Intl.NumberFormat('id-ID').format(Math.round(discount))}
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
                  Enter discount amounts like 10000+5000
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax & Shipping: {new Intl.NumberFormat('id-ID').format(Math.round(tax))}
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
                  Enter tax and shipping like 7000+3000
                </p>
              </div>
            </div>
          </div>

          {/* People Section */}
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">People</h3>
              <button
                onClick={addPerson}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm min-h-[40px]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Person</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {persons.map((person) => (
                <div key={person.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg min-h-[56px]">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: person.color }}
                  />
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                    placeholder={`Person ${persons.indexOf(person) + 1}`}
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Assignments</h3>
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