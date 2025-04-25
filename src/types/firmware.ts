
export interface Firmware {
  id: string;
  name: string;
  version: string;
  description: string | null;
  size: number;
  date_uploaded: string;
  dateUploaded: Date;
  burn_count: number;
  burnCount: number;
  content?: string | null;
  tags: string[];
  status: 'stable' | 'beta' | 'draft';
}
