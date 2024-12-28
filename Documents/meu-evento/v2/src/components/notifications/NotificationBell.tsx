import React, { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Bell } from 'lucide-react';
import { auth } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { NotificationService, Notification } from '../../services/NotificationService';

export default function NotificationBell() {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user) return;

    // Configurar listener para notificações em tempo real
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('channel', '==', 'in_app'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = NotificationService.subscribeToNotifications(
      q,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        const newUnreadCount = updatedNotifications.filter(n => n.status === 'unread').length;
        if (newUnreadCount > unreadCount) {
          setHasNewNotification(true);
          setTimeout(() => setHasNewNotification(false), 1000);
        }
        setUnreadCount(newUnreadCount);
      }
    );

    return () => unsubscribe();
  }, [user, unreadCount]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, status: 'read' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await NotificationService.markAllAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_request':
        return '📅';
      case 'appointment_accepted':
        return '✅';
      case 'appointment_rejected':
        return '❌';
      case 'appointment_completed':
        return '🎉';
      case 'appointment_evaluation':
        return '⭐';
      case 'message':
        return '💬';
      case 'payment':
        return '💰';
      default:
        return '🔔';
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full ${
          hasNewNotification ? 'animate-bounce' : ''
        }`}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                    notification.status === 'unread' ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => notification.id && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-gray-900 ${notification.status === 'unread' ? 'font-bold' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {notification.createdAt && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(notification.createdAt.toDate(), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                    {notification.priority === 'high' && (
                      <span className="h-2 w-2 bg-red-500 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
