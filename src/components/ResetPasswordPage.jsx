import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config/api'; 
export default function ResetPasswordPage() {
  const [password, setPassword] = useState(''); // ✅ Changed from newPassword to password
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  // Get token from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 8) { // ✅ Added validation to match backend
      setMessage('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }), // ✅ Correct body - only token and password
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        throw new Error(data.error || 'Password reset failed');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-primary-green p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
          <button 
            onClick={() => navigate('/forgot-password')}
            className="bg-[#1c266a] hover:bg-[#1da46f] text-white py-2 px-4 rounded-lg"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-primary-green p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-primary-dark text-center mb-6">
          Reset Password
        </h2>
        {message && (
          <p className={`mb-4 text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">New Password</label>
          <div className="flex items-center border rounded-lg">
            <Lock className="text-primary-green m-2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password} // ✅ Updated variable name
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8} // ✅ Added minLength validation
              className="w-full p-3 focus:outline-none"
              placeholder="New Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="m-2 text-gray-600 hover:text-primary-green"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <div className="flex items-center border rounded-lg">
            <Lock className="text-primary-green m-2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 focus:outline-none"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="m-2 text-gray-600 hover:text-primary-green"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#1c266a] hover:bg-[#1da46f] text-white'}`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
