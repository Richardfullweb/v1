import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Marketing from './pages/Marketing';
import Promotion from './pages/Promotion';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import EventCreation from './pages/EventCreation';
import Users from './pages/Users';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/promotion" element={<Promotion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route
              path="events/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'organizador']}>
                  <EventCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<Settings />} />
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}