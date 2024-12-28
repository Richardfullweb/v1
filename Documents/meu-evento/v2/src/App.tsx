import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types/user';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Search from './components/Search';
import ClientDashboard from './components/Dashboard/ClientDashboard';
import AppointmentsPage from './components/Appointments/AppointmentsPage';
import PaymentPage from './components/Payments/PaymentPage';
import FavoritesPage from './components/FavoritesPage';
import CaregiverDashboard from './components/Dashboard/CaregiverDashboard';

// Loading component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
);

// Private Route component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const [user, loading] = useAuthState(auth);
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return <>{children}</>;
};

function App() {
    const [user, loading] = useAuthState(auth);
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

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Toaster position="top-right" />
                <Navbar />

                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/login"
                            element={
                                user ? (
                                    userProfile?.role === 'caregiver' ? (
                                        <Navigate to="/caregiver-dashboard" />
                                    ) : (
                                        <Navigate to="/dashboard" />
                                    )
                                ) : (
                                    <Login />
                                )
                            }
                        />
                        <Route
                            path="/register"
                            element={user ? (
                                userProfile?.role === 'caregiver' ? (
                                    <Navigate to="/caregiver-dashboard" />
                                ) : (
                                    <Navigate to="/dashboard" />
                                )
                            ) : (
                                <Register />
                            )
                            }
                        />

                        {/* Protected routes */}
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/search"
                            element={
                                <PrivateRoute>
                                    <Search />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <ClientDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/caregiver-dashboard"
                            element={
                                <PrivateRoute>
                                    <CaregiverDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/appointments"
                            element={
                                <PrivateRoute>
                                    <AppointmentsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/payments"
                            element={
                                <PrivateRoute>
                                    <PaymentPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/favorites"
                            element={
                                <PrivateRoute>
                                    <FavoritesPage />
                                </PrivateRoute>
                            }
                        />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>

                <footer className="bg-gray-800 text-white py-4 mt-auto">
                    <div className="container mx-auto px-4 text-center">
                        <p>© {new Date().getFullYear()} CareConnect. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;