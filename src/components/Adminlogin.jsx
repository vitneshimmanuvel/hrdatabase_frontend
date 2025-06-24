import React, { useState } from 'react';

const AdminLogin = ({ setEmail, setPassword }) => {
  const [adminEmail, setAdminEmail] = useState('admin@settlo.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAdminRegister = async () => {
    if (!window.confirm("Create admin account with these credentials?")) return;
    
    setIsCreating(true);
    setMessage(null);
    
    try {
      const res = await fetch('http://localhost:4000/auth/register/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Admin created successfully!');
        // Auto-fill credentials after creation
        setEmail(adminEmail);
        setPassword(adminPassword);
      } else {
        setMessage(data.error || 'Admin creation failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Connection error');
    } finally {
      setIsCreating(false);
    }
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-blue-700 mb-2">
        Admin Access (Development Only)
      </h3>
      
      <div className="space-y-3 mb-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Admin Email</label>
          <input
            type="text"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            placeholder="admin@example.com"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Admin Password</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            placeholder="Admin password"
          />
        </div>
      </div>
      
      {message && (
        <div className={`mb-3 p-2 rounded text-sm ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
      
      <button
        onClick={handleAdminRegister}
        disabled={isCreating}
        className={`w-full py-2 rounded-lg text-sm font-medium transition ${
          isCreating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-800 text-white hover:bg-blue-700'
        }`}
      >
        {isCreating ? 'Creating Admin...' : 'Create Admin Account'}
      </button>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Note: This will create a new admin account in the database.</p>
        <p>Use these credentials to log in as admin.</p>
      </div>
    </div>
  );
};

export default AdminLogin;