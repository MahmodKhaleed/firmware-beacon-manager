
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type BurnRequest = {
  id: string;
  firmwareId: string;
  firmwareVersion: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
  initiatedBy: string;
  completedBy: string | null;
  errorMessage: string | null;
};

// Convert DB row to client model
export const mapBurnRequest = (row: any): BurnRequest => ({
  id: row.id,
  firmwareId: row.firmware_id,
  firmwareVersion: row.firmware_version,
  status: row.status,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  initiatedBy: row.initiated_by,
  completedBy: row.completed_by,
  errorMessage: row.error_message
});

// For RPi-1 (Controller) - Create a new burn request
export const createBurnRequest = async (firmwareId: string, firmwareVersion: string, deviceId: string): Promise<string | null> => {
  try {
    console.log('Creating burn request for firmware:', firmwareId, firmwareVersion);
    
    const { data, error } = await supabase.rpc(
      'request_firmware_burn',
      { 
        fw_id: firmwareId, 
        fw_version: firmwareVersion, 
        initiator: deviceId 
      }
    );
    
    if (error) {
      console.error('Error creating burn request:', error);
      throw error;
    }
    
    console.log('Burn request created with ID:', data);
    return data;
  } catch (error) {
    console.error('Failed to create burn request:', error);
    return null;
  }
};

// For RPi-2 (Burner) - Claim the next pending burn task
export const claimBurnTask = async (burnerId: string): Promise<BurnRequest | null> => {
  try {
    console.log('Claiming next pending burn task as:', burnerId);
    
    const { data, error } = await supabase.rpc(
      'claim_burn_task',
      { burner_id: burnerId }
    );
    
    if (error) {
      console.error('Error claiming burn task:', error);
      throw error;
    }
    
    // Function returns an array with a single element or empty array
    if (data && data.length > 0) {
      console.log('Claimed burn task:', data[0]);
      return mapBurnRequest(data[0]);
    } else {
      console.log('No pending burn tasks available');
      return null;
    }
  } catch (error) {
    console.error('Failed to claim burn task:', error);
    return null;
  }
};

// For RPi-2 (Burner) - Update burn status
export const updateBurnStatus = async (
  requestId: string, 
  newStatus: "completed" | "failed", 
  burnerId: string,
  errorMessage?: string
): Promise<BurnRequest | null> => {
  try {
    console.log(`Updating burn request ${requestId} to ${newStatus}`);
    
    const { data, error } = await supabase.rpc(
      'update_burn_status',
      { 
        request_id: requestId, 
        new_status: newStatus, 
        burner_id: burnerId,
        error_msg: errorMessage || null
      }
    );
    
    if (error) {
      console.error('Error updating burn status:', error);
      throw error;
    }
    
    // Function returns an array with a single element or empty array
    if (data && data.length > 0) {
      console.log('Updated burn task status:', data[0]);
      return mapBurnRequest(data[0]);
    } else {
      console.log('No burn task updated');
      return null;
    }
  } catch (error) {
    console.error('Failed to update burn status:', error);
    return null;
  }
};

// Get burn request by ID
export const getBurnRequestById = async (requestId: string): Promise<BurnRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('burn_requests')
      .select('*')
      .eq('id', requestId)
      .single();
      
    if (error) throw error;
    return data ? mapBurnRequest(data) : null;
  } catch (error) {
    console.error('Error getting burn request by ID:', error);
    return null;
  }
};

// Get all burn requests with optional filters
export const getBurnRequests = async (
  status?: "pending" | "processing" | "completed" | "failed",
  limit = 10
): Promise<BurnRequest[]> => {
  try {
    let query = supabase.from('burn_requests').select('*').order('created_at', { ascending: false }).limit(limit);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data ? data.map(mapBurnRequest) : [];
  } catch (error) {
    console.error('Error getting burn requests:', error);
    return [];
  }
};
