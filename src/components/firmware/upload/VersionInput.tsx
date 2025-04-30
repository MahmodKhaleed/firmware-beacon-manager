
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VersionInputProps {
  version: string;
  onChange: (version: string) => void;
}

export const VersionInput: React.FC<VersionInputProps> = ({ version, onChange }) => {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="version">Version</Label>
      <Input 
        id="version" 
        placeholder="e.g. 1.0.0" 
        value={version}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
