
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FileSelectorProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({ selectedFile, setSelectedFile }) => {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.hex', '.exe', '.elf', '.bin'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (hasValidExtension) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a valid firmware file (.hex, .exe, .elf, or .bin)",
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  return (
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
  );
};
