import { supabase } from '../lib/supabase';

export interface ShortLink {
  id: number;
  short_code: string;
  calculation_type: 'basic' | 'expert';
  calculation_id: string;
  created_at: string;
}

export const createShortLink = async (
  calculationId: string,
  calculationType: 'basic' | 'expert'
): Promise<string | null> => {
  try {
    // Ensure we return the same code if a short link already exists for this calculation
    const existingShortLink = await getExistingShortLink(calculationId, calculationType);
    if (existingShortLink) {
      return existingShortLink;
    }

    const { data: reserved, error: reserveError } = await supabase.rpc('reserve_short_link').single();
    if (reserveError || !reserved) {
      console.error('Error reserving short link id:', reserveError);
      return null;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('short_links')
      .insert({
        id: reserved.id,
        calculation_type: calculationType,
        calculation_id: calculationId,
        short_code: reserved.short_code,
      })
      .select('short_code')
      .single();

    if (insertError || !inserted) {
      console.error('Error inserting short link:', insertError);
      return null;
    }

    return inserted.short_code;
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
      .maybeSingle();

    if (error) {
      console.error('Database error resolving short link:', error);
      return null;
    }

    if (!data) {
      console.log('Short link not found:', shortCode);
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
      .select('id, short_code')
      .eq('calculation_id', calculationId)
      .eq('calculation_type', calculationType)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    if (data.short_code.startsWith('temp-') && data.id) {
      const fallbackCode = data.id.toString(36);
      const { data: updated, error: updateError } = await supabase
        .from('short_links')
        .update({ short_code: fallbackCode })
        .eq('id', data.id)
        .select('short_code')
        .single();

      if (!updateError && updated?.short_code) {
        return updated.short_code;
      }

      if (updateError) {
        console.warn('Failed to normalize legacy short code:', updateError);
      }

      return fallbackCode;
    }

    return data.short_code;
  } catch (error) {
    return null;
  }
};
