import { getToken, onMessage } from "firebase/messaging";
import type { Notification } from "../types/notification";
import { format } from 'date-fns';
import { messaging } from "../firebase";

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await window.Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export const onNotificationMessage = (
  callback: (payload: any) => void
) => {
  return onMessage(messaging, callback);
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  // TODO: Implementar lógica de subscription
  return () => {};
};

export const markAsRead = async (notificationId: string) => {
  // TODO: Implementar lógica de marcação como lida
  return Promise.resolve();
};

export const createAppointmentStatusNotification = async (data: {
  clientId: string;
  appointmentId: string;
  caregiverName: string;
  status: 'accepted' | 'rejected';
  date: Date;
  startTime: string;
  endTime: string;
}) => {
  const title = data.status === 'accepted' 
    ? 'Agendamento Confirmado' 
    : 'Agendamento Cancelado';
  
  const message = data.status === 'accepted'
    ? `${data.caregiverName} confirmou seu agendamento para ${format(data.date, 'dd/MM/yyyy')} das ${data.startTime} às ${data.endTime}`
    : `${data.caregiverName} cancelou seu agendamento para ${format(data.date, 'dd/MM/yyyy')}`;

  // Retornar sucesso sem enviar notificação push
  return Promise.resolve({
    success: true,
    message: 'Agendamento atualizado com sucesso'
  });
};

export const createServiceCompletedNotification = async (data: {
  clientId: string;
  caregiverId: string;
  appointmentId: string;
  clientName: string;
  caregiverName: string;
}) => {
  const title = 'Serviço Concluído';
  const message = `${data.caregiverName} concluiu o serviço. Por favor, avalie sua experiência.`;

  const token = await requestNotificationPermission();
  if (!token) {
    throw new Error('Failed to get notification token');
  }
  const notification = {
    title,
    message,
    userId: data.clientId,
    type: 'service_completed',
    data: {
      appointmentId: data.appointmentId,
      caregiverId: data.caregiverId,
      clientName: data.clientName,
      caregiverName: data.caregiverName
    }
  };
  return sendNotification(notification, token);
};

export const createNewAppointmentRequestNotification = async (data: {
  caregiverId: string;
  appointmentId: string;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
}) => {
  const title = 'Nova Solicitação de Agendamento';
  const message = `${data.clientName} solicitou um agendamento para ${format(data.date, 'dd/MM/yyyy')} das ${data.startTime} às ${data.endTime}`;

  const token = await requestNotificationPermission();
  if (!token) {
    throw new Error('Failed to get notification token');
  }
  const notification = {
    title,
    message,
    userId: data.caregiverId,
    type: 'new_appointment_request',
    data: {
      appointmentId: data.appointmentId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      clientName: data.clientName
    }
  };
  return sendNotification(notification, token);
};

export const markAllAsRead = async (userId: string) => {
  // TODO: Implementar lógica de marcação de todas como lidas
  return Promise.resolve();
};

export const sendNotification = async (
  notification: Notification,
  token: string
) => {
  try {
    const response = await fetch(
      "https://fcm.googleapis.com/fcm/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${import.meta.env.VITE_FIREBASE_SERVER_KEY}`,
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: notification.title,
            body: notification.message,
          },
        }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};
