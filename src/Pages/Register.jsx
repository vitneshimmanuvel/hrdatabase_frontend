import React, { useState } from 'react';
import RoleSelect from '../components/RoleSelect';
import { API_BASE_URL } from '../config/api'; // Adjust the import path as needed
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
  X,
  Check,
  Shield,
  Clock,
  RefreshCw,
  CheckCircle,
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

// Terms and Conditions Component
const TermsAndConditionsModal = ({ isOpen, onClose, onAccept, role }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">General Terms</h3>
              <p className="mb-4">
                By registering with Settlo HR Solutions, you agree to be bound by these terms and conditions. 
                This agreement is effective from the date of registration and governs your use of our services.
                Settlo HR Solutions is located at 121, Akhil Plaza, Perundurai Road, Erode.
              </p>
            </div>

            {role === 'employee' && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Employee Terms & Conditions</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>You agree to provide accurate and complete information during registration and throughout the recruitment process.</li>
                    <li>You understand that Settlo HR Solutions acts as a facilitator in the recruitment process and does not guarantee employment.</li>
                    <li>You acknowledge that final employment decisions, salary negotiations, and job offers rest entirely with the prospective employer.</li>
                    <li>You agree to maintain professional conduct throughout the recruitment process and during employment.</li>
                    <li>You understand that any misrepresentation of information, false credentials, or fraudulent activities may lead to immediate disqualification.</li>
                    <li>You agree to inform Settlo HR Solutions immediately of any changes in your employment status, availability, or contact information.</li>
                    <li>You acknowledge that all communications with potential employers will be copied to Settlo HR Solutions for transparency and record-keeping.</li>
                    <li>You understand that you are responsible for discussing work environment, job responsibilities, and company culture with the employer during interviews and pre-joining meetings.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Employment Commitment Requirements</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Mandatory Employment Period:</strong> Once you accept an offer letter from any client company through Settlo HR Solutions, you agree to work with that company for a minimum period of 2 (two) years from the date of joining.</li>
                    <li><strong>Non-Circumvention Clause:</strong> You must not directly approach or join any client company introduced by Settlo HR Solutions without our involvement or approval.</li>
                    <li><strong>Resignation/Termination:</strong> Any resignation or termination before completing the mandatory 2-year period must have valid written consent from both Settlo HR Solutions and the client company.</li>
                    <li><strong>Penalty Clause:</strong> In case of violation of the above terms (direct approach to client companies or leaving before 2 years without consent), a penalty of ₹10,000 (Rupees Ten Thousand only) shall be payable to Settlo HR Solutions within 15 days of notice.</li>
                    <li><strong>Company Selection Obligation:</strong> If Settlo HR introduces you to any client/company and you are selected and receive an offer letter, you are obligated to join and work with the said company through Settlo HR's process.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Terms for Employees</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>No Registration Fees:</strong> Settlo HR Solutions does not charge any registration or placement fees from job seekers/employees.</li>
                    <li><strong>Free Service:</strong> Our recruitment services for employees are completely free of cost.</li>
                    <li><strong>Salary Negotiations:</strong> Your salary will be directly negotiated with and paid by your employer. Settlo HR Solutions is not involved in salary payments.</li>
                    <li><strong>No Hidden Charges:</strong> There are no hidden fees, administrative charges, or processing fees for employees at any stage of the recruitment process.</li>
                    <li><strong>Fraudulent Requests:</strong> If anyone claiming to represent Settlo HR Solutions asks for money from you, please report it immediately as it is fraudulent.</li>
                    <li><strong>Third-Party Payments:</strong> You should never make any payments to third parties claiming association with job placements through our platform.</li>
                  </ul>
                </div>
              </>
            )}

            {role === 'company' && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Company Terms & Conditions</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>You agree to provide accurate company information, job requirements, and compensation details.</li>
                    <li>You understand that Settlo HR Solutions will identify and collect details of candidates matching your specified profile.</li>
                    <li>Settlo HR Solutions will shortlist candidates based on agreed criteria and schedule interviews between candidates and your company.</li>
                    <li>You acknowledge and accept the 3-month warranty policy for all recruited candidates as detailed below.</li>
                    <li>You understand that if a recruited candidate leaves, resigns, quits, absents, or does not show up within 3 months of joining, Settlo HR Solutions will provide a suitable replacement at no additional service cost.</li>
                    <li>You agree that Settlo HR Solutions shall not be held liable for any malpractices initiated by the candidate during their tenure of service. Any such issues are the sole responsibility of the involved parties.</li>
                    <li>It is your responsibility to discuss any concerns regarding the work environment with candidates during the interview/pre-joining meeting.</li>
                    <li>You understand that Settlo HR Solutions facilitates the recruitment process but is not accountable for any mismatch in the work environment.</li>
                    <li>You agree to maintain professional and ethical recruitment practices throughout the process.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Service Fees and Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Service Fee Structure:</strong> You agree to pay Settlo HR Solutions a service fee equivalent to 50% of the selected candidate's FIRST month's salary.</li>
                    <li><strong>Payment Timeline:</strong> Payment shall be made within 30 business days from the candidate's Date of Joining.</li>
                    <li><strong>Invoice Process:</strong> Settlo HR Solutions will provide an invoice detailing the agreed-upon service fee.</li>
                    <li><strong>GST Charges:</strong> All service fees are subject to applicable GST as per Indian tax regulations.</li>
                    <li><strong>Payment Methods:</strong> Payments should be made through bank transfer, cheque, or other authorized payment methods only.</li>
                    <li><strong>Late Payment:</strong> Late payment charges may apply on overdue amounts beyond the specified payment period.</li>
                    <li><strong>Fee Calculation:</strong> The service fee is calculated based on the gross salary (including all fixed components) offered to the candidate for their first month.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">3-Month Warranty Policy</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Warranty Coverage:</strong> In the event a candidate resigns, quits, absents, does not show up, or leaves employment for any reason before completing 3 (three) months, Settlo HR Solutions guarantees to provide an alternative candidate.</li>
                    <li><strong>Replacement Quality:</strong> The replacement candidate will have the same or better qualifications profile as the original candidate.</li>
                    <li><strong>No Additional Cost:</strong> Replacement candidates will be provided at no additional service cost to you.</li>
                    <li><strong>Extended Warranty:</strong> The 3-month warranty shall apply for replacement candidates as well, ensuring continuous coverage.</li>
                    <li><strong>Notification Requirement:</strong> You must notify Settlo HR Solutions promptly when a candidate leaves within the warranty period to avail of replacement services.</li>
                    <li><strong>No Refund Policy:</strong> As per the warranty terms, replacement candidates are provided instead of refunds for the original service fee paid.</li>
                  </ul>
                </div>
              </>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Privacy and Data Protection</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Your personal and company information will be used solely for recruitment and business purposes.</li>
                <li>We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure.</li>
                <li>Your information may be shared with relevant parties (employers/candidates) during the recruitment process with your consent.</li>
                <li>We comply with applicable data protection laws and regulations in India.</li>
                <li>You have the right to request updates, corrections, or deletion of your personal information subject to legal requirements.</li>
                <li>We retain your data for a period necessary to provide our services and comply with legal obligations.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Contact Information</h3>
              <p className="bg-gray-50 p-4 rounded-lg">
                For any queries, concerns, support, or clarifications regarding these terms:<br />
                <strong>Settlo HR Solutions</strong><br />
                📍 Address: 121, Akhil Plaza, Perundurai Road, Erode, Tamil Nadu<br />
                📧 Email: info@settlohrsolutions.com<br />
                📞 Phone: [Your Contact Number]<br />
                🕒 Business Hours: Monday to Friday, 9:00 AM to 6:00 PM IST
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm font-semibold text-red-800">
                <strong>Important Legal Notice:</strong> By accepting these terms, you acknowledge that you have read, understood, and agree to be legally bound by all the above conditions. 
                This constitutes a legally binding agreement between you and Settlo HR Solutions. 
                {role === 'employee' && ' Please pay special attention to the 2-year employment commitment and penalty clauses.'}
                {role === 'company' && ' Please note the specific service fee structure and 3-month warranty terms.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-[#1c266a] text-white rounded-lg hover:bg-[#1da46f] transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            I Agree to Terms & Conditions
          </button>
        </div>
      </div>
    </div>
  );
};

