
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Tag, Eye, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFirmware } from "@/hooks/useFirmware";
import type { Firmware } from "@/types/firmware";

const Versions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedFirmware, setSelectedFirmware] = useState<Firmware | null>(null);
  const { data: firmwareData, isLoading, error } = useFirmware();
  
  // Mock firmware content for the viewer
  const mockFirmwareContent = `
/* Device Controller Firmware v1.2.0
 * 
 * This firmware implements power management features for IoT devices.
 * Copyright (c) 2024 Firmware Beacon Inc.
 */

#include <stdio.h>
#include <stdlib.h>
#include "power_management.h"
#include "device_config.h"

#define VERSION "1.2.0-beta"
#define BUILD_DATE "2024-04-10"
#define MAX_POWER_LEVEL 100
#define MIN_POWER_LEVEL 5

// Global configuration
static device_config_t g_device_config;
static uint8_t g_power_level = DEFAULT_POWER_LEVEL;

void initialize_system(void) {
  // Initialize hardware
  power_management_init();
  
  // Load device configuration
  if (load_device_config(&g_device_config) != SUCCESS) {
    // Use defaults if loading fails
    set_default_configuration(&g_device_config);
  }
  
  // Set up power management based on configuration
  configure_power_management(g_device_config.power_mode, 
                            g_device_config.sleep_timeout);
                            
  printf("Firmware v%s initialized\\n", VERSION);
}

int main(void) {
  initialize_system();
  
  // Main processing loop
  while(1) {
    process_commands();
    update_power_state();
    
    if (should_enter_sleep_mode()) {
      enter_low_power_mode();
    }
  }
  
  // Should never reach here
  return 0;
}`;

  if (isLoading) {
    return (
      <MainLayout>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Loading firmware data...</p>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (error || !firmwareData) {
    return (
      <MainLayout>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64 flex-col gap-4">
              <p className="text-destructive">Error loading firmware data</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }
  
  const filteredFirmware = firmwareData
    .filter(fw => {
      // Apply status filter
      if (statusFilter !== "all" && fw.status !== statusFilter) {
        return false;
      }
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          fw.name.toLowerCase().includes(searchLower) ||
          fw.version.toLowerCase().includes(searchLower) ||
          (fw.description?.toLowerCase() || '').includes(searchLower) ||
          fw.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === "date") {
        return sortDirection === "desc" 
          ? b.dateUploaded.getTime() - a.dateUploaded.getTime()
          : a.dateUploaded.getTime() - b.dateUploaded.getTime();
      } else if (sortField === "name") {
        return sortDirection === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      } else if (sortField === "version") {
        return sortDirection === "desc"
          ? b.version.localeCompare(a.version)
          : a.version.localeCompare(b.version);
      } else if (sortField === "burnCount") {
        return sortDirection === "desc"
          ? b.burnCount - a.burnCount
          : a.burnCount - b.burnCount;
      }
      return 0;
    });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <MainLayout>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Firmware Version History</CardTitle>
          <CardDescription>
            Browse and manage all firmware versions in the repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search firmware..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0 w-full md:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 bg-muted/50 p-3 text-sm font-medium">
              <button 
                onClick={() => toggleSort("name")}
                className="col-span-3 flex items-center gap-1"
              >
                Name & Version
                {sortField === "name" && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </button>
              <div className="col-span-1">Status</div>
              <div className="col-span-3">Tags</div>
              <button 
                onClick={() => toggleSort("date")}
                className="col-span-2 flex items-center gap-1"
              >
                Date
                {sortField === "date" && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </button>
              <button 
                onClick={() => toggleSort("burnCount")}
                className="col-span-1 text-right flex items-center justify-end gap-1"
              >
                Burns
                {sortField === "burnCount" && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </button>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filteredFirmware.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No firmware versions found</p>
              </div>
            ) : (
              filteredFirmware.map((firmware) => (
                <div
                  key={firmware.id}
                  className="grid grid-cols-12 gap-4 p-3 text-sm items-center border-t hover:bg-slate-50"
                >
                  <div className="col-span-3">
                    <div className="font-medium">{firmware.name}</div>
                    <div className="text-muted-foreground">{firmware.version}</div>
                    <div className="text-xs text-muted-foreground truncate">{firmware.description}</div>
                  </div>

                  <div className="col-span-1">
                    <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      firmware.status === 'stable' 
                        ? 'bg-green-100 text-green-800' 
                        : firmware.status === 'beta'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {firmware.status}
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-wrap gap-1">
                    {firmware.tags.map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="col-span-2 text-muted-foreground">
                    {firmware.dateUploaded.toLocaleDateString()}
                  </div>

                  <div className="col-span-1 text-right">
                    {firmware.burnCount}
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedFirmware(firmware)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {selectedFirmware?.name} <span className="text-muted-foreground">{selectedFirmware?.version}</span>
                            <Badge variant="outline" className="ml-2">{selectedFirmware?.status}</Badge>
                          </DialogTitle>
                          <DialogDescription>
                            Uploaded on {selectedFirmware?.dateUploaded.toLocaleDateString()} • {(selectedFirmware?.size || 0) / 1024} KB • 
                            {selectedFirmware?.burnCount} device burns
                          </DialogDescription>
                        </DialogHeader>
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-96 font-mono text-sm">
                          <pre>{selectedFirmware?.content || mockFirmwareContent}</pre>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Versions;
