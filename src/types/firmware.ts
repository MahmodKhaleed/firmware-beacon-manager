
export interface Firmware {
  id: string;
  name: string;
  version: string;
  description: string | null;
  size: number;
  date_uploaded: string | null;      // From database (snake_case)
  dateUploaded: Date;               // For UI usage (camelCase)
  burn_count: number | null;        // From database (snake_case)
  burnCount: number;                // For UI usage (camelCase)
  file_url: string | null;         // Field for storage URL
  tags: string[];
  status: FirmwareStatus;
}

export type FirmwareStatus = 'stable' | 'beta' | 'draft';
