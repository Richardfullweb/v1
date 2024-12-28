import React, { useState } from 'react';
import { NotificationService } from '../../services/NotificationService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';

export default function CreatePendingNotifications({ caregiverId }: { caregiverId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCreateNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Buscar todas as solicitações pendentes
      const q = query(
        collection(db, "appointments"),
        where("caregiverId", "==", caregiverId),
        where("status", "==", "pending")
      );

      const querySnapshot = await getDocs(q);
      
      // Criar notificações para cada solicitação
      const promises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        return NotificationService.notifyNewAppointment({
          appointmentId: doc.id,
          userId: caregiverId,
          patientName: data.clientName,
          date: data.date.toDate(),
          description: data.description,
          price: data.price,
          duration: data.duration,
          address: data.address
        });
      });

      await Promise.all(promises);
      toast.success(`Criadas ${promises.length} notificações`);
    } catch (error) {
      console.error('Error creating notifications:', error);
      toast.error('Erro ao criar notificações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateNotifications}
      disabled={loading}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        loading ? 'animate-pulse' : ''
      }`}
    >
      {loading ? 'Criando...' : 'Criar Notificações Pendentes'}
    </button>
  );
}
