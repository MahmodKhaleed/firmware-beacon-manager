
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Upload as UploadIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

type FirmwareStatus = "stable" | "beta" | "draft";

const Upload = () => {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    status: "draft" as FirmwareStatus,
    tags: [] as string[],
  });
  const [currentTag, setCurrentTag] = useState("");
  
  // Redirect non-admin users
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to access this page");
      navigate("/auth");
      return;
    }
    
    if (user && !isAdmin) {
      toast.error("You don't have permission to upload firmware");
      navigate("/versions");
    }
  }, [user, isAdmin, navigate]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.hex', '.exe', '.elf', '.bin'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
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
    
    if (!user || !isAdmin) {
      uiToast({
        title: "Permission denied",
        description: "Only administrators can upload firmware",
        variant: "destructive",
      });
      return;
    }
    
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
      // For binary files, we need to use ArrayBuffer instead of text
      const fileBuffer = await selectedFile.arrayBuffer();
      
      // Convert ArrayBuffer to Base64 string for storage
      const base64Content = btoa(
        new Uint8Array(fileBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte), 
          ''
        )
      );
      
      console.log('File content processed, size:', fileBuffer.byteLength); // Debug log
      
      // Prepare the firmware data
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
      
      // Insert firmware data into Supabase
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
      
      // Navigate to versions page after successful upload
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
      // Only reset form if component is still mounted
      const formWasActive = document.getElementById('firmware-form');
      if (formWasActive) {
        setSelectedFile(null);
        setFormData({
          name: "",
          version: "",
          description: "",
          status: "draft",
          tags: [],
        });
      }
    }
  };

  if (!user || !isAdmin) {
    return null; // Component will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Upload Firmware</CardTitle>
            <CardDescription>Upload a new firmware file for OTA updates</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="firmware-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="firmware-file">Firmware File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="firmware-file"
                      type="file"
                      accept=".hex,.exe,.elf,.bin"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a firmware file (.hex, .exe, .elf, or .bin)
                  </p>
                </div>

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

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="tags" 
                      placeholder="Enter a tag" 
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} variant="secondary">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => removeTag(tag)}
                            className="text-xs font-bold ml-1 hover:bg-gray-200 rounded-full w-4 h-4 inline-flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

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

              <Button type="submit" className="w-full" disabled={uploading}>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Upload;
