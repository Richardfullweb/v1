export type NotificationType = 
  | 'appointment_request'
  | 'appointment_accepted'
  | 'appointment_rejected'
  | 'appointment_completed'
  | 'appointment_evaluation'
  | 'message'
  | 'payment'
  | 'system';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationStatus = 'read' | 'unread';

export type NotificationChannel = 'in_app' | 'email' | 'push';

export interface NotificationData {
  appointmentId?: string;
  patientName?: string;
  date?: Date;
  description?: string;
  price?: number;
  duration?: number;
  address?: string;
  messageId?: string;
  paymentId?: string;
  [key: string]: any;
}

export interface Notification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  channel: NotificationChannel;
  data: NotificationData;
  createdAt: any; // Firestore Timestamp
  readAt?: any; // Firestore Timestamp
}
