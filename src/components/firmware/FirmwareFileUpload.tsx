
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface FirmwareFileUploadProps {
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FirmwareFileUpload = ({
  selectedFile,
  onFileChange
}: FirmwareFileUploadProps) => {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="firmware-file">Firmware File</Label>
      <div className="flex items-center gap-2">
        <Input
          id="firmware-file"
          type="file"
          accept=".hex,.exe,.elf,.bin"
          onChange={onFileChange}
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
