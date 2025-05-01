
import { supabase } from "@/integrations/supabase/client";

/**
 * Increments the burn count for a specific firmware by ID
 * @param firmwareId The ID of the firmware to increment
 * @returns A promise that resolves when the operation is complete
 */
export const incrementBurnCount = async (firmwareId: string): Promise<void> => {
  try {
    // Using a type assertion since the RPC function is not included in the auto-generated types
    const { error } = await supabase.rpc('increment_firmware_burn_count', { 
      firmware_id: firmwareId 
    } as any);
    
    if (error) {
      console.error('Error incrementing burn count:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to increment burn count:', error);
    throw error;
  }
};
