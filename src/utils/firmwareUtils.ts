
import { supabase } from "@/integrations/supabase/client";

/**
 * Increments the burn count for a specific firmware by ID
 * @param firmwareId The ID of the firmware to increment
 * @returns A promise that resolves when the operation is complete
 */
export const incrementBurnCount = async (firmwareId: string): Promise<void> => {
  try {
    console.log('Calling increment_firmware_burn_count RPC with firmware ID:', firmwareId);
    
    // Use the correct parameter name 'firmware_id' as per the updated function signature
    const { data, error } = await supabase.rpc(
      'increment_firmware_burn_count', 
      { firmware_id: firmwareId }
    );
    
    if (error) {
      console.error('Error calling increment_firmware_burn_count RPC:', error);
      throw error;
    }
    
    console.log('Successfully incremented burn count for firmware:', firmwareId);
  } catch (error) {
    console.error('Failed to increment burn count:', error);
    throw error;
  }
};
