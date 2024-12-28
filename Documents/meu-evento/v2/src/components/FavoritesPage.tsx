import React from 'react';
import useFavorites from '../hooks/useFavorites';
import { Link } from 'react-router-dom';

const FavoritesPage: React.FC = () => {
  const { favorites, loading, error } = useFavorites();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Meus Cuidadores Favoritos</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">Você ainda não tem cuidadores favoritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((caregiver) => (
            <div key={caregiver.uid} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Link to={`/profile/${caregiver.uid}`}>
                <div className="flex flex-col items-center">
                  {caregiver.photoURL ? (
                    <img
                      src={caregiver.photoURL}
                      alt={caregiver.name}
                      className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mb-4 bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl text-gray-500">
                        {caregiver.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{caregiver.name}</h3>
                  {Array.isArray(caregiver.specialties) && caregiver.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {caregiver.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                  {caregiver.bio && (
                    <p className="text-gray-600 text-sm text-center line-clamp-2 mb-2">
                      {caregiver.bio}
                    </p>
                  )}
                  <span className="text-blue-500 hover:text-blue-600 text-sm">
                    Clique para ver o perfil completo
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
