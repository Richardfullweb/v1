export interface Appointment {
  id: string;
  clientId: string;
  caregiverId: string;
  clientName?: string;
  caregiverName?: string;
  date: any; // Firestore Timestamp
  duration: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  description?: string;
  price?: number;
  address?: string;
  notes?: string;
  rated?: boolean;
  rating?: {
    rating: number;
    comment?: string;
    createdAt: any;
  };
  createdAt: any;
  updatedAt: any;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DailyAvailability {
  date: string;
  timeSlots: TimeSlot[];
}
