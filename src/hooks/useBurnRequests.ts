
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { 
  BurnRequest, 
  getBurnRequests,
  getBurnRequestById, 
  createBurnRequest, 
  claimBurnTask,
  updateBurnStatus
} from '@/utils/burnRequestUtils';

// For RPi-1 (Controller) - List and monitor burn requests
export function useBurnRequestList(
  status?: "pending" | "processing" | "completed" | "failed",
  limit = 10
) {
  const queryClient = useQueryClient();
  
  // Get all burn requests with the given status
  const {
    data: burnRequests,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['burnRequests', status, limit],
    queryFn: () => getBurnRequests(status, limit)
  });
  
  // Listen for realtime updates to burn requests
  useEffect(() => {
    const channel = supabase
      .channel('burn-requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'burn_requests' },
        (payload) => {
          console.log('Burn request changed:', payload);
          // Invalidate and refetch when changes occur
          queryClient.invalidateQueries({ queryKey: ['burnRequests'] });
          
          // If we're tracking a specific request, invalidate it as well
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ 
              queryKey: ['burnRequest', payload.new.id] 
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  // Create new burn request mutation
  const createRequest = useMutation({
    mutationFn: (params: { 
      firmwareId: string; 
      firmwareVersion: string; 
      deviceId: string; 
    }) => createBurnRequest(params.firmwareId, params.firmwareVersion, params.deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['burnRequests'] });
    }
  });
  
  return {
    burnRequests,
    isLoading,
    error,
    refetch,
    createRequest
  };
}

// For both RPis - Get details of a specific burn request
export function useBurnRequestDetails(requestId: string | null) {
  const queryClient = useQueryClient();
  
  // Get specific burn request details
  const {
    data: burnRequest,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['burnRequest', requestId],
    queryFn: () => requestId ? getBurnRequestById(requestId) : null,
    enabled: !!requestId
  });
  
  // Listen for realtime updates to this specific burn request
  useEffect(() => {
    if (!requestId) return;
    
    const channel = supabase
      .channel(`burn-request-${requestId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'burn_requests',
          filter: `id=eq.${requestId}`
        },
        (payload) => {
          console.log(`Burn request ${requestId} updated:`, payload);
          queryClient.invalidateQueries({ queryKey: ['burnRequest', requestId] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, queryClient]);
  
  return {
    burnRequest,
    isLoading,
    error,
    refetch
  };
}

// For RPi-2 (Burner) - Claim and process burn tasks
export function useBurnerWorkflow(burnerId: string) {
  const queryClient = useQueryClient();
  const [currentTask, setCurrentTask] = useState<BurnRequest | null>(null);
  
  // Claim a pending task
  const claimTask = useMutation({
    mutationFn: () => claimBurnTask(burnerId),
    onSuccess: (data) => {
      if (data) {
        setCurrentTask(data);
        queryClient.invalidateQueries({ queryKey: ['burnRequests'] });
      }
    }
  });
  
  // Update task status (to completed or failed)
  const updateTaskStatus = useMutation({
    mutationFn: (params: { 
      requestId: string; 
      status: "completed" | "failed"; 
      errorMessage?: string;
    }) => updateBurnStatus(params.requestId, params.status, burnerId, params.errorMessage),
    onSuccess: (data) => {
      if (data && data.status === 'completed' || data?.status === 'failed') {
        setCurrentTask(null);
      }
      queryClient.invalidateQueries({ queryKey: ['burnRequests'] });
      if (currentTask?.id) {
        queryClient.invalidateQueries({ queryKey: ['burnRequest', currentTask.id] });
      }
    }
  });
  
  return {
    currentTask,
    isClaiming: claimTask.isPending,
    isUpdating: updateTaskStatus.isPending,
    claimTask: () => claimTask.mutate(),
    completeTask: (requestId: string) => 
      updateTaskStatus.mutate({ requestId, status: 'completed' }),
    failTask: (requestId: string, errorMessage: string) => 
      updateTaskStatus.mutate({ requestId, status: 'failed', errorMessage })
  };
}
