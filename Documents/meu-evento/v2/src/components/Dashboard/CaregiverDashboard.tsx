import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  Timestamp,
  increment
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';

interface Appointment {
  id: string;
  clientId: string;
  caregiverId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'accept' | 'reject' | 'complete' | 'pending' | 'accepted' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  clientName?: string;
}

interface AppointmentGroup {
  pending: Appointment[];
  upcoming: Appointment[];
  completed: Appointment[];
  cancelled: Appointment[];
}

const CaregiverDashboard: React.FC = () => {
  const [user, authLoading, authError] = useAuthState(auth);
  const [appointments, setAppointments] = useState<AppointmentGroup>({
    pending: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<keyof AppointmentGroup>('pending');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedAppointments: 0,
    averageRating: 0,
    totalReviews: 0
  });

  useEffect(() => {
    console.log('Auth state:', { 
      userId: user?.uid, 
      isLoading: authLoading, 
      error: authError 
    });

    if (!user) {
      console.log('No user found, returning');
      return;
    }
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Starting to load dashboard data');
        
        // Primeiro verificar se o usuário é um cuidador
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log('User document:', userDoc.data());
        
        if (!userDoc.exists()) {
          throw new Error('Usuário não encontrado');
        }

        const userData = userDoc.data();
        if (userData.role !== 'caregiver') {
          throw new Error('Usuário não é um cuidador');
        }

        // Carregar dados em paralelo
        console.log('Loading appointments and stats');
        const [appointmentsResult, statsResult] = await Promise.all([
          fetchAppointments().catch(err => {
            console.error('Error in fetchAppointments:', err);
            throw new Error('Falha ao carregar agendamentos: ' + err.message);
          }),
          fetchStats().catch(err => {
            console.error('Error in fetchStats:', err);
            throw new Error('Falha ao carregar estatísticas: ' + err.message);
          })
        ]);

        console.log('Dashboard data loaded successfully');
      } catch (err) {
        console.error('Error in loadDashboardData:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    console.log('Fetching stats for user:', user.uid);
    
    try {
      // Buscar dados do cuidador
      const caregiverRef = doc(db, 'users', user.uid);
      const caregiverDoc = await getDoc(caregiverRef);
      
      if (!caregiverDoc.exists()) {
        console.error('Caregiver document not found');
        throw new Error('Perfil de cuidador não encontrado');
      }

      const caregiverData = caregiverDoc.data();
      console.log('Caregiver data:', caregiverData);

      // Buscar avaliações
      const reviewsQuery = query(
        collection(db, 'ratings'),
        where('caregiverId', '==', user.uid)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      console.log('Reviews count:', reviewsSnapshot.size);
      
      let totalRating = 0;
      reviewsSnapshot.forEach(doc => {
        const review = doc.data();
        totalRating += review.rating || 0;
      });

      const newStats = {
        totalEarnings: caregiverData.totalEarnings || 0,
        completedAppointments: caregiverData.completedAppointments || 0,
        averageRating: reviewsSnapshot.size > 0 ? totalRating / reviewsSnapshot.size : 0,
        totalReviews: reviewsSnapshot.size
      };
      
      console.log('Calculated stats:', newStats);
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      throw err;
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;
    console.log('Fetching appointments for user:', user.uid);
    
    try {
      const appointmentsQuery = query(
        collection(db, 'hireRequests'),
        where('caregiverId', '==', user.uid),
        orderBy('date', 'desc')
      );

      console.log('Executing appointments query');
      const querySnapshot = await getDocs(appointmentsQuery);
      console.log('Found appointments:', querySnapshot.size);
      
      const appointmentGroups: AppointmentGroup = {
        pending: [],
        upcoming: [],
        completed: [],
        cancelled: []
      };

      // Data limite para filtrar (30 dias atrás)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]; // Formato YYYY-MM-DD

      // Criar um array de promessas para processar os agendamentos
      const appointmentPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        console.log('Appointment Data:', {
          allData: data,
          possibleNameFields: {
            clientName: data.clientName,
            name: data.name,
            client_name: data.client_name,
            userName: data.userName,
            user_name: data.user_name
          }
        });
        console.log('Processing appointment data:', data);

        const appointment: Appointment = {
          id: doc.id,
          caregiverId: data.caregiverId,
          clientId: data.clientId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status || 'pending',
          notes: data.notes,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          clientName: data.clientName || 'Cliente' // Pegando o nome diretamente do documento
        };

        // Filtrar agendamentos antigos
        if (appointment.date >= thirtyDaysAgoStr) {
          const status = appointment.status.toLowerCase();
          if (status === 'pending') {
            appointmentGroups.pending.push(appointment);
          } else if (status === 'accepted') {
            appointmentGroups.upcoming.push(appointment);
          } else if (status === 'completed') {
            appointmentGroups.completed.push(appointment);
          } else if (status === 'cancelled' || status === 'rejected') {
            appointmentGroups.cancelled.push(appointment);
          }
        }
        return appointment;
      });

      // Aguardar todas as promessas serem resolvidas
      await Promise.all(appointmentPromises);

      console.log('Grouped appointments:', appointmentGroups);
      setAppointments(appointmentGroups);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      throw err;
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'reject' | 'complete') => {
    if (!user) return;
    
    try {
      const appointmentRef = doc(db, 'hireRequests', appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);
      const appointmentData = appointmentDoc.data();
      const appointmentValue = appointmentData?.value || 0; // Supondo que o valor do atendimento está armazenado aqui

      const newStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'completed';
      
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Atualizar totalEarnings do cuidador se o atendimento foi concluído
      if (action === 'complete') {
        const caregiverRef = doc(db, 'users', user.uid);
        await updateDoc(caregiverRef, {
          totalEarnings: increment(appointmentValue)
        });
        fetchStats(); // Atualizar estatísticas após a conclusão
      }

      // Atualizar o estado local
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Falha ao atualizar o agendamento');
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    return (
      <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{appointment.clientName}</h3>
            <p className="text-gray-600">
              {new Date(appointment.date).toLocaleDateString()} - {appointment.startTime} às {appointment.endTime}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
        
        {appointment.notes && (
          <p className="text-gray-700 mb-4">{appointment.notes}</p>
        )}
        
        <div className="flex justify-end space-x-2">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Aceitar
              </button>
              <button
                onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
            </>
          )}
          {appointment.status === 'accepted' && (
            <button
              onClick={() => handleAppointmentAction(appointment.id, 'complete')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Marcar como Concluído
            </button>
          )}
        </div>
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

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erro de autenticação. Por favor, faça login novamente.
        </div>
      </div>
    );
  }

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

  const handleSetAsCaregiverClick = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'caregiver',
        totalEarnings: 0,
        completedAppointments: 0,
        updatedAt: serverTimestamp()
      });
      window.location.reload(); // Recarregar a página para atualizar os dados
    } catch (err) {
      console.error('Error setting user as caregiver:', err);
      setError('Falha ao definir usuário como cuidador');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Painel do Cuidador</h1>
        <div className="flex space-x-4">
          <Link to="/caregiver-dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Dashboard
          </Link>
          <Link to="/appointments" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Agendamentos
          </Link>
          <Link to="/profile" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Perfil
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Ganhos Totais</h3>
              <p className="text-2xl font-bold text-green-600">R$ {stats.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Atendimentos</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.completedAppointments}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Avaliação Média</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
                <span className="text-sm text-gray-500 ml-2">({stats.totalReviews} avaliações)</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Solicitações Pendentes</h3>
              <p className="text-2xl font-bold text-orange-600">{appointments.pending.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {Object.keys(appointments).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as keyof AppointmentGroup)}
                  className={`${
                    selectedTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {' '}
                  ({appointments[tab as keyof AppointmentGroup].length})
                </button>
              ))}
            </nav>
          </div>

          {/* Appointment List */}
          <div className="space-y-4">
            {appointments[selectedTab].length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">Nenhum agendamento encontrado</p>
              </div>
            ) : (
              appointments[selectedTab].map(renderAppointmentCard)
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CaregiverDashboard;
