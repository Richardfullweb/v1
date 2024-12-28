export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  type: 'client' | 'caregiver';
  phone?: string;
  address?: string;
  bio?: string;
  specialties?: string[];
  hourlyRate?: number;
  availability?: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
  experience?: string;
  education?: string;
  languages?: string[];
  certifications?: string[];
  rating?: {
    average: number;
    total: number;
  };
  createdAt?: any;
  updatedAt?: any;
}
