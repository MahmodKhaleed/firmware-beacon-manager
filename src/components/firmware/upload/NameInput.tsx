
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export const NameInput: React.FC<NameInputProps> = ({ name, onChange }) => {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="name">Name</Label>
      <Input 
        id="name" 
        placeholder="e.g. SensorFirmware" 
        value={name}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
