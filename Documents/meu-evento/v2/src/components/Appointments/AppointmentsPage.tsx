import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { Appointment } from '../../types/appointment';
import { Link } from 'react-router-dom';
import CheckoutModal from '../Payments/CheckoutModal';

const AppointmentsPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const q = query(
        collection(db, 'hireRequests'),
        where('clientId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({
          id: doc.id,
          ...doc.data()
        } as Appointment);
      });
      setAppointments(appointmentsData);
    } catch (err) {
      setError('Falha ao carregar agendamentos');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const appointmentRef = doc(db, 'hireRequests', appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      await fetchAppointments();
    } catch (err) {
      setError('Falha ao atualizar agendamento');
      console.error('Error updating appointment:', err);
    }
  };

  const handlePayment = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, 'hireRequests', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'paid',
        updatedAt: serverTimestamp(),
        paymentDate: serverTimestamp()
      });
      await fetchAppointments();
      setSelectedAppointment(null);
    } catch (err) {
      setError('Falha ao processar pagamento');
      console.error('Error processing payment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Meus Agendamentos</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">
                      {appointment.startTime} - {appointment.endTime}
                    </span>
                  </div>
                  {appointment.notes && (
                    <p className="text-gray-600 mt-2">
                      Notas: {appointment.notes}
                    </p>
                  )}
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : appointment.status === 'paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                      Pagar Agora
                    </button>
                  )}
                  {appointment.status === 'paid' && (
                    <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded">
                      Pago ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAppointment && (
        <CheckoutModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onConfirmPayment={handlePayment}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;