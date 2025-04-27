
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FirmwareSearch } from "@/components/firmware/FirmwareSearch";
import { FirmwareList } from "@/components/firmware/FirmwareList";
import { useFirmwareList } from "@/hooks/useFirmwareList";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

const Versions = () => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    toggleSort,
    filteredFirmware,
    isLoading,
    error
  } = useFirmwareList();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view firmware versions");
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Component will redirect in useEffect
  }

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

  if (error) {
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
          <FirmwareSearch
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
          />
          
          <FirmwareList 
            firmware={filteredFirmware}
            sortField={sortField}
            onSort={toggleSort}
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Versions;
