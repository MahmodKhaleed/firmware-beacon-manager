import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Firmware } from "@/types/firmware";
import { Download, Eye, Tag } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useInvalidateFirmware } from "@/hooks/useFirmware";

interface FirmwareItemProps {
  firmware: Firmware;
  mockFirmwareContent: string;
}

export const FirmwareItem = ({ firmware, mockFirmwareContent }: FirmwareItemProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { invalidateFirmwareById } = useInvalidateFirmware();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      if (!firmware.file_url) {
        toast({
          title: "Download failed",
          description: "This firmware file is not available for download.",
          variant: "destructive",
        });
        return;
      }
      
      // Get the file name from the URL
      const fileName = firmware.file_url.split('/').pop() || `${firmware.name}-${firmware.version}.bin`;
      
      // Use our new Edge Function to download the firmware and increment burn count in one go
      const downloadUrl = `https://tsdbnoghfmqbhihkpuum.supabase.co/functions/v1/download-firmware?id=${firmware.id}`;
      
      // Fetch the file from our Edge Function
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Download successful - show success toast
      toast({
        title: "Download started",
        description: `${firmware.name} v${firmware.version} is being downloaded.`,
      });
      
      // Since the Edge Function increments the burn count, we just need to invalidate the query
      invalidateFirmwareById(firmware.id);
      console.log('Query invalidated for firmware ID:', firmware.id);
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the firmware.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-3 text-sm items-center border-t hover:bg-slate-50">
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
        <Dialog open={isSelected} onOpenChange={setIsSelected}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {firmware.name} <span className="text-muted-foreground">{firmware.version}</span>
                <Badge variant="outline" className="ml-2">{firmware.status}</Badge>
              </DialogTitle>
              <DialogDescription>
                Uploaded on {firmware.dateUploaded.toLocaleDateString()} • {firmware.size / 1024} KB • 
                {firmware.burnCount} device burns
              </DialogDescription>
            </DialogHeader>
            {firmware.file_url ? (
              <div className="flex flex-col gap-4">
                <p>This firmware file is stored in Supabase Storage.</p>
                <Button onClick={handleDownload} className="w-full" disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download Firmware'}
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No preview available for this firmware file.
              </p>
            )}
          </DialogContent>
        </Dialog>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleDownload}
          disabled={!firmware.file_url || isDownloading}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Tag className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
