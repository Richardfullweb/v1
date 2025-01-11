export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  role: 'client' | 'caregiver';
  phoneNumber?: string;
  address?: string;
  bio?: string;
  specialties?: string;
  availability?: {
    [key: string]: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
  hourlyRate?: number;
}
