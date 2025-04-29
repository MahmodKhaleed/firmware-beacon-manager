
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FirmwareStatus } from "@/types/firmware";

interface StatusSelectProps {
  status: FirmwareStatus;
  onStatusChange: (value: FirmwareStatus) => void;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({ status, onStatusChange }) => {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="status">Status</Label>
      <Select value={status} onValueChange={(value: FirmwareStatus) => onStatusChange(value)}>
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
  );
};
