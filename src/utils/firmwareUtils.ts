
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
      console.error('Error fetching burn count:', fetchError);
      throw fetchError;
    }
    
    // Calculate the new burn count
    const currentCount = data?.burn_count || 0;
    const newCount = currentCount + 1;
    
    // Update with the new burn count
    const { error } = await supabase
      .from('firmware')
      .update({ burn_count: newCount })
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
