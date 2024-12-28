import { collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export type NotificationType = 
  | 'appointment_request'
  | 'appointment_accepted'
  | 'appointment_rejected'
  | 'appointment_completed'
  | 'appointment_evaluation'
  | 'evaluation_request'
  | 'new_rating'
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
  rating?: number;
  comment?: string;
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

export class NotificationService {
  private static collection = 'notifications';

  static async createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = Timestamp.now();
      const notificationData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.collection), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, this.collection, notificationId);
      await updateDoc(notificationRef, {
        status: 'read',
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('status', '==', 'unread')
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      const now = Timestamp.now();

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'read',
          readAt: now,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static subscribeToNotifications(q: any, callback: (notifications: Notification[]) => void) {
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      callback(notifications);

      // Mostrar toast para novas notificações não lidas
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const notification = change.doc.data() as Notification;
          if (notification.status === 'unread') {
            this.showToast(notification);
          }
        }
      });
    });
  }

  static showToast(notification: Notification) {
    toast(notification.message, {
      icon: notification.priority === 'high' ? '🔴' : 
            notification.priority === 'medium' ? '🟡' : '🔵',
      duration: 5000,
    });
  }

  // Métodos específicos para agendamentos
  static async notifyNewAppointment(data: {
    appointmentId: string;
    userId: string;
    patientName: string;
    date: Date;
    description: string;
    price?: number;
    duration?: number;
    address?: string;
  }) {
    return this.createNotification({
      type: 'appointment_request',
      title: 'Nova Solicitação de Atendimento',
      message: `${data.patientName} solicitou um atendimento`,
      userId: data.userId,
      status: 'unread',
      priority: 'high',
      channel: 'in_app',
      data: {
        appointmentId: data.appointmentId,
        patientName: data.patientName,
        date: data.date,
        description: data.description,
        price: data.price,
        duration: data.duration,
        address: data.address,
      },
    });
  }

  static async notifyAppointmentAccepted(data: {
    appointmentId: string;
    userId: string;
    patientName: string;
    date: Date;
    description?: string;
    price?: number;
    duration?: number;
    address?: string;
  }) {
    return this.createNotification({
      type: 'appointment_accepted',
      title: 'Atendimento Confirmado',
      message: `Seu atendimento com ${data.patientName} foi confirmado`,
      userId: data.userId,
      status: 'unread',
      priority: 'medium',
      channel: 'in_app',
      data: {
        appointmentId: data.appointmentId,
        patientName: data.patientName,
        date: data.date,
        description: data.description,
        price: data.price,
        duration: data.duration,
        address: data.address,
      },
    });
  }

  static async notifyAppointmentRejected(data: {
    appointmentId: string;
    userId: string;
    patientName: string;
    date: Date;
    description?: string;
  }) {
    return this.createNotification({
      type: 'appointment_rejected',
      title: 'Atendimento Recusado',
      message: `O atendimento com ${data.patientName} foi recusado`,
      userId: data.userId,
      status: 'unread',
      priority: 'medium',
      channel: 'in_app',
      data: {
        appointmentId: data.appointmentId,
        patientName: data.patientName,
        date: data.date,
        description: data.description,
      },
    });
  }

  static async notifyAppointmentCompleted(data: {
    appointmentId: string;
    userId: string;
    patientName: string;
    date: Date;
  }) {
    return this.createNotification({
      type: 'appointment_completed',
      title: 'Atendimento Concluído',
      message: `O atendimento com ${data.patientName} foi concluído`,
      userId: data.userId,
      status: 'unread',
      priority: 'low',
      channel: 'in_app',
      data: {
        appointmentId: data.appointmentId,
        patientName: data.patientName,
        date: data.date,
      },
    });
  }

  static async notifyEvaluationRequest(data: {
    appointmentId: string;
    userId: string;
    patientName: string;
    date: Date;
  }) {
    return this.createNotification({
      type: 'evaluation_request',
      title: 'Avalie seu Atendimento',
      message: `Como foi seu atendimento em ${format(data.date, 'dd/MM/yyyy')}? Sua avaliação é muito importante para nós!`,
      userId: data.userId,
      status: 'unread',
      priority: 'medium',
      channel: 'in_app',
      data: {
        appointmentId: data.appointmentId,
      },
    });
  }

  static async notifyNewRating(data: {
    appointmentId: string;
    userId: string;
    rating: number;
    comment?: string;
  }) {
    const stars = '⭐'.repeat(data.rating);
    return this.createNotification({
      type: 'new_rating',
      title: 'Nova Avaliação Recebida',
      message: `Você recebeu uma avaliação: ${stars}${data.comment ? `\n${data.comment}` : ''}`,
      userId: data.userId,
      status: 'unread',
      priority: 'medium',
      channel: 'in_app',
      data: {
        appointmentId: data.appointmentId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }
}