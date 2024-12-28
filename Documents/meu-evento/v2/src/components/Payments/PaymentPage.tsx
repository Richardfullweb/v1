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
  serverTimestamp
} from 'firebase/firestore';
import { Appointment } from '../../types/appointment';

const PaymentPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('clientId', '==', user?.uid),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsData: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appointmentsData);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (appointmentId: string) => {
    try {
      setLoading(true);
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
      await fetchAppointments();
    } catch (err) {
      setError('Failed to process payment');
      console.error('Error processing payment:', err);
    } finally {
      setLoading(false);
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
      <h2 className="text-2xl font-bold mb-6">Payment Status</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    Appointment on {new Date(appointment.date).toLocaleDateString()}
                  </h3>
                  <p className="text-gray-600">
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                </div>
                <button
                  onClick={() => handlePay(appointment.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Pay
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
