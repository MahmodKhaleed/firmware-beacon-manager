
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Firmware } from "@/types/firmware";

export const useFirmware = () => {
  return useQuery({
    queryKey: ["firmware"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("firmware")
        .select("*")
        .order("date_uploaded", { ascending: false });

      if (error) throw error;

      // Convert snake_case DB fields to camelCase for UI
      return data.map((fw) => ({
        ...fw,
        dateUploaded: new Date(fw.date_uploaded || new Date()),
        burnCount: fw.burn_count || 0,
        tags: fw.tags || [],
      })) as Firmware[];
    },
  });
};

// Function to get a single firmware by ID
export const useFirmwareById = (id: string) => {
  return useQuery({
    queryKey: ["firmware", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("firmware")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        dateUploaded: new Date(data.date_uploaded || new Date()),
        burnCount: data.burn_count || 0,
        tags: data.tags || [],
      } as Firmware;
    },
    enabled: !!id,
  });
};
