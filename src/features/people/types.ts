export type PersonStatus = 'active' | 'pending' | 'rejected' | 'inactive';

export interface Person {
  id: string;
  name: string;
  email: string;
  age?: number;
  city?: string;
  interests: string[];
  status: PersonStatus;
  createdAt: string;
  lastActivityAt?: string;
}
