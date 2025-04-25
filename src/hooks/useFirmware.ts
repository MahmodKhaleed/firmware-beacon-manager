
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

      return data.map((fw) => ({
        ...fw,
        dateUploaded: new Date(fw.date_uploaded),
      })) as Firmware[];
    },
  });
};
