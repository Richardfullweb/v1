export interface Appointment {
  id: string;
  caregiverId: string;
  clientId: string;
  date: Date; // Agora apenas Date
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  caregiverName?: string;
  caregiverImageUrl?: string;
  serviceType?: string;
  price?: number;
  rated?: boolean;
  totalAmount?: number;
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
