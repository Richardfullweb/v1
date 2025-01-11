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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [pendingPayments, setPendingPayments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

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
            date: data.date.toDate(), // Converte Timestamp para Date
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status || 'pending',
            notes: data.notes,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
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

  useEffect(() => {
    if (!user) return;

    const fetchPendingPayments = async () => {
      try {
        const q = query(
          collection(db, 'hireRequests'),
          where('clientId', '==', user.uid),
          where('status', 'in', ['accepted', 'pending'])
        );

        const querySnapshot = await getDocs(q);
        const payments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Appointment));

        setPendingPayments(payments);
      } catch (err) {
        console.error('Error fetching pending payments:', err);
      }
    };

    fetchPendingPayments();
  }, [user]);

  const handleRateAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
  };

  const calculateTotalAmount = (startTime: string, endTime: string, hourlyRate: number) => {
    if (!hourlyRate || hourlyRate <= 0) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDate = new Date(2000, 0, 1, startHour, startMinute);
    const endDate = new Date(2000, 0, 1, endHour, endMinute);
    
    const diffInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return hourlyRate * diffInHours;
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const canRate = appointment.status === 'paid' && !appointment.rated;
    
    // Formatar a data de Timestamp para DD/MM/YYYY
    const formattedDate = format(appointment.date, "dd/MM/yyyy", { locale: ptBR });
    
    // Calcular o valor total
    const totalAmount = calculateTotalAmount(
      appointment.startTime,
      appointment.endTime,
      appointment.price || 0
    );
    
    return (
      <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {appointment.caregiverName || 'Cuidador'}
            </h3>
            <p className="text-gray-600">
              {formattedDate} - {appointment.startTime} às {appointment.endTime}
            </p>
            <div className="mt-2">
              <p className="text-green-600">
                R$ {appointment.price}/hora
              </p>
              <p className="text-green-700 font-semibold">
                Total: R$ {totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
        
        {appointment.notes && (
          <p className="text-gray-700 mb-4">{appointment.notes}</p>
        )}

        {canRate && (
          <button
            onClick={() => setSelectedAppointment(appointment.id)}
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
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
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
      case 'rejected':
        return 'Rejeitado';
      case 'cancelled':
        return 'Cancelado';
      case 'paid':
        return 'Pago';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const renderPaymentStatus = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Status de Pagamento</h2>
        
        {pendingPayments.length === 0 ? (
          <div>
            <p className="text-gray-600 mb-4">Não há pagamentos pendentes.</p>
            <Link
              to="/payments"
              className="text-blue-500 hover:text-blue-600"
            >
              Ver Histórico de Pagamentos
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-yellow-600 mb-4">
              Você tem {pendingPayments.length} pagamento{pendingPayments.length > 1 ? 's' : ''} pendente{pendingPayments.length > 1 ? 's' : ''}.
            </p>
            <Link
              to="/payment"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600"
            >
              Realizar Pagamento
            </Link>
          </div>
        )}
      </div>
    );
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
      {`Agendamento: ${format(appointment.date.toDate(), "dd/MM/yyyy", { locale: ptBR })} às ${appointment.startTime} - Status: ${appointment.status}`}
    </li>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 pt-20 md:pt-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard do Cliente</h1>

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
              <div className="space-y-4 md:space-y-6">
          {/* Cards Informativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Agendamentos Totais</h3>
              <p className="text-3xl font-bold text-blue-600">
                {appointments.length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Próximos Agendamentos</h3>
              <p className="text-3xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'accepted' || a.status === 'paid').length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Valor Pendente</h3>
              <p className="text-3xl font-bold text-red-600">
                {pendingPayments.length > 0 ? (
                  `R$ ${pendingPayments
                    .filter(a => a.status === 'accepted' || a.status === 'pending')
                    .reduce((sum, a) => {
                      const amount = a.totalAmount || calculateTotalAmount(a.startTime, a.endTime, a.price || 0);
                      return sum + (isNaN(amount) ? 0 : amount);
                    }, 0)
                    .toFixed(2)}`
                ) : 'R$ 0.00'}
              </p>
            </div>
          </div>

          {/* Área Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Próximos Agendamentos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Próximos Agendamentos</h2>
                  <Link
                    to="/search"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600"
                  >
                    Novo Agendamento
                  </Link>
                </div>
                
                {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhum agendamento próximo</p>
                    <Link
                      to="/search"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600"
                    >
                      Agendar Novo Serviço
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments
                      .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
                      .map(renderAppointmentCard)}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status de Pagamento */}
              {renderPaymentStatus()}

              {/* Filtros */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Filtrar Agendamentos</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setFilter('all')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilter('upcoming')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Próximos
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Concluídos
                  </button>
                  <button
                    onClick={() => setFilter('cancelled')}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancelados
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedAppointment && (
            <RatingModal
              appointmentId={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
            />
      )}
      {showRatingModal && (
            <RatingModal
              appointmentId={hireRequests[0]?.id || ''}
              onClose={() => setShowRatingModal(false)}
            />
      )}
    </div>
  );
};

export default ClientDashboard;
