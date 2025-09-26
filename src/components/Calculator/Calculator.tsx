import React, { useState, useRef, useCallback } from 'react';
import { Plus, Save, Share2, ArrowLeft, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { DiscountInput } from './DiscountInput';
import { TaxInput } from './TaxInput';
import { PersonEntry } from './PersonEntry';
import { ResultsDisplay } from './ResultsDisplay';
import type { PersonEntry as PersonEntryType } from '../../types/calculator';
import {
  parseAdditionString,
  formatNumber,
  calculatePersonTotal,
  calculateOverallTotal,
  calculateFinalTotal,
} from '../../utils/calculations';
import { saveCalculation, updateCalculation } from '../../services/calculationService';
import { createShortLink, getExistingShortLink } from '../../services/shortLinkService';

interface CalculatorProps {
  calculationId?: string;
  initialData?: {
    discountValue: string;
    discountResult: number;
    taxValue: string;
    taxResult: number;
    persons: PersonEntryType[];
    overallTotal: number;
    finalTotal: number;
  };
  readOnly?: boolean;
}

export const Calculator: React.FC<CalculatorProps> = ({ 
  calculationId, 
  initialData, 
  readOnly = false 
}) => {
  const navigate = useNavigate();
  const [discountValue, setDiscountValue] = useState('');
  const [taxValue, setTaxValue] = useState('');
  const [discountResult, setDiscountResult] = useState(0);
  const [taxResult, setTaxResult] = useState(0);
  const [persons, setPersons] = useState<PersonEntryType[]>(initialData?.persons || [
    { id: '1', name: '', price: '', totalPrice: 0, totalToPay: 0 }
  ]);
  const [showDetails, setShowDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCalculationId, setCurrentCalculationId] = useState(calculationId);

  const taxInputRef = useRef<HTMLInputElement>(null);
  const personInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleDiscountChange = useCallback((value: string) => {
    setDiscountValue(value);
    const result = parseAdditionString(value);
    setDiscountResult(result);
  }, []);

  const handleTaxChange = useCallback((value: string) => {
    setTaxValue(value);
    const result = parseAdditionString(value);
    setTaxResult(result);
  }, []);

  // Initialize with data if provided
  React.useEffect(() => {
    if (initialData) {
      setDiscountValue(initialData.discountValue);
      setDiscountResult(initialData.discountResult);
      setTaxValue(initialData.taxValue);
      setTaxResult(initialData.taxResult);
      setPersons(initialData.persons);
    }
  }, [initialData]);

  const updatePersonCalculations = useCallback((updatedPersons: PersonEntryType[]) => {
    const overallTotal = calculateOverallTotal(updatedPersons);
    
    const personsWithCalculations = updatedPersons.map(person => {
      const breakdown = calculatePersonTotal(
        person.totalPrice,
        overallTotal,
        discountResult,
        taxResult
      );
      
      return {
        ...person,
        totalToPay: breakdown.finalAmount,
      };
    });

    setPersons(personsWithCalculations);
  }, [discountResult, taxResult]);

  const handlePersonNameChange = useCallback((index: number, name: string) => {
    setPersons(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  }, []);

  const handlePersonPriceChange = useCallback((index: number, price: string) => {
    const totalPrice = parseAdditionString(price);
    
    setPersons(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], price, totalPrice };
      updatePersonCalculations(updated);
      return updated;
    });
  }, [updatePersonCalculations]);

  const addPerson = useCallback(() => {
    const newId = Date.now().toString();
    setPersons(prev => [
      ...prev,
      { id: newId, name: '', price: '', totalPrice: 0, totalToPay: 0 }
    ]);
  }, []);

  const clonePerson = useCallback((index: number) => {
    setPersons(prev => {
      const personToClone = prev[index];
      const newPerson = {
        ...personToClone,
        id: Date.now().toString(),
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, newPerson);
      updatePersonCalculations(updated);
      return updated;
    });
  }, [updatePersonCalculations]);

  const deletePerson = useCallback((index: number) => {
    if (persons.length > 1) {
      setPersons(prev => {
        const updated = prev.filter((_, i) => i !== index);
        updatePersonCalculations(updated);
        return updated;
      });
    }
  }, [persons.length, updatePersonCalculations]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, context: string, index = 0) => {
    if (e.key === 'Enter') {
      if (context === 'disc') {
        taxInputRef.current?.focus();
      } else if (context === 'tax') {
        const firstPersonRef = personInputRefs.current['0'];
        firstPersonRef?.focus();
      } else if (context === 'price') {
        const nextIndex = index + 1;
        if (nextIndex < persons.length) {
          const nextRef = personInputRefs.current[nextIndex.toString()];
          nextRef?.focus();
        } else {
          addPerson();
          setTimeout(() => {
            const newRef = personInputRefs.current[nextIndex.toString()];
            newRef?.focus();
          }, 100);
        }
      }
    }
  }, [persons.length, addPerson]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const calculationData = {
        discountValue,
        discountResult,
        taxValue,
        taxResult,
        persons,
        overallTotal,
        finalTotal,
      };

      if (currentCalculationId) {
        // Update existing calculation
        const success = await updateCalculation(currentCalculationId, calculationData);
        if (success) {
          alert('Calculation updated successfully!');
        } else {
          alert('Failed to update calculation');
        }
      } else {
        // Create new calculation
        const id = await saveCalculation(calculationData);
        if (id) {
          setCurrentCalculationId(id);
          // Navigate to the edit URL
          navigate(`/${id}/insert`);
          alert(`Calculation saved! Share this link: ${window.location.origin}/${id}`);
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
      let shortCode = await getExistingShortLink(currentCalculationId, 'basic');
      
      // Create new short link if doesn't exist
      if (!shortCode) {
        shortCode = await createShortLink(currentCalculationId, 'basic');
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
        const shareUrl = `${window.location.origin}/${currentCalculationId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Share link copied to clipboard!');
        }).catch(() => {
          alert(`Share this link: ${shareUrl}`);
        });
      }
    } catch (error) {
      console.error('Error creating short link:', error);
      // Fallback to regular link
      const shareUrl = `${window.location.origin}/${currentCalculationId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        alert(`Share this link: ${shareUrl}`);
      });
    }
  };

  const overallTotal = calculateOverallTotal(persons);
  const finalTotal = calculateFinalTotal(persons);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
      <div className="max-w-2xl mx-auto">
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
            {!readOnly && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            Nekolators
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 space-y-6">
          {!readOnly && (
            <>
              <DiscountInput
            value={discountValue}
            result={discountResult}
            onChange={handleDiscountChange}
            onKeyPress={(e) => handleKeyPress(e, 'disc')}
          />

          <TaxInput
            value={taxValue}
            result={taxResult}
            onChange={handleTaxChange}
            onKeyPress={(e) => handleKeyPress(e, 'tax')}
            inputRef={taxInputRef}
          />
            </>
          )}

          {!readOnly && (
            <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">
                Masukan harga /orang
              </h3>
            </div>

            {persons.map((person, index) => (
              <PersonEntry
                key={person.id}
                person={person}
                index={index}
                onNameChange={handlePersonNameChange}
                onPriceChange={handlePersonPriceChange}
                onClone={clonePerson}
                onDelete={deletePerson}
                onKeyPress={(e) => handleKeyPress(e, 'price', index)}
                inputRef={(el) => {
                  personInputRefs.current[index.toString()] = el;
                }}
              />
            ))}

            <div className="text-center">
              <p className="text-lg font-medium text-gray-600 mb-4">
                Total: {formatNumber(overallTotal)}
              </p>

              <button
                onClick={addPerson}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Add +
              </button>
            </div>
          </div>
          )}

        </div>

        <div className="mt-6">
          <ResultsDisplay
            persons={persons}
            totalDiscount={discountResult}
            totalTax={taxResult}
            overallTotal={overallTotal}
            finalTotal={finalTotal}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails(!showDetails)}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
};