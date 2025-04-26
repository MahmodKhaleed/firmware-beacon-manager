
import { useState } from 'react';
import { useFirmware } from './useFirmware';
import type { Firmware } from '@/types/firmware';

export const useFirmwareList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  
  const { data: firmwareData, isLoading, error } = useFirmware();

  const filteredFirmware = firmwareData
    ? firmwareData.filter(fw => {
        if (statusFilter !== "all" && fw.status !== statusFilter) {
          return false;
        }
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            fw.name.toLowerCase().includes(searchLower) ||
            fw.version.toLowerCase().includes(searchLower) ||
            (fw.description?.toLowerCase() || "").includes(searchLower) ||
            fw.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          return sortDirection === "desc" 
            ? b.dateUploaded.getTime() - a.dateUploaded.getTime()
            : a.dateUploaded.getTime() - b.dateUploaded.getTime();
        } else if (sortField === "name") {
          return sortDirection === "desc"
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        } else if (sortField === "burnCount") {
          return sortDirection === "desc"
            ? b.burnCount - a.burnCount
            : a.burnCount - b.burnCount;
        }
        return 0;
      })
    : [];

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    toggleSort,
    filteredFirmware,
    isLoading,
    error
  };
};
