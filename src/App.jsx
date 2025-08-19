import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeAuth, isAuthenticated, getUserRole, getDashboardRoute } from './utils/auth';
import Login from './Pages/Login';
import Register from './Pages/Register';
import EmployeeDashboard from './components/Employee_Dashboard';
import CompanyDashboard from './components/CompanyDashboard';
import AdminDashboard from './components/AdminDashboard';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import OTPPage from './components/OTPPage';
import AdminLogin from './components/Adminlogin';
import ProtectedRoute from './components/ProtectedRoute'; 
import Unauthorized from './components/Unauthorized';

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {

    console.log('🚀 Initializing app authentication...');
    const isValidAuth = initializeAuth();
    setAuthInitialized(true);
    
    if (isValidAuth) {
      const userRole = getUserRole();
      console.log('✅ Valid session found for role:', userRole);
    } else {
      console.log('❌ No valid session found');
    }
  }, []);

  // Smart home route that redirects based on authentication status
  const SmartHomeRoute = () => {
    if (!authInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c266a]"></div>
        </div>
      );
    }

    if (isAuthenticated()) {
      const userRole = getUserRole();
      const dashboardRoute = getDashboardRoute(userRole);
      console.log(`🏠 Authenticated user (${userRole}) redirecting to ${dashboardRoute}`);
      return <Navigate to={dashboardRoute} replace />;
    }
    
    console.log('🔄 No authentication, redirecting to login');
    return <Navigate to="/login" replace />;
  };

  // Show loading screen while checking authentication
  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#E6F5FF] to-[#1c266a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
  <Routes>
  {/* Public Routes */}
  <Route path="/" element={<SmartHomeRoute />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="/otp" element={<OTPPage />} />
  <Route path="/admin-login" element={<AdminLogin />} />  {/* Fixed path */}
  <Route path="/unauthorized" element={<Unauthorized />} />
  
  {/* Protected Routes with Nested Route Support */}
  <Route 
    path="/employee-dashboard/*" 
    element={
      <ProtectedRoute requiredRole="employee">
        <EmployeeDashboard />
      </ProtectedRoute>
    } 
  />
  
  <Route 
    path="/company-dashboard/*" 
    element={
      <ProtectedRoute requiredRole="company">
        <CompanyDashboard />
      </ProtectedRoute>
    } 
  />
  
  <Route 
    path="/admin-dashboard/*" 
    element={
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />

  {/* Catch-all route */}
  <Route 
    path="*" 
    element={<SmartHomeRoute />} 
  />
</Routes>

  );
}

export default App;
