import React, { useState } from 'react';
import RoleSelect from '../components/RoleSelect';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  FileText,
  Cpu,
  MapPin,
  DollarSign,
  Code,
  Lock,
  Eye,
  EyeOff,
  Building,
  
} from 'lucide-react';

// Input restrictions
function allowOnlyLetters(e) {
  const char = e.key;
  if (!/^[a-zA-Z\s]$/.test(char) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(char)) {
    e.preventDefault();
  }
}

function allowOnlyNumbers(e) {
  const char = e.key;
  if (!/^[0-9]$/.test(char) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(char)) {
    e.preventDefault();
  }
}

export default function Register() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    mobile: '+91', 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'mobile') {
      if (value.startsWith('+91') && value.length <= 13) {
        setForm({ ...form, [id]: value });
      } else if (value === '+9') {
        setForm({ ...form, [id]: value });
      } else if (value.length < 4) {

        setForm({ ...form, [id]: '+91' });
      } else {
        setForm({ ...form, [id]: form.mobile });
      }
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  const checkEmail = async (email) => {
    try {
      // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/check-email?email=${email}`);
       const res = await fetch(`http://localhost:4000/auth/check-email?email=${email}`);
      const data = await res.json();
      setEmailExists(data.exists);
    } catch (err) {
      console.error('Email check failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    setEmailExists(false);

    try {
      // Check if email is already registered
      await checkEmail(form.email);
      if (emailExists) {
        setLoading(false);
        return;
      }

      const payload = { role, ...form };

      const res = await fetch(`http://localhost:4000/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      alert('Registration successful! Please login.');
      navigate('/login');

    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#E6F5FF] to-[#1c266a]  p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-primary-dark text-center mb-4">
          Register as {role || '...'}
        </h2>

        {/* Role Selection */}
        <div>
          <label className="block text-gray-700 mb-1">I am a</label>
          <RoleSelect value={role} onChange={(e) => setRole(e.target.value)} />
        </div>

        {/* Employee Fields */}
        {role === 'employee' && (
          <>
            <div className="flex items-center border rounded-lg">
              <User className="text-primary-green m-2" />
              <input
                id="name"
                type="text"
                placeholder="Full Name"
                onKeyDown={allowOnlyLetters}
                value={form.name || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg">
              <Phone className="text-primary-green m-2" />
              <input
                id="mobile"
                type="text" // Changed to text to allow input masking
                placeholder="+91XXXXXXXXXX"
                value={form.mobile}
                onChange={handleChange}
                onKeyDown={allowOnlyNumbers}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
              {form.mobile.length !== 13 && (
                <p className="text-red-500 text-sm mt-1">Mobile number must be 10 digits long</p>
              )}
            </div>

            <div className="flex items-center border rounded-lg">
              <Mail className="text-primary-green m-2" />
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                value={form.email || ''}
                onChange={handleChange}
                onBlur={() => checkEmail(form.email)}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
              {emailExists && (
                <p className="text-red-500 text-sm mt-1">This email is already registered</p>
              )}
            </div>
            <div className="flex items-center border rounded-lg">
              <Lock className="text-primary-green m-2" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-none focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-3"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div className="flex items-center border rounded-lg">
              <Lock className="text-primary-green m-2" />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={form.confirmPassword || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-none focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-3"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div className="flex items-center border rounded-lg">
              <FileText className="text-primary-green m-2" />
              <input
                id="qualification"
                type="text"
                placeholder="Qualification"
                value={form.qualification || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg">
              <Cpu className="text-primary-green m-2" />
              <select
                id="industry"
                value={form.industry || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              >
                <option value="">Select Industry</option>
                <option value="IT">IT</option>
                <option value="Non-IT">Non-IT</option>
              </select>
            </div>

            <div className="flex items-center border rounded-lg">
              <MapPin className="text-primary-green m-2" />
              <input
                id="emplocation"
                type="text"
                placeholder="Preferred Location"
                value={form.emplocation || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg">
              <DollarSign className="text-primary-green m-2" />
              <input
                id="empsalary"
                type="text"
                placeholder="Preferred Salary Range"
                value={form.empsalary || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg">
              <Code className="text-primary-green m-2" />
              <input
                id="skills"
                type="text"
                placeholder="Skill Set (comma separated)"
                value={form.skills || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Company Fields */}
        {role === 'company' && (
          <>
            <div className="flex items-center border rounded-lg">
              <Building className="text-primary-green m-2" />
              <input
                id="companyName"
                type="text"
                placeholder="Company Name"
                value={form.companyName || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg">
              <Cpu className="text-primary-green m-2" />
              <select
                id="industry"
                value={form.industry || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              >
                <option value="">Select Industry</option>
                <option value="IT">IT</option>
                <option value="Non-IT">Non-IT</option>
              </select>
            </div>

            <div className="flex items-center border rounded-lg">
              <MapPin className="text-primary-green m-2" />
              <input
                id="location"
                type="text"
                placeholder="Company Location"
                value={form.location || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg">
              <User className="text-primary-green m-2" />
              <input
                id="contactPersonName"
                type="text"
                placeholder="Contact Person Name"
                onKeyDown={allowOnlyLetters}
                value={form.contactPersonName || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg">
              <Phone className="text-primary-green m-2" />
              <input
                id="mobile"
                type="text" // Changed to text to allow input masking
                placeholder="+91XXXXXXXXXX"
                value={form.mobile}
                onKeyDown={allowOnlyNumbers}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
              {form.mobile.length !== 13 && (
                <p className="text-red-500 text-sm mt-1">Mobile number must be 10 digits long</p>
              )}
            </div>

            <div className="flex items-center border rounded-lg">
              <Mail className="text-primary-green m-2" />
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                value={form.email || ''}
                onChange={handleChange}
                onBlur={() => checkEmail(form.email)}
                required
                className="w-full p-3 rounded-r-lg focus:outline-none"
              />
              {emailExists && (
                <p className="text-red-500 text-sm mt-1">This email is already registered</p>
              )}
            </div>

            <div className="flex items-center border rounded-lg">
              <Lock className="text-primary-green m-2" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-none focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-3"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
             </div>

            <div className="flex items-center border rounded-lg">
              <Lock className="text-primary-green m-2" />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={form.confirmPassword || ''}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-none focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-3"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </>
        )}

        {/* Submit Button */}
        {role && (
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#1c266a] hover:bg-[#1da46f] text-white'}`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        )}

        <p className="mt-2 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-green font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}