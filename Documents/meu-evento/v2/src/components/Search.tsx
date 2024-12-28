import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CaregiverSearchFilters, SearchResult } from '../types/caregiver';
import { Link } from 'react-router-dom';
import HireRequestForm from './Scheduling/HireRequestForm';
import useFavorites from '../hooks/useFavorites';
import { ReviewStats } from '../types/review';
import CaregiverProfileModal from './modals/CaregiverProfileModal';

const Search: React.FC = () => {
  const [filters, setFilters] = useState<CaregiverSearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState<string | null>(null);

  const specialties = [
    { label: 'Médico Geriatra', value: 'medico' },
    { label: 'Fisioterapeuta', value: 'fisioterapia' },
    { label: 'Cuidador de Idosos', value: 'cuidador' },
    { label: 'Enfermagem', value: 'enfermagem' }
  ];

  const fetchReviewStats = async (caregiverId: string) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('caregiverId', '==', caregiverId)
      );
      const querySnapshot = await getDocs(q);
      let totalRating = 0;
      let totalReviews = 0;
      const ratingCounts: { [key: number]: number } = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };

      querySnapshot.forEach((doc) => {
        const review = doc.data() as any;
        totalRating += review.rating;
        ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
        totalReviews++;
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      setReviewStats(prev => ({
        ...prev,
        [caregiverId]: {
          averageRating,
          totalReviews,
          ratingCounts
        }
      }));
    } catch (err) {
      console.error('Error fetching review stats:', err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      // Criar a query base
      let caregiverQuery = query(
        collection(db, 'users'),
        where('role', '==', 'caregiver')
      );

      // Adicionar filtro de especialidade se especificado
      if (filters.specialty) {
        caregiverQuery = query(
          collection(db, 'users'),
          where('role', '==', 'caregiver'),
          where('specialty', '==', filters.specialty)
        );
      }

      const querySnapshot = await getDocs(caregiverQuery);
      
      if (querySnapshot.empty) {
        setResults([]);
        setError('Nenhum cuidador encontrado com os filtros especificados.');
        return;
      }

      const caregivers: SearchResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as SearchResult;
        
        // Aplicar filtros do lado do cliente
        if (
          (!filters.minRate || data.hourlyRate >= filters.minRate) &&
          (!filters.maxRate || data.hourlyRate <= filters.maxRate) &&
          (!filters.rating || data.rating >= filters.rating)
        ) {
          caregivers.push({
            id: doc.id,
            ...data
          });
          fetchReviewStats(doc.id);
        }
      });

      if (caregivers.length === 0) {
        setError('Nenhum cuidador encontrado com os critérios especificados.');
      }

      setResults(caregivers);
    } catch (err) {
      console.error('Error searching caregivers:', err);
      setError('Erro ao buscar cuidadores. Por favor, tente novamente.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filters]);

  const handleScheduleClick = (caregiverId: string) => {
    setSelectedCaregiverId(caregiverId);
  };

  const handleCloseModal = () => {
    setSelectedCaregiverId(null);
  };

  const handleFavoriteClick = async (caregiverId: string) => {
    const isFavorite = favorites.some(favorite => favorite.uid === caregiverId);
    if (isFavorite) {
      await removeFavorite(caregiverId);
    } else {
      await addFavorite(caregiverId);
    }
  };

  const handleViewProfile = (caregiver) => {
    const caregiverData = {
      id: caregiver.id,
      name: caregiver.fullName,
      email: caregiver.email,
      phone: caregiver.phone,
      address: caregiver.address,
      bio: caregiver.bio,
      category: caregiver.category,
      specialty: caregiver.specialty,
      experienceYears: caregiver.experienceYears,
      experienceDescription: caregiver.experienceDescription,
      hourlyRate: caregiver.hourlyRate
    };
    setSelectedCaregiver(caregiverData);
    setIsModalOpen(true);
  };

  const fetchRatings = async () => {
    try {
      const ratingsCollection = collection(db, 'ratings');
      const ratingsSnapshot = await getDocs(ratingsCollection);
      
      if (ratingsSnapshot.empty) {
        setErrorRatings("Nenhuma avaliação encontrada.");
        return;
      }

      const ratingsList = ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRatings(ratingsList);
    } catch (error) {
      console.error("Erro ao buscar ratings:", error);
      setErrorRatings("Ocorreu um erro ao buscar as avaliações.");
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  if (loadingRatings) {
    return <div>Carregando...</div>;
  }

  if (errorRatings) {
    return <div>{errorRatings}</div>; 
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Procurar</h2>
          
          {/* Specialty Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidade
            </label>
            <select
              value={filters.specialty || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toddos</option>
              {specialties.map(specialty => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rate Range Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Faixa de valor($)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minRate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minRate: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxRate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxRate: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Classificação
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Classificação</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>
                  {rating}+ Estrelas
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum cuidador encontrado com as informações fornecidas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((caregiver) => (
                <div key={caregiver.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <img
                        src={caregiver.imageUrl || '/default-avatar.png'}
                        alt={caregiver.fullName}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{caregiver.fullName}</h3>
                        <div className="text-lg font-semibold text-green-600">
                          ${caregiver.hourlyRate}/hr
                        </div>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, index) => {
                            const rating = ratings.find(r => r.caregiverId === caregiver.id);
                            const ratingValue = rating ? rating.rating : 0;
                            return (
                              <svg
                                key={index}
                                className={`h-5 w-5 ${index < ratingValue ? 'text-yellow-500' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 15.585l-7.07 4.425 1.35-7.845L.72 7.775l7.88-.68L10 0l2.4 7.095 7.88.68-5.56 4.39 1.35 7.845z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            );
                          })}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {(() => {
                            const rating = ratings.find(r => r.caregiverId === caregiver.id);
                            return `(${rating ? rating.rating : '0.0'} de 5)`;
                          })()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{caregiver.bio}</p>
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700">Especialidades:</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {caregiver.specialties && Array.isArray(caregiver.specialties) ? (
                            caregiver.specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {specialty}
                              </span>
                            ))
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-4">
                        <button
                          onClick={() => handleViewProfile(caregiver)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          Ver Perfil
                        </button>
                        <button
                          onClick={() => handleScheduleClick(caregiver.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Agendar
                        </button>
                        <button
                          onClick={() => handleFavoriteClick(caregiver.id)}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                            favorites.some(favorite => favorite.uid === caregiver.id)
                              ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {favorites.some(favorite => favorite.uid === caregiver.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                        </button>
                        {selectedCaregiverId === caregiver.id && (
                          <HireRequestForm
                            caregiverId={caregiver.id}
                            onClose={handleCloseModal}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CaregiverProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caregiver={selectedCaregiver}
      />
    </div>
  );
};

export default Search;
