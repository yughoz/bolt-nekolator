import { supabase } from '../lib/supabase';

export interface ShortLink {
  id: number;
  short_code: string;
  calculation_type: 'basic' | 'expert';
  calculation_id: string;
  created_at: string;
}

// Convert number to base-36
const toBase36 = (num: number): string => {
  return num.toString(36);
};

// Convert base-36 string to number
const fromBase36 = (str: string): number => {
  return parseInt(str, 36);
};

export const createShortLink = async (
  calculationId: string,
  calculationType: 'basic' | 'expert'
): Promise<string | null> => {
  try {
    // First insert without short_code
    const { data: result, error } = await supabase
      .from('short_links')
      .insert({
        calculation_type: calculationType,
        calculation_id: calculationId,
        short_code: 'temp', // Temporary value
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating short link:', error);
      return null;
    }

    // Generate short code from the auto-increment ID
    const shortCode = toBase36(result.id);

    // Update the record with the actual short code
    const { error: updateError } = await supabase
      .from('short_links')
      .update({ short_code: shortCode })
      .eq('id', result.id);

    if (updateError) {
      // Handle unique constraint violation
      if (updateError.code === '23505') { // Unique constraint violation
        // Check if there's an existing short link with this short code
        const { data: existingLink, error: queryError } = await supabase
          .from('short_links')
          .select('calculation_id, calculation_type')
          .eq('short_code', shortCode)
          .single();

        if (!queryError && existingLink) {
          // If it's for the same calculation, delete our temporary entry and return the existing short code
          if (existingLink.calculation_id === calculationId && existingLink.calculation_type === calculationType) {
            await supabase
              .from('short_links')
              .delete()
              .eq('id', result.id);
            return shortCode;
          }
        }
      }
      console.error('Error updating short code:', updateError);
      return null;
    }

    return shortCode;
  } catch (error) {
    console.error('Error creating short link:', error);
    return null;
  }
};

export const resolveShortLink = async (shortCode: string): Promise<{
  calculationType: 'basic' | 'expert';
  calculationId: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('short_links')
      .select('calculation_type, calculation_id')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      console.error('Error resolving short link:', error);
      return null;
    }

    return {
      calculationType: data.calculation_type,
      calculationId: data.calculation_id,
    };
  } catch (error) {
    console.error('Error resolving short link:', error);
    return null;
  }
};

export const getExistingShortLink = async (
  calculationId: string,
  calculationType: 'basic' | 'expert'
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('short_links')
      .select('short_code')
      .eq('calculation_id', calculationId)
      .eq('calculation_type', calculationType)
      .single();

    if (error || !data) {
      return null;
    }

    return data.short_code;
  } catch (error) {
    return null;
  }
};