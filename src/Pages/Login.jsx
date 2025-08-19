import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api'; 
import { setToken, setUser, isAuthenticated, getUserRole } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      console.log('✅ User already authenticated, redirecting...', userRole);
      redirectToRoleDashboard(userRole);
    }
  }, []);

  const redirectToRoleDashboard = (role) => {
    const routes = {
      'employee': '/employee-dashboard',
      'company': '/company-dashboard', 
      'admin': '/admin-dashboard',
      'super_admin': '/admin-dashboard'
    };
    
    const route = routes[role] || '/';
    console.log(`🔄 Redirecting ${role} to ${route}`);
    navigate(route, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    console.log('🔐 Login attempt for:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const data = await response.json();
      console.log('🔍 Login response:', data);
      
      if (!response.ok) {
        console.error('❌ Login failed:', data.error);
        setError(data.error || 'Login failed');
        return;
      }
      
      // Validate response data
      if (!data.token || !data.role || !data.userId) {
        console.error('❌ Invalid server response:', data);
        setError('Invalid response from server');
        return;
      }
      
      // Store authentication data
      setToken(data.token);
      const userData = { 
        role: data.role, 
        email: data.email || email.trim().toLowerCase(),
        userId: data.userId,
        full_name: data.full_name || data.name || ''
      };
      
      setUser(userData);
      
      // Additional localStorage for quick role access
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('✅ Login successful');
      console.log('📦 User data stored:', userData);

      // Small delay to ensure state is set before navigation
      setTimeout(() => {
        redirectToRoleDashboard(data.role);
      }, 100);
      
    } catch (err) {
      console.error('💥 Network error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#E6F5FF] to-[#1c266a] p-4">
      <div className="w-full max-w-md space-y-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-[#1c266a] text-center mb-6">
            Settlo HR Solutions
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#1c266a] transition-colors">
              <User className="text-[#1da46f] m-3" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 rounded-r-lg focus:outline-none bg-transparent"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#1c266a] transition-colors">
              <Lock className="text-[#1da46f] m-3" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 focus:outline-none bg-transparent"
                placeholder="********"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="m-3 text-gray-600 hover:text-[#1da46f] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-6 text-left">
            <Link
              to="/forgot-password"
              className="text-sm text-[#1da46f] font-medium hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              loading || !email || !password
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-[#1c266a] hover:bg-[#1da46f] text-white shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1da46f] font-semibold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
