
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PasswordField } from "./PasswordField";
import { TagInput } from "./TagInput";
import { FileSelector } from "./FileSelector";
import type { FirmwareStatus } from "@/types/firmware";

export const UploadForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    status: "draft" as FirmwareStatus,
    tags: [] as string[],
  });
  const [currentTag, setCurrentTag] = useState("");
  
  const validatePassword = (input: string) => {
    setPassword(input);
    setIsPasswordValid(input === "AmazingFOTA");
  };
  
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag("");
    }
  };
  
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <FileSelector selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
        <PasswordField password={password} validatePassword={validatePassword} isPasswordValid={isPasswordValid} />

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            placeholder="e.g. SensorFirmware" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="version">Version</Label>
          <Input 
            id="version" 
            placeholder="e.g. 1.0.0" 
            value={formData.version}
            onChange={(e) => setFormData({...formData, version: e.target.value})}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: FirmwareStatus) => setFormData({...formData, status: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Set the release status of this firmware version
          </p>
        </div>

        <TagInput 
          currentTag={currentTag} 
          setCurrentTag={setCurrentTag} 
          addTag={addTag} 
          tags={formData.tags} 
          removeTag={removeTag} 
        />

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe the changes in this firmware version" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={uploading || !isPasswordValid}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload Firmware
          </>
        )}
      </Button>
    </form>
  );
};
