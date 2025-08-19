import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { API_BASE_URL } from '../config/api'; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (res.ok) {
        // Navigate to OTP page with email
        navigate('/otp', { state: { email } });
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-primary-green p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-primary-dark text-center mb-6">
          Forgot Password
        </h2>
        {message && (
          <p className={`mb-4 text-center text-red-600`}>
            {message}
          </p>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email Address</label>
          <div className="flex items-center border rounded-lg">
            <Mail className="text-primary-green m-2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-r-lg focus:outline-none"
              placeholder="you@example.com"
            />
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
          {loading ? 'Sending...' : 'Send OTP'}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Remembered your password?{' '}
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            className="text-primary-green font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
