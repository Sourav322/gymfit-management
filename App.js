import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import PendingApprovals from './pages/admin/PendingApprovals';
import QRManager from './pages/admin/QRManager';
import AttendanceReport from './pages/admin/AttendanceReport';
import MemberDashboard from './pages/member/Dashboard';
import QRScanner from './pages/member/QRScanner';
import MemberAttendance from './pages/member/Attendance';
import MemberProfile from './pages/member/Profile';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        height: '100vh', background: '#0a0a0f', color: '#8888aa', 
        fontFamily: 'Barlow Condensed, sans-serif', fontSize: 18 
      }}>
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/member/dashboard" replace /> : <Signup />} />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/members" element={<ProtectedRoute role="admin"><Members /></ProtectedRoute>} />
      <Route path="/admin/pending" element={<ProtectedRoute role="admin"><PendingApprovals /></ProtectedRoute>} />
      <Route path="/admin/qr" element={<ProtectedRoute role="admin"><QRManager /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><AttendanceReport /></ProtectedRoute>} />

      {/* Member routes */}
      <Route path="/member/dashboard" element={<ProtectedRoute role="member"><MemberDashboard /></ProtectedRoute>} />
      <Route path="/member/scan" element={<ProtectedRoute role="member"><QRScanner /></ProtectedRoute>} />
      <Route path="/member/attendance" element={<ProtectedRoute role="member"><MemberAttendance /></ProtectedRoute>} />
      <Route path="/member/profile" element={<ProtectedRoute role="member"><MemberProfile /></ProtectedRoute>} />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
