
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

type FirmwareStatus = "stable" | "beta" | "draft";

export interface FirmwareFormData {
  name: string;
  version: string;
  description: string;
  status: FirmwareStatus;
  tags: string[];
}

export const useFirmwareUpload = () => {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.hex', '.exe', '.elf', '.bin'];
      const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      if (hasValidExtension) {
        setSelectedFile(file);
      } else {
        uiToast({
          title: "Invalid file type",
          description: "Please select a valid firmware file (.hex, .exe, .elf, or .bin)",
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  const uploadFirmware = async (formData: FirmwareFormData) => {
    if (!selectedFile) {
      uiToast({
        title: "No file selected",
        description: "Please select a firmware file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.version) {
      uiToast({
        title: "Missing information",
        description: "Please provide a name and version",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    console.log('Starting firmware upload process...'); // Debug log
    
    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      const base64Content = btoa(
        new Uint8Array(fileBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte), 
          ''
        )
      );
      
      console.log('File content processed, size:', fileBuffer.byteLength); // Debug log
      
      const firmwareData = {
        name: formData.name,
        version: formData.version,
        description: formData.description || null,
        size: selectedFile.size,
        status: formData.status,
        tags: formData.tags,
        content: base64Content,
        date_uploaded: new Date().toISOString(),
        burn_count: 0,
      };
      
      console.log('Sending firmware data to Supabase...'); // Debug log
      
      const { data, error } = await supabase
        .from('firmware')
        .insert(firmwareData)
        .select();
      
      if (error) {
        console.error('Supabase error:', error); // Debug log
        throw error;
      }
      
      console.log('Upload successful:', data); // Debug log
      
      uiToast({
        title: "Firmware uploaded successfully",
        description: `${formData.name} v${formData.version} has been added to the repository`,
      });
      
      navigate('/versions');
    } catch (error) {
      console.error('Upload error:', error);
      uiToast({
        title: "Upload failed",
        description: "There was an error uploading the firmware. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    selectedFile,
    uploading,
    handleFileChange,
    uploadFirmware
  };
};
