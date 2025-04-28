
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { FirmwareFileUpload } from "@/components/firmware/FirmwareFileUpload";
import { FirmwareTags } from "@/components/firmware/FirmwareTags";
import { useFirmwareUpload, FirmwareFormData } from "@/hooks/useFirmwareUpload";

const Upload = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { selectedFile, uploading, handleFileChange, uploadFirmware } = useFirmwareUpload();
  const [formData, setFormData] = useState<FirmwareFormData>({
    name: "",
    version: "",
    description: "",
    status: "draft",
    tags: [],
  });
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await uploadFirmware(formData);
  };

  if (!user || !isAdmin) {
    return null;
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
                <FirmwareFileUpload 
                  selectedFile={selectedFile}
                  onFileChange={handleFileChange}
                />

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
                    onValueChange={(value) => 
                      setFormData({...formData, status: value as "stable" | "beta" | "draft"})
                    }
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

                <FirmwareTags 
                  tags={formData.tags}
                  onTagsChange={(newTags) => setFormData({...formData, tags: newTags})}
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
