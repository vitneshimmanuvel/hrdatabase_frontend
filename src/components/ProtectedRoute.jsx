import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, getDashboardRoute, setLastVisitedPage } from '../utils/auth';
import { API_BASE_URL } from '../config/api'; 
const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState({
    isAuth: false,
    userRole: null,
    hasAccess: false
  });
  
  const location = useLocation();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Checking access...');
    
    const checkAccess = async () => {
      try {
        const isAuth = isAuthenticated();
        const userRole = getUserRole();
        
        console.log('🔍 Auth check result:', { 
          isAuthenticated: isAuth, 
          currentRole: userRole, 
          requiredRole: requiredRole,
          currentPath: location.pathname
        });

        let hasAccess = false;

        if (isAuth && userRole) {
          if (requiredRole) {
            // Special handling for admin routes - both admin and super_admin can access
            if (requiredRole === 'admin' && ['admin', 'super_admin'].includes(userRole)) {
              hasAccess = true;
              console.log('✅ Admin access granted (includes super_admin)');
            } else if (userRole === requiredRole) {
              hasAccess = true;
              console.log('✅ Role match - access granted');
            } else {
              console.log(`❌ Role mismatch: required ${requiredRole}, got ${userRole}`);
              hasAccess = false;
            }
          } else {
            // No specific role required, just authentication
            hasAccess = true;
            console.log('✅ Authentication sufficient - access granted');
          }
        } else {
          console.log('❌ Not authenticated');
          // Save current path for redirect after login
          if (isAuth === false) {
            setLastVisitedPage(location.pathname);
          }
        }

        setAuthState({
          isAuth,
          userRole,
          hasAccess
        });
        
      } catch (error) {
        console.error('🚨 Error checking authentication:', error);
        setAuthState({
          isAuth: false,
          userRole: null,
          hasAccess: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requiredRole, location.pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c266a] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuth) {
    console.log('🔄 Redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based access control
  if (!authState.hasAccess) {
    const userRole = authState.userRole;
    
    // If user has a valid role but not the required one, redirect to their dashboard
    if (userRole && ['employee', 'company', 'admin', 'super_admin'].includes(userRole)) {
      const correctDashboard = getDashboardRoute(userRole);
      console.log(`🔄 Redirecting ${userRole} to correct dashboard: ${correctDashboard}`);
      return <Navigate to={correctDashboard} replace />;
    } else {
      // Unknown role or other access issue - show unauthorized
      console.log('🚫 Redirecting to unauthorized page');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed - render the protected component
  console.log('✅ All access checks passed - rendering protected content');
  return children;
};

export default ProtectedRoute;
