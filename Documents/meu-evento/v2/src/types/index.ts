export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  type?: 'client' | 'caregiver';
  phone?: string;
  address?: string;
  bio?: string;
  specialties?: string[];
  role?: string;
  fullName?: string;
  imageUrl?: string;
  phoneNumber?: string;
  favorites?: string[];
  availability?: {
    [key: string]: { start: string; end: string; }[];
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface Appointment {
  id: string;
  caregiverId: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'confirmed' | 'paid';
  amount?: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface CaregiverRating {
  id: string;
  appointmentId: string;
  caregiverId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface AppointmentGroup {
  date: string;
  appointments: Appointment[];
}
