import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuthContext } from '../contexts/AuthContext';
import AppointmentNotification from './AppointmentNotification';
import { createAppointmentMessage } from '../utils/messages';

export function AppointmentNotifications() {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  const { notifications, unreadCount } = useNotifications(user.uid);

  const handleAcceptAppointment = async (notificationId: string, appointmentData: any) => {
    try {
      await createAppointmentMessage(
        user.uid,
        'appointment_accepted',
        appointmentData
      );
    } catch (error) {
      console.error('Erro ao aceitar agendamento:', error);
    }
  };

  const handleRejectAppointment = async (notificationId: string, appointmentData: any) => {
    try {
      await createAppointmentMessage(
        user.uid,
        'appointment_cancelled',
        appointmentData
      );
    } catch (error) {
      console.error('Erro ao recusar agendamento:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bell-dot h-6 w-6">
            <path d="M19.4 14.9C20.2 16.4 21 17 21 17H3s3-2 3-9c0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.3"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            <circle cx="18" cy="8" r="3"></circle>
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </button>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <AppointmentNotification
            key={notification.id}
            type={notification.type}
            date={notification.appointmentData?.date}
            duration={notification.appointmentData?.duration}
            address={notification.appointmentData?.address}
            price={notification.appointmentData?.price}
            onAccept={() => handleAcceptAppointment(notification.id, notification.appointmentData)}
            onReject={() => handleRejectAppointment(notification.id, notification.appointmentData)}
          />
        ))}
      </div>
    </div>
  );
}
