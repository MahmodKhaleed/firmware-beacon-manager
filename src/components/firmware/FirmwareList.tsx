
import { FirmwareListHeader } from "./FirmwareListHeader";
import { FirmwareItem } from "./FirmwareItem";
import type { Firmware } from "@/types/firmware";

interface FirmwareListProps {
  firmware: Firmware[];
  sortField: string;
  onSort: (field: string) => void;
}

export const FirmwareList = ({ firmware, sortField, onSort }: FirmwareListProps) => {
  if (firmware.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No firmware versions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <FirmwareListHeader sortField={sortField} onSort={onSort} />
      {firmware.map((fw) => (
        <FirmwareItem
          key={fw.id}
          firmware={fw}
          mockFirmwareContent=""
        />
      ))}
    </div>
  );
};

