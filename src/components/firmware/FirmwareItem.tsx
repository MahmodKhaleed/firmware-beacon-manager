
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Firmware } from "@/types/firmware";
import { Download, Eye, Tag } from "lucide-react";
import { useState } from "react";

interface FirmwareItemProps {
  firmware: Firmware;
  mockFirmwareContent: string;
}

export const FirmwareItem = ({ firmware, mockFirmwareContent }: FirmwareItemProps) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div className="grid grid-cols-12 gap-4 p-3 text-sm items-center border-t hover:bg-slate-50">
      <div className="col-span-3">
        <div className="font-medium">{firmware.name}</div>
        <div className="text-muted-foreground">{firmware.version}</div>
        <div className="text-xs text-muted-foreground truncate">{firmware.description}</div>
      </div>

      <div className="col-span-1">
        <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          firmware.status === 'stable' 
            ? 'bg-green-100 text-green-800' 
            : firmware.status === 'beta'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {firmware.status}
        </div>
      </div>

      <div className="col-span-3 flex flex-wrap gap-1">
        {firmware.tags.map((tag, index) => (
          <Badge key={`${tag}-${index}`} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="col-span-2 text-muted-foreground">
        {firmware.dateUploaded.toLocaleDateString()}
      </div>

      <div className="col-span-1 text-right">
        {firmware.burnCount}
      </div>

      <div className="col-span-2 flex justify-end gap-2">
        <Dialog open={isSelected} onOpenChange={setIsSelected}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {firmware.name} <span className="text-muted-foreground">{firmware.version}</span>
                <Badge variant="outline" className="ml-2">{firmware.status}</Badge>
              </DialogTitle>
              <DialogDescription>
                Uploaded on {firmware.dateUploaded.toLocaleDateString()} • {firmware.size / 1024} KB • 
                {firmware.burnCount} device burns
              </DialogDescription>
            </DialogHeader>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-96 font-mono text-sm">
              <pre>{firmware.content || mockFirmwareContent}</pre>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Tag className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
