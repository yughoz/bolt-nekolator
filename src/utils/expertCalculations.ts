import type { Item, Person, Assignment, ExpertTotals } from '../types/expert';

export const calculateExpertTotals = (
  items: Item[],
  persons: Person[],
  assignments: Assignment[],
  discount: number,
  tax: number
): ExpertTotals => {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate how much each person owes for items
  const personItemTotals: Record<string, number> = {};
  
  persons.forEach(person => {
    personItemTotals[person.id] = 0;
  });
  
  items.forEach(item => {
    const assignedPersons = assignments.filter(a => a.itemId === item.id);
    if (assignedPersons.length > 0) {
      const pricePerPerson = item.price / assignedPersons.length;
      assignedPersons.forEach(assignment => {
        personItemTotals[assignment.personId] += pricePerPerson;
      });
    }
  });
  
  // Calculate proportional discount and tax for each person
  const personTotals: Record<string, number> = {};
  
  persons.forEach(person => {
    const itemTotal = personItemTotals[person.id];
    const proportion = subtotal > 0 ? itemTotal / subtotal : 0;
    
    const personDiscount = proportion * discount;
    const personTax = proportion * tax;
    
    personTotals[person.id] = itemTotal - personDiscount + personTax;
  });
  
  const finalTotal = subtotal - discount + tax;
  
  return {
    subtotal,
    finalTotal,
    personTotals,
    personItemTotals,
  };
};