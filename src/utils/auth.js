  // Enhanced token management with expiration checking
  export const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('tokenSetAt', Date.now().toString());
      console.log('🔐 Token stored successfully');
    }
  };

  export const getToken = () => {
    const token = localStorage.getItem('token');
    const tokenSetAt = localStorage.getItem('tokenSetAt');
    
    if (!token || !tokenSetAt) {
      return null;
    }

    // Check if token is older than 23 hours (before 24h expiry)
    const tokenAge = Date.now() - parseInt(tokenSetAt);
    const maxAge = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
    
    if (tokenAge > maxAge) {
      console.log('🕐 Token is close to expiry, clearing...');
      removeToken();
      return null;
    }
    
    return token;
  };

  export const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenSetAt');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
  };

  // Enhanced user management with validation
  export const setUser = (user) => {
    if (user && typeof user === 'object') {
      // Ensure required fields exist
      const userData = {
        role: user.role,
        email: user.email,
        userId: user.userId,
        full_name: user.full_name || '',
        ...user
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      console.log('👤 User data stored:', userData);
    }
  };

  export const getUser = () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      const parsedUser = JSON.parse(user);
      
      // Validate user object has required fields
      if (!parsedUser.role || !parsedUser.email || !parsedUser.userId) {
        console.log('❌ Invalid user data found, clearing...');
        removeUser();
        return null;
      }
      
      return parsedUser;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      removeUser();
      return null;
    }
  };

  export const removeUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
  };

  // Enhanced authentication validation
  export const isAuthenticated = () => {
    const token = getToken();
    const user = getUser();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!token || !user || !isLoggedIn) {
      console.log('❌ Missing authentication data');
      clearAuthData();
      return false;
    }

    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 <= Date.now();
      
      if (isExpired) {
        console.log('❌ Token has expired');
        clearAuthData();
        return false;
      }
      
      // Validate user data matches token
      if (payload.userId !== user.userId || payload.role !== user.role) {
        console.log('❌ Token/user data mismatch');
        clearAuthData();
        return false;
      }
      
      console.log('✅ Authentication valid');
      return true;
    } catch (error) {
      console.error('❌ Error validating token:', error);
      clearAuthData();
      return false;
    }
  };

  // Clear all auth data
  export const clearAuthData = () => {
    removeToken();
    removeUser();
    localStorage.removeItem('isLoggedIn');
  };

  // Enhanced logout with redirect
  export const logout = (redirectTo = '/login') => {
    console.log('🚪 User logging out...');
    clearAuthData();
    
    // Clear any additional app-specific data
    localStorage.removeItem('lastVisitedPage');
    
    // Redirect after clearing data
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 100);
  };

  // Role-based access control
  export const getUserRole = () => {
    const user = getUser();
    return user ? user.role : localStorage.getItem('userRole');
  };

  export const hasRole = (requiredRole) => {
    const userRole = getUserRole();
    return userRole === requiredRole;
  };

  export const hasAnyRole = (roles) => {
    const userRole = getUserRole();
    return roles.includes(userRole);
  };

  export const isAdmin = () => hasAnyRole(['admin', 'super_admin']);
  export const isSuperAdmin = () => hasRole('super_admin');
  export const isEmployee = () => hasRole('employee');
  export const isCompany = () => hasRole('company');

  // Permission checks
  export const canDelete = () => isSuperAdmin();
  export const canEdit = () => isSuperAdmin();
  export const canCreate = () => isAdmin();
  export const canView = () => isAdmin();
  export const canManageUsers = () => isSuperAdmin();

  // HTTP headers utility with error handling
  export const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // API call helper with automatic token handling
  export const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });
      
      // Handle token expiry
      if (response.status === 401 || response.status === 403) {
        console.log('🔒 Authentication failed, logging out...');
        logout();
        throw new Error('Authentication failed');
      }
      
      return response;
    } catch (error) {
      console.error('🚨 API call failed:', error);
      throw error;
    }
  };

  // Session persistence helper
  export const initializeAuth = () => {
    console.log('🔄 Initializing authentication...');
    
    if (isAuthenticated()) {
      const user = getUser();
      console.log('✅ User session restored:', user?.email, user?.role);
      return true;
    } else {
      console.log('❌ No valid session found');
      clearAuthData();
      return false;
    }
  };

  // Role constants
  export const ROLES = {
    EMPLOYEE: 'employee',
    COMPANY: 'company',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  };

  // Dashboard route mapping
  export const getDashboardRoute = (role) => {
    const routes = {
      [ROLES.EMPLOYEE]: '/employee-dashboard',
      [ROLES.COMPANY]: '/company-dashboard',
      [ROLES.ADMIN]: '/admin-dashboard',
      [ROLES.SUPER_ADMIN]: '/admin-dashboard'
    };
    return routes[role] || '/';
  };

  // Save last visited page for redirect after login
  export const setLastVisitedPage = (path) => {
    localStorage.setItem('lastVisitedPage', path);
  };

  export const getLastVisitedPage = () => {
    return localStorage.getItem('lastVisitedPage');
  };

  export const clearLastVisitedPage = () => {
    localStorage.removeItem('lastVisitedPage');
  };
