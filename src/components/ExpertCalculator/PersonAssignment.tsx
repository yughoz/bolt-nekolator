import React from 'react';
import type { Item, Person, Assignment } from '../../types/expert';

interface PersonAssignmentProps {
  items: Item[];
  persons: Person[];
  assignments: Assignment[];
  onToggleAssignment: (itemId: string, personId: string) => void;
}

export const PersonAssignment: React.FC<PersonAssignmentProps> = ({
  items,
  persons,
  assignments,
  onToggleAssignment,
}) => {
  const isAssigned = (itemId: string, personId: string) => {
    return assignments.some(a => a.itemId === itemId && a.personId === personId);
  };

  const getAssignedPersons = (itemId: string) => {
    return assignments
      .filter(a => a.itemId === itemId)
      .map(a => persons.find(p => p.id === a.personId))
      .filter(Boolean);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const assignedPersons = getAssignedPersons(item.id);
        
        return (
          <div key={item.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-800">
                  {item.name || 'Unnamed Item'}
                </h4>
                <p className="text-sm text-gray-600">
                  {new Intl.NumberFormat('id-ID').format(Math.round(item.price))}
                </p>
              </div>
              
              {assignedPersons.length > 0 && (
                <div className="flex -space-x-1">
                  {assignedPersons.map((person) => (
                    <div
                      key={person!.id}
                      className="w-6 h-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: person!.color }}
                      title={person!.name || `Person ${persons.indexOf(person!) + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {persons.map((person) => (
                <button
                  key={person.id}
                  onClick={() => onToggleAssignment(item.id, person.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors min-h-[40px] ${
                    isAssigned(item.id, person.id)
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: person.color }}
                  />
                  <span className="truncate">
                    {person.name || `Person ${persons.indexOf(person) + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Add items to start assigning them to people</p>
        </div>
      )}
    </div>
  );
};