import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc as firestoreDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { Appointment } from '../../types/appointment';
import { UserProfile } from '../../types/user';
import RatingModal from '../ratings/RatingModal';
import { Link } from 'react-router-dom';
import { getHireRequests } from '../../hooks/useAvailability'; // Ajuste o caminho conforme necessário

interface AppointmentGroup {
  upcoming: Appointment[];
  completed: Appointment[];
  cancelled: Appointment[];
}

const ClientDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [hireRequests, setHireRequests] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');

        const appointmentsQuery = query(
          collection(db, 'hireRequests'),
          where('clientId', '==', user.uid),
          orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(appointmentsQuery);
        const appointmentGroups: Appointment[] = [];

        // Processar os agendamentos
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          
          // Buscar informações do cuidador
          const caregiverRef = firestoreDoc(db, 'users', data.caregiverId);
          const caregiverDoc = await getDoc(caregiverRef);
          const caregiverData = caregiverDoc.data() as UserProfile;

          const appointment: Appointment = {
            id: docSnapshot.id,
            caregiverId: data.caregiverId,
            clientId: data.clientId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status || 'pending',
            notes: data.notes,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            // Adicionar informações do cuidador
            caregiverName: caregiverData?.fullName,
            caregiverImageUrl: caregiverData?.imageUrl,
            serviceType: data.serviceType,
            price: caregiverData?.hourlyRate
          };

          appointmentGroups.push(appointment);
        }

        setAppointments(appointmentGroups);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Erro ao carregar agendamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  useEffect(() => {
    const fetchHireRequests = async () => {
      const data = await getHireRequests(); // Função para buscar agendamentos
      setHireRequests(data);
    };
    fetchHireRequests();
  }, []);

  useEffect(() => {
    const fetchHireRequests = async () => {
      const q = query(collection(db, 'hireRequests'), where('status', '==', 'paid'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHireRequests(requests);

      if (requests.length > 0) {
        setShowRatingModal(true);
      }
    };

    fetchHireRequests();
  }, []);

  const handleRateAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    return (
      <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {appointment.caregiverName || 'Cuidador'}
            </h3>
            <p className="text-gray-600">
              {new Date(appointment.date).toLocaleDateString()} - {appointment.startTime} às {appointment.endTime}
            </p>
            {appointment.price && (
              <p className="text-green-600 mt-2">
                R$ {appointment.price}/hora
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
        
        {appointment.notes && (
          <p className="text-gray-700 mb-4">{appointment.notes}</p>
        )}
        {appointment.status === 'completed' && !appointment.rated && (
          <button
            onClick={() => handleRateAppointment(appointment.id)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Avaliar Atendimento
          </button>
        )}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  const renderAppointmentCardList = (appointment) => (
    <li key={appointment.id} className="text-gray-600">
      {`Agendamento: ${appointment.date} às ${appointment.startTime} - Status: ${appointment.status}`}
    </li>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard do Cliente</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Próximos Agendamentos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Próximos Agendamentos</h3>
              <p className="text-gray-600">
                Você não tem agendamentos próximos.
              </p>
              <Link to="/appointments" className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Ver Todos os Agendamentos
              </Link>
              <ul>
                {hireRequests.filter(appointment => appointment.status !== 'completed' && appointment.status !== 'cancelled').length === 0 ? (
                  <li className="text-gray-500">Nenhum agendamento próximo</li>
                ) : (
                  hireRequests.filter(appointment => appointment.status !== 'completed' && appointment.status !== 'cancelled').map(renderAppointmentCardList)
                )}
              </ul>
            </div>

            {/* Status de Pagamento */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Status de Pagamento</h3>
              <p className="text-gray-600">
                Não há pagamentos pendentes.
              </p>
              <Link
                to="/payments"
                className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Ver Histórico de Pagamentos
              </Link>
            </div>

            {/* Próximos Agendamentos */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Próximos Agendamentos</h2>
              {appointments.filter(appointment => appointment.status !== 'completed' && appointment.status !== 'cancelled').length === 0 ? (
                <p className="text-gray-500">Nenhum agendamento próximo</p>
              ) : (
                appointments.filter(appointment => appointment.status !== 'completed' && appointment.status !== 'cancelled').map(renderAppointmentCard)
              )}
            </section>
          </div>
        </div>
      )}
      {selectedAppointment && (
        <RatingModal
          isOpen={true}
          onClose={() => setSelectedAppointment(null)}
          appointmentId={selectedAppointment}
          caregiverId={appointments.find(a => a.id === selectedAppointment)?.caregiverId || ''}
          clientId={user?.uid || ''}
          user={user}
        />
      )}
      {showRatingModal && (
        <RatingModal
          isOpen={true}
          onClose={() => setShowRatingModal(false)}
          appointmentId={hireRequests[0]?.id || ''}
          caregiverId={hireRequests[0]?.caregiverId || ''}
          clientId={user?.uid || ''}
          user={user}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
