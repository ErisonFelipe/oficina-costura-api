export type QuoteStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface QuoteData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: QuoteStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
