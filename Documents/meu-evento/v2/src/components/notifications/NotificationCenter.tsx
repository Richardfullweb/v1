import React from 'react';
import { NotificationService, Notification } from '../../services/NotificationService';
import { AppointmentNotification } from './AppointmentNotification';
import { useAuthContext } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell } from 'lucide-react';

export default function NotificationCenter() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = NotificationService.subscribeToNotifications(user.uid, (updatedNotifications) => {
      setNotifications(updatedNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAcceptAppointment = async (appointmentId: string, notificationId: string) => {
    try {
      await NotificationService.acceptAppointment(appointmentId);
      await NotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error accepting appointment:', error);
    }
  };

  const handleRejectAppointment = async (appointmentId: string, notificationId: string) => {
    try {
      await NotificationService.rejectAppointment(appointmentId);
      await NotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };

  const handleEvaluateAppointment = (appointmentId: string) => {
    window.location.href = `/appointments/${appointmentId}/evaluate`;
  };

  const renderNotification = (notification: Notification) => {
    if (notification.type.startsWith('appointment_')) {
      return (
        <AppointmentNotification
          key={notification.id}
          type={notification.type as any}
          date={notification.data.date}
          duration={notification.data.duration}
          address={notification.data.address}
          price={notification.data.price}
          patientName={notification.data.patientName}
          description={notification.data.description}
          onAccept={notification.data.appointmentId ? 
            () => handleAcceptAppointment(notification.data.appointmentId, notification.id) : 
            undefined
          }
          onReject={notification.data.appointmentId ? 
            () => handleRejectAppointment(notification.data.appointmentId, notification.id) : 
            undefined
          }
          onEvaluate={notification.data.appointmentId ? 
            () => handleEvaluateAppointment(notification.data.appointmentId) : 
            undefined
          }
        />
      );
    }

    // Renderizar outros tipos de notificação
    return (
      <div key={notification.id} className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Bell className={`h-5 w-5 ${
            notification.priority === 'high' ? 'text-red-500' :
            notification.priority === 'medium' ? 'text-orange-500' :
            'text-blue-500'
          }`} />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
            <p className="mt-1 text-xs text-gray-500">
              {format(notification.createdAt.toDate(), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma notificação</h3>
        <p className="mt-1 text-sm text-gray-500">
          Você não tem nenhuma notificação no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map(renderNotification)}
    </div>
  );
}
