import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function OTPPage() {
  const location = useLocation();
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) setResendDisabled(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('New OTP sent!');
        setResendDisabled(true);
        setCountdown(180);
      } else {
        throw new Error(data.error || 'Could not resend OTP');
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/auth/reset-password-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
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
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-2">
            <span className="font-medium">Email:</span>
            <span className="text-primary-green">{email}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            OTP (6 digits) 
            {countdown > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                (Expires in: {formatTime(countdown)})
              </span>
            )}
          </label>
          <div className="flex items-center border rounded-lg">
            <Lock className="text-primary-green m-2" />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              pattern="\d{6}"
              title="6-digit code"
              className="w-full p-3 focus:outline-none"
              placeholder="Enter OTP"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">New Password</label>
          <div className="flex items-center border rounded-lg">
            <Lock className="text-primary-green m-2" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 focus:outline-none"
              placeholder="New Password"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <div className="flex items-center border rounded-lg">
            <Lock className="text-primary-green m-2" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 focus:outline-none"
              placeholder="Confirm Password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition mb-4
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#1c266a] hover:bg-[#1da46f] text-white'}`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        
        <div className="text-center">
          <button 
            type="button" 
            onClick={handleResendOTP}
            disabled={resendDisabled || loading}
            className={`text-primary-green font-semibold hover:underline
              ${resendDisabled ? 'text-gray-400 cursor-not-allowed' : ''}`}
          >
            Resend OTP
          </button>
        </div>
      </form>
    </div>
  );
}