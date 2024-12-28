import React from 'react';
    import { Routes, Route } from 'react-router-dom';
    import Login from './components/Login';
    import CaregiverDashboard from './components/CaregiverDashboard';
    import { AuthProvider } from './context/AuthContext';
    import PrivateRoute from './components/PrivateRoute';

    function App() {
      return (
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <CaregiverDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      );
    }

    export default App;