// OTP Verification Component
const OTPVerificationModal = ({ isOpen, onClose, onVerify, email, onResend, loading, resendLoading, resendCountdown }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]$/.test(value) && value !== '') return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      alert('Please enter complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      await onVerify(otpString);
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to<br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Please check your inbox or spam folder
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter verification code
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
            className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2
              ${isVerifying || otp.join('').length !== 6
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-[#1c266a] hover:bg-[#1da46f] text-white'}`}
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Verify & Complete Registration
              </>
            )}
          </button>

          <div className="text-center">
            <span className="text-gray-600 text-sm">Didn't receive the code? </span>
            {resendCountdown > 0 ? (
              <span className="text-gray-500 text-sm">
                <Clock className="w-4 h-4 inline mr-1" />
                Resend in {resendCountdown}s
              </span>
            ) : (
              <button
                onClick={onResend}
                disabled={resendLoading}
                className="text-[#1c266a] hover:text-[#1da46f] font-semibold text-sm hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Cancel Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Register() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    mobile: '+91', 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
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
      const res = await fetch(`${API_BASE_URL}/auth/check-email?email=${email}`);
      const data = await res.json();
      setEmailExists(data.exists);
    } catch (err) {
      console.error('Email check failed:', err);
    }
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTerms(false);
  };

  const startResendCountdown = () => {
    setResendCountdown(30);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert('Please accept the terms and conditions to proceed with registration.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate mobile number length
    if (form.mobile.length !== 13) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check email exists first
      await checkEmail(form.email);
      if (emailExists) {
        alert('This email is already registered. Please use a different email address.');
        setLoading(false);
        return;
      }

      // Send OTP for email verification
      const otpPayload = {
        email: form.email,
        role: role,
        userData: form
      };

      const res = await fetch(`${API_BASE_URL}/auth/send-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(otpPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      // Show success message and OTP modal
      alert(data.message);
      setShowOTPModal(true);
      startResendCountdown();

    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setOtpLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          otp: otp
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'OTP verification failed');
        return;
      }

      // Success
      alert(data.message);
      setShowOTPModal(false);
      navigate('/login');

    } catch (err) {
      console.error(err);
      alert('OTP verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to resend OTP');
        return;
      }

      alert(data.message);
      startResendCountdown();

    } catch (err) {
      console.error(err);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#E6F5FF] to-[#1c266a] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-[#1c266a] text-center mb-4">
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
              <User className="text-[#1da46f] m-2" />
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

            <div>
              <div className="flex items-center border rounded-lg">
                <Phone className="text-[#1da46f] m-2" />
                <input
                  id="mobile"
                  type="text"
                  placeholder="+91XXXXXXXXXX"
                  value={form.mobile}
                  onChange={handleChange}
                  onKeyDown={allowOnlyNumbers}
                  required
                  className="w-full p-3 rounded-r-lg focus:outline-none"
                />
              </div>
              {form.mobile.length > 4 && form.mobile.length !== 13 && (
                <p className="text-red-500 text-sm mt-1">Mobile number must be exactly 10 digits after +91</p>
              )}
            </div>

            <div>
              <div className="flex items-center border rounded-lg">
                <Mail className="text-[#1da46f] m-2" />
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email || ''}
                  onChange={handleChange}
                  onBlur={() => form.email && checkEmail(form.email)}
                  required
                  className="w-full p-3 rounded-r-lg focus:outline-none"
                />
              </div>
              {emailExists && (
                <p className="text-red-500 text-sm mt-1">This email is already registered</p>
              )}
            </div>

            <div className="flex items-center border rounded-lg">
              <Lock className="text-[#1da46f] m-2" />
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
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>

            <div className="flex items-center border rounded-lg">
              <Lock className="text-[#1da46f] m-2" />
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
                {showConfirm ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>

            <div className="flex items-center border rounded-lg">
              <FileText className="text-[#1da46f] m-2" />
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
              <Cpu className="text-[#1da46f] m-2" />
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
              <MapPin className="text-[#1da46f] m-2" />
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
              <DollarSign className="text-[#1da46f] m-2" />
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
              <Code className="text-[#1da46f] m-2" />
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
              <Building className="text-[#1da46f] m-2" />
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
              <Cpu className="text-[#1da46f] m-2" />
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
              <MapPin className="text-[#1da46f] m-2" />
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
              <User className="text-[#1da46f] m-2" />
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

            <div>
              <div className="flex items-center border rounded-lg">
                <Phone className="text-[#1da46f] m-2" />
                <input
                  id="mobile"
                  type="text"
                  placeholder="+91XXXXXXXXXX"
                  value={form.mobile}
                  onKeyDown={allowOnlyNumbers}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-r-lg focus:outline-none"
                />
              </div>
              {form.mobile.length > 4 && form.mobile.length !== 13 && (
                <p className="text-red-500 text-sm mt-1">Mobile number must be exactly 10 digits after +91</p>
              )}
            </div>

            <div>
              <div className="flex items-center border rounded-lg">
                <Mail className="text-[#1da46f] m-2" />
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email || ''}
                  onChange={handleChange}
                  onBlur={() => form.email && checkEmail(form.email)}
                  required
                  className="w-full p-3 rounded-r-lg focus:outline-none"
                />
              </div>
              {emailExists && (
                <p className="text-red-500 text-sm mt-1">This email is already registered</p>
              )}
            </div>

            <div className="flex items-center border rounded-lg">
              <Lock className="text-[#1da46f] m-2" />
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
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>

            <div className="flex items-center border rounded-lg">
              <Lock className="text-[#1da46f] m-2" />
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
                {showConfirm ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          </>
        )}

        {/* Terms and Conditions Checkbox */}
        {role && (
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-[#1c266a] focus:ring-[#1c266a] border-gray-300 rounded"
              required
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-700 cursor-pointer">
              I have read and agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[#1c266a] hover:text-[#1da46f] font-semibold underline"
              >
                Terms and Conditions
              </button>
              {role === 'company' && (
                <span className="text-gray-600"> including service fees (50% of first month's salary) and 3-month warranty policy</span>
              )}
              {role === 'employee' && (
                <span className="text-gray-600"> including the 2-year employment commitment and penalty clauses</span>
              )}
            </label>
          </div>
        )}

        {/* Submit Button */}
        {role && (
          <button
            type="submit"
            disabled={loading || !termsAccepted || emailExists || (form.mobile.length > 4 && form.mobile.length !== 13)}
            className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2
              ${loading || !termsAccepted || emailExists || (form.mobile.length > 4 && form.mobile.length !== 13)
                ? 'bg-gray-400 cursor-not-allowed text-gray-500'
                : 'bg-[#1c266a] hover:bg-[#1da46f] text-white'}`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending Verification Email...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Verification Email
              </>
            )}
          </button>
        )}

        <p className="mt-2 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1da46f] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleTermsAccept}
        role={role}
      />

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        email={form.email}
        onResend={handleResendOTP}
        loading={otpLoading}
        resendLoading={resendLoading}
        resendCountdown={resendCountdown}
      />
    </div>
  );
}
