
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Upload as UploadIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    status: "draft",
    tags: [] as string[],
  });
  const [currentTag, setCurrentTag] = useState("");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.hex', '.exe', '.elf'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (hasValidExtension) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a valid firmware file (.hex, .exe, or .elf)",
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
    
    setUploading(true);
    
    try {
      // Read file content
      const fileContent = await selectedFile.text();
      
      // Insert firmware data into Supabase
      const { error } = await supabase
        .from('firmware')
        .insert({
          name: formData.name,
          version: formData.version,
          description: formData.description || null,
          size: selectedFile.size,
          status: formData.status,
          tags: formData.tags,
          content: fileContent,
        });

      if (error) throw error;

      toast({
        title: "Firmware uploaded successfully",
        description: `${formData.name} v${formData.version} has been added to the repository`,
      });
      
      // Navigate to versions page after successful upload
      navigate('/versions');
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the firmware. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setFormData({
        name: "",
        version: "",
        description: "",
        status: "draft",
        tags: [],
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Upload Firmware</CardTitle>
            <CardDescription>Upload a new C firmware file for OTA updates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="firmware-file">Firmware File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="firmware-file"
                      type="file"
                      accept=".c,.h"
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
                    Select a C source (.c) or header (.h) file
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
                    onValueChange={(value) => setFormData({...formData, status: value})}
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
