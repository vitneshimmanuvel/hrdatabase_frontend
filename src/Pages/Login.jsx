import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { setToken, setUser } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Login failed');
        return;
      }
      
      // Store token and user info - CORRECTED VERSION
      setToken(data.token); // Store token in localStorage
      setUser({ role: data.role }); // Store user role

      // Redirect based on role
      if (data.role === 'employee') navigate('/employee-dashboard');
      else if (data.role === 'company') navigate('/company-dashboard');
      else if (data.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#E6F5FF] to-[#1c266a] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-primary-dark text-center mb-6">
          Settlo HR Solutions
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <div className="flex items-center border rounded-lg">
            <User className="text-primary-green m-2" />
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

        <div className="mb-2">
          <label className="block text-gray-700 mb-2">Password</label>
          <div className="flex items-center border rounded-lg">
            <Lock className="text-primary-green m-2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 focus:outline-none"
              placeholder="********"
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

        <div className="mb-6 text-left">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-green font-medium hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#1c266a] hover:bg-[#1da46f] text-white'
          }`}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-green font-semibold">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}