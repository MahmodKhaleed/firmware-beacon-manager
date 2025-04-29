
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { FirmwareStatus } from "@/types/firmware";

interface FormData {
  name: string;
  version: string;
  description: string;
  status: FirmwareStatus;
  tags: string[];
}

interface UseUploadFirmwareProps {
  selectedFile: File | null;
  formData: FormData;
  isPasswordValid: boolean;
}

export const useUploadFirmware = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const uploadFirmware = async ({ selectedFile, formData, isPasswordValid }: UseUploadFirmwareProps) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a firmware file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.version) {
      toast({
        title: "Missing information",
        description: "Please provide a name and version",
        variant: "destructive",
      });
      return;
    }
    
    if (!isPasswordValid) {
      toast({
        title: "Invalid password",
        description: "Please enter the correct password to upload firmware",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    console.log('Starting firmware upload process...'); // Debug log
    
    try {
      // Generate a unique file path for storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${formData.name.replace(/\s+/g, '-')}-${formData.version.replace(/\./g, '-')}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log(`Uploading file to storage: ${filePath}`); // Debug log
      
      // Create storage bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const firmwaresBucketExists = buckets?.find(bucket => bucket.name === 'firmwares');
      
      if (!firmwaresBucketExists) {
        console.log('Creating firmwares bucket...'); // Debug log
        await supabase.storage.createBucket('firmwares', { public: true });
      }
      
      // Upload the file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('firmwares')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (storageError) {
        console.error('Storage upload error:', storageError); // Debug log
        throw new Error(`Storage error: ${storageError.message}`);
      }
      
      console.log('File uploaded successfully to storage:', storageData); // Debug log
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('firmwares')
        .getPublicUrl(filePath);
      
      console.log('Public URL generated:', publicUrl); // Debug log
      
      // Create the RLS bypass token to allow the firmware insert
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Create a guest user session for anonymous uploads
        await supabase.auth.signInAnonymously();
        console.log('Created anonymous session for upload');
      }
      
      // Prepare the firmware data for database
      const firmwareData = {
        name: formData.name,
        version: formData.version,
        description: formData.description || null,
        size: selectedFile.size,
        status: formData.status,
        tags: formData.tags,
        date_uploaded: new Date().toISOString(),
        burn_count: 0,
        file_url: publicUrl
      };
      
      console.log('Sending firmware data to Supabase database:', firmwareData); // Debug log
      
      // Insert firmware data into Supabase database
      const { data, error } = await supabase
        .from('firmware')
        .insert(firmwareData)
        .select();
      
      if (error) {
        console.error('Database error:', error); // Debug log
        
        // Try to delete the uploaded file to maintain consistency
        try {
          await supabase.storage.from('firmwares').remove([filePath]);
        } catch (removeError) {
          console.error('Failed to clean up storage after database error:', removeError);
        }
        
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from insert operation');
        throw new Error('Failed to create firmware record');
      }
      
      console.log('Upload successful:', data); // Debug log
      
      toast({
        title: "Firmware uploaded successfully",
        description: `${formData.name} v${formData.version} has been added to the repository`,
      });
      
      // Navigate to versions page after successful upload
      navigate('/versions');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the firmware. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadFirmware };
};
