
import { supabase } from "@/integrations/supabase/client";

/**
 * Increments the burn count for a specific firmware by ID
 * @param firmwareId The ID of the firmware to increment
 * @returns A promise that resolves when the operation is complete
 */
export const incrementBurnCount = async (firmwareId: string): Promise<void> => {
  try {
    // First get the current burn count
    const { data, error: fetchError } = await supabase
      .from('firmware')
      .select('burn_count')
      .eq('id', firmwareId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current burn count:', fetchError);
      throw fetchError;
    }
    
    const currentBurnCount = data.burn_count || 0;
    
    // Then update with incremented value
    const { error: updateError } = await supabase
      .from('firmware')
      .update({ burn_count: currentBurnCount + 1 })
      .eq('id', firmwareId);
    
    if (updateError) {
      console.error('Error incrementing burn count:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Failed to increment burn count:', error);
    throw error;
  }
};
