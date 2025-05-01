
import { supabase } from "@/integrations/supabase/client";

/**
 * Increments the burn count for a specific firmware by ID
 * @param firmwareId The ID of the firmware to increment
 * @returns A promise that resolves when the operation is complete
 */
export const incrementBurnCount = async (firmwareId: string): Promise<void> => {
  try {
    // Use a PostgreSQL expression to atomically increment the burn count
    const { error } = await supabase
      .from('firmware')
      .update({ 
        burn_count: `COALESCE(burn_count, 0) + 1`
      })
      .eq('id', firmwareId);
    
    if (error) {
      console.error('Error incrementing burn count:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to increment burn count:', error);
    throw error;
  }
};
