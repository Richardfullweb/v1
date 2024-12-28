import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types/user';
import NotificationBell from './notifications/NotificationBell';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          CareConnect
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {userProfile?.role === 'caregiver' ? (
                // Links para cuidadores
                <>
                  <Link to="/caregiver-dashboard" className="text-white hover:text-gray-300">
                    Dashboard
                  </Link>
                  <Link to="/appointments" className="text-white hover:text-gray-300">
                    Agendamentos
                  </Link>
                </>
              ) : (
                // Links para clientes
                <>
                  <Link to="/dashboard" className="text-white hover:text-gray-300">
                    Dashboard
                  </Link>
                  <Link to="/search" className="text-white hover:text-gray-300">
                    Buscar Cuidadores
                  </Link>
                  <Link to="/favorites" className="text-white hover:text-gray-300">
                    Favoritos
                  </Link>
                </>
              )}
              <Link to="/profile" className="text-white hover:text-gray-300">
                Perfil
              </Link>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-gray-300">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
