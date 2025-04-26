
import { ArrowUpDown } from "lucide-react";

interface FirmwareListHeaderProps {
  sortField: string;
  onSort: (field: string) => void;
}

export const FirmwareListHeader = ({ sortField, onSort }: FirmwareListHeaderProps) => {
  return (
    <div className="grid grid-cols-12 gap-4 bg-muted/50 p-3 text-sm font-medium">
      <button 
        onClick={() => onSort("name")}
        className="col-span-3 flex items-center gap-1"
      >
        Name & Version
        {sortField === "name" && (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </button>
      <div className="col-span-1">Status</div>
      <div className="col-span-3">Tags</div>
      <button 
        onClick={() => onSort("date")}
        className="col-span-2 flex items-center gap-1"
      >
        Date
        {sortField === "date" && (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </button>
      <button 
        onClick={() => onSort("burnCount")}
        className="col-span-1 text-right flex items-center justify-end gap-1"
      >
        Burns
        {sortField === "burnCount" && (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </button>
      <div className="col-span-2 text-right">Actions</div>
    </div>
  );
};
