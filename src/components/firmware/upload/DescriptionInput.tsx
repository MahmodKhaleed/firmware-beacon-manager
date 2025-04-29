
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionInputProps {
  description: string;
  onChange: (description: string) => void;
}

export const DescriptionInput: React.FC<DescriptionInputProps> = ({ description, onChange }) => {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="description">Description</Label>
      <Textarea 
        id="description" 
        placeholder="Describe the changes in this firmware version" 
        value={description}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
