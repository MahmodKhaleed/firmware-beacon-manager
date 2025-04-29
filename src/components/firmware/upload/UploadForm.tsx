
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Loader2 } from "lucide-react";
import { FileSelector } from "./FileSelector";
import { PasswordField } from "./PasswordField";
import { NameInput } from "./NameInput";
import { VersionInput } from "./VersionInput";
import { StatusSelect } from "./StatusSelect";
import { TagInput } from "./TagInput";
import { DescriptionInput } from "./DescriptionInput";
import { useUploadFirmware } from "@/hooks/useUploadFirmware";
import type { FirmwareStatus } from "@/types/firmware";

export const UploadForm = () => {
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
  
  const { uploading, uploadFirmware } = useUploadFirmware();
  
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
    uploadFirmware({
      selectedFile,
      formData,
      isPasswordValid
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <FileSelector selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
        <PasswordField 
          password={password} 
          validatePassword={validatePassword} 
          isPasswordValid={isPasswordValid} 
        />

        <NameInput 
          name={formData.name} 
          onChange={(name) => setFormData({...formData, name})} 
        />

        <VersionInput 
          version={formData.version} 
          onChange={(version) => setFormData({...formData, version})} 
        />

        <StatusSelect 
          status={formData.status} 
          onStatusChange={(status) => setFormData({...formData, status})} 
        />

        <TagInput 
          currentTag={currentTag} 
          setCurrentTag={setCurrentTag} 
          addTag={addTag} 
          tags={formData.tags} 
          removeTag={removeTag} 
        />

        <DescriptionInput 
          description={formData.description} 
          onChange={(description) => setFormData({...formData, description})} 
        />
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
