
export interface Firmware {
  id: string;
  name: string;
  version: string;
  description: string | null;
  size: number;
  date_uploaded: string;      // From database (snake_case)
  dateUploaded: Date;         // For UI usage (camelCase)
  burn_count: number;         // From database (snake_case)
  burnCount: number;          // For UI usage (camelCase)
  content?: string | null;
  tags: string[];
  status: 'stable' | 'beta' | 'draft';
}
