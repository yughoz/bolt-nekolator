import { pb } from '../lib/pocketbase';
import type { ShortLink } from '../lib/pocketbase';

// Generate random short code
const generateShortCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createShortLink = async (
  calculationId: string,
  calculationType: 'basic' | 'expert'
): Promise<string | null> => {
  try {
    // Try to generate a unique short code
    let shortCode = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const record = await pb.collection('bolt_short_links').create<ShortLink>({
          code: shortCode,
          target_type: calculationType,
          calculation_id: calculationId,
        });

        console.log('Successfully created short link:', shortCode);
        return shortCode;
      } catch (error: any) {
        // If code already exists, try again with a new code
        if (error.status === 400 && error.data?.data?.code?.code === 'validation_not_unique') {
          attempts++;
          shortCode = generateShortCode();
          continue;
        }
        throw error;
      }
    }

    console.error('Failed to generate unique short code after', maxAttempts, 'attempts');
    return null;
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
    const data = await pb.collection('bolt_short_links').getFirstListItem<ShortLink>(`code="${shortCode}"`);

    return {
      calculationType: data.target_type as 'basic' | 'expert',
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
    const data = await pb.collection('bolt_short_links').getFirstListItem<ShortLink>(
      `calculation_id="${calculationId}" && target_type="${calculationType}"`
    );

    return data.code;
  } catch (error) {
    return null;
  }
};
