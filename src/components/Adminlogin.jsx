import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api'; 

const AdminLogin = ({ setEmail, setPassword }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('admin123');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'otp', 'success'
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const resetForm = () => {
    setAdminEmail(selectedRole === 'super_admin' ? 'admin@settlo.com' : 'admin@example.com');
    setAdminPassword('admin123');
    setConfirmPassword('admin123');
    setOtp('');
    setStep('form');
    setMessage(null);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // Auto-update email based on role
    if (role === 'super_admin') {
      setAdminEmail('admin@settlo.com');
    } else {
      setAdminEmail('admin@example.com');
    }
  };

  const handleSendOTP = async () => {
    if (!adminEmail || !adminPassword || !confirmPassword) {
      setMessage('All fields are required');
      return;
    }

    if (adminPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (adminPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    if (selectedRole === 'super_admin' && !adminEmail.toLowerCase().includes('settlo')) {
      setMessage('Super admin email must contain "settlo"');
      return;
    }

    if (!window.confirm(`Create ${selectedRole === 'super_admin' ? 'Super Admin' : 'Admin'} account with these credentials?`)) {
      return;
    }

    setIsCreating(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-admin-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('OTP sent to your email successfully!');
        setStep('otp');
      } else {
        setMessage(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setMessage('Connection error. Please check if the server is running.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      return;
    }

    setIsCreating(true);
    setMessage(null);

      try {
        const res = await fetch(`${API_BASE_URL}/auth/register/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          otp: otp,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`${selectedRole === 'super_admin' ? 'Super Admin' : 'Admin'} account created successfully!`);
        setStep('success');
        // Auto-fill login credentials if parent component provides these functions
        if (setEmail && setPassword) {
          setEmail(adminEmail);
          setPassword(adminPassword);
        }
        
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setMessage('Connection error. Please check if the server is running.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendOTP = async () => {
    setIsCreating(true);
    setMessage(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-admin-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('New OTP sent successfully!');
        setOtp(''); // Clear previous OTP
      } else {
        setMessage(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setMessage('Connection error. Please check if the server is running.');
    } finally {
      setIsCreating(false);
    }
  };

  // Only show in development environment
  if (!import.meta.env.DEV) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F5FF] to-[#1c266a] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Registration</h2>
          <p className="text-sm text-gray-600 mt-1">Development Environment Only</p>
        </div>

        {/* Navigation breadcrumb */}
        <div className="flex items-center justify-center mb-4">
          <div className={`flex items-center ${step === 'form' ? 'text-blue-600' : step === 'otp' ? 'text-gray-400' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
            <span className="ml-2 text-xs">Details</span>
          </div>
          <div className="w-8 h-px bg-gray-300 mx-2"></div>
          <div className={`flex items-center ${step === 'otp' ? 'text-blue-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'otp' ? 'bg-blue-600 text-white' : step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
            <span className="ml-2 text-xs">Verify</span>
          </div>
          <div className="w-8 h-px bg-gray-300 mx-2"></div>
          <div className={`flex items-center ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
            <span className="ml-2 text-xs">Done</span>
          </div>
        </div>

        {/* Step 1: Registration Form */}
        {step === 'form' && (
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Admin Role</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    selectedRole === 'admin' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRoleChange('super_admin')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    selectedRole === 'super_admin' 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Super Admin
                </button>
              </div>
              {selectedRole === 'super_admin' && (
                <p className="text-xs text-purple-600 mt-2 bg-purple-50 p-2 rounded">
                  ✨ Super admin email must contain "settlo"
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedRole === 'super_admin' ? 'Super Admin Email' : 'Admin Email'}
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={selectedRole === 'super_admin' ? 'admin@settlo.com' : 'admin@example.com'}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password (min 8 characters)"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm password"
              />
            </div>

            <button
              onClick={handleSendOTP}
              disabled={isCreating}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${
                isCreating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : selectedRole === 'super_admin'
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isCreating 
                ? 'Sending OTP...' 
                : `Send OTP for ${selectedRole === 'super_admin' ? 'Super Admin' : 'Admin'}`}
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <p><strong>OTP sent to:</strong> {adminEmail}</p>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <p><strong>Role:</strong> {selectedRole === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">Check your email for the 6-digit OTP</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-4 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="● ● ● ● ● ●"
                maxLength="6"
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={isCreating || otp.length !== 6}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${
                isCreating || otp.length !== 6
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isCreating ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleResendOTP}
                disabled={isCreating}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isCreating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isCreating ? 'Sending...' : 'Resend OTP'}
              </button>

              <button
                onClick={() => setStep('form')}
                disabled={isCreating}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-all"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="text-green-600 text-5xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-green-800 mb-2">
                {selectedRole === 'super_admin' ? 'Super Admin' : 'Admin'} Account Created!
              </h3>
              <p className="text-sm text-green-700">
                Credentials have been auto-filled in the login form
              </p>
              <p className="text-xs text-green-600 mt-2">
                Redirecting to login page in 2 seconds...
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={resetForm}
                className="flex-1 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                Create Another Account
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                Go to Login →
              </button>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('success') || message.includes('sent') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

\
        <div className="mt-6 text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p><strong>Admin:</strong> Standard administrative access to the system</p>
          <p><strong>Super Admin:</strong> Full system control with advanced privileges</p>
          <p><strong>Note:</strong> OTP will be sent to the provided email for verification</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
