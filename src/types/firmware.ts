
export interface Firmware {
  id: string;
  name: string;
  version: string;
  description: string;
  size: number;
  dateUploaded: Date;
  burnCount: number;
  content?: string;
  tags: string[];
  status: 'stable' | 'beta' | 'draft';
}
