import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// User pages
import HomePage from './pages/user/HomePage';
import ScanPage from './pages/user/ScanPage';
import ResultPage from './pages/user/ResultPage';
import MapPage from './pages/user/MapPage';
import EmergencyPage from './pages/user/EmergencyPage';
import ProfilePage from './pages/user/ProfilePage';
import RequestsPage from './pages/user/RequestsPage';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderRequests from './pages/provider/ProviderRequests';
import ProviderProfile from './pages/provider/ProviderProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRequests from './pages/admin/AdminRequests';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Not found
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes with layout */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* User routes */}
              <Route path="home" element={<HomePage />} />
              <Route path="scan" element={<ScanPage />} />
              <Route path="result/:requestId" element={<ResultPage />} />
              <Route path="map/:requestId" element={<MapPage />} />
              <Route path="emergency" element={<EmergencyPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="requests" element={<RequestsPage />} />
              
              {/* Provider routes */}
              <Route path="provider/dashboard" element={<ProviderDashboard />} />
              <Route path="provider/requests" element={<ProviderRequests />} />
              <Route path="provider/profile" element={<ProviderProfile />} />
              
              {/* Admin routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/requests" element={<AdminRequests />} />
              <Route path="admin/analytics" element={<AdminAnalytics />} />
            </Route>
            
            {/* Redirect old routes */}
            <Route path="/user/*" element={<Navigate to="/app" replace />} />
            <Route path="/provider/*" element={<Navigate to="/app" replace />} />
            <Route path="/admin/*" element={<Navigate to="/app" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
