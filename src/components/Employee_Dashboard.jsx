import React, { useState, useEffect } from 'react'; 
import { 
  User, FileText, MapPin, Briefcase, 
  ChevronLeft, Search, X, Calendar, Building, 
  Clock, Bookmark, Send, Check, Phone, GraduationCap,
  List, CheckCircle, Clock as ClockIcon, Mail, UserCheck, HelpCircle,
  LogOut, IndianRupee 
} from 'lucide-react'; 
import { getToken } from '../utils/auth'; 

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

export default function EmployeeDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminConnectedJobs, setAdminConnectedJobs] = useState([]);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    qualification: '',
    industry: '',
    preferred_location: '',
    preferred_salary: ''
  });

  const fetchData = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Fetch user data
      const res = await fetch('http://localhost:4000/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch profile');
      const userData = await res.json();
      setEmployeeData(userData);
      
      // Initialize form data
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        qualification: userData.qualification || '',
        industry: userData.industry || '',
        preferred_location: userData.preferred_location || '',
        preferred_salary: userData.preferred_salary || ''
      });
      
      // Fetch admin connected jobs
      const adminJobsRes = await fetch('http://localhost:4000/api/employee/admin-connected-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!adminJobsRes.ok) throw new Error('Failed to fetch admin-connected jobs');
      const adminJobsData = await adminJobsRes.json();
      setAdminConnectedJobs(adminJobsData);
      
    } catch (error) {
      console.error('Error:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('+91') && value.length <= 13) {
      setFormData({ ...formData, phone: value });
    } else if (value === '+9') {
      setFormData({ ...formData, phone: value });
    } else if (value.length < 4) {
      setFormData({ ...formData, phone: '+91' });
    }
  };

  const handleUpdateProfile = async () => {
    if (formData.phone.length !== 13) {
      alert('Phone number must be 10 digits long');
      return;
    }
    
    try {
      setUpdating(true);
      const token = getToken();
      const response = await fetch('http://localhost:4000/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Update failed');

      const updatedData = await response.json();
      setEmployeeData({...employeeData, ...updatedData});
      setEditMode(false);
      
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="text-gray-400 text-6xl mb-4 mx-auto" />
          <p className="text-gray-600">User data not available</p>
          <button 
            className="mt-4 bg-primary-green text-white px-4 py-2 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-green">Settlo HR Solutions</h1>
          <button
            className="flex items-center space-x-2 text-primary-green"
            onClick={() => setShowSidebar(true)}
          >
            <User size={24} />
            <span>{employeeData.full_name || 'Employee'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-xl shadow-md p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome, {employeeData.full_name || 'Employee'}!
          </h2>
          <p className="opacity-90">Your admin-connected job opportunities</p>
        </div>

        {/* Admin Connections Section */}
        <div className="space-y-4">
          {adminConnectedJobs.length > 0 ? (
            adminConnectedJobs.map(job => (
              <div 
                key={job.id} 
                className="bg-white rounded-xl shadow-sm p-5 border border-blue-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                    <p className="text-primary-green">{job.domain}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Job
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="flex items-center">
                    <MapPin className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p>{job.location || 'Remote'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Salary</p>
                      <p>{job.salary_range}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Connected On</p>
                      <p>{new Date(job.connection_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button 
                    className="text-primary-green font-medium hover:underline"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <UserCheck className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No admin connections</h3>
              <p className="text-gray-500">
                You don't have any job connections made by admin yet.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                  <p className="text-primary-green">{selectedJob.domain}</p>
                </div>
                <button onClick={() => setSelectedJob(null)}>
                  <X className="text-gray-500" size={24} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {selectedJob.employment_type}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {selectedJob.salary_range}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Admin Connected
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <MapPin className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{selectedJob.location || 'Remote'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <IndianRupee className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Salary Range</p>
                    <p>{selectedJob.salary_range}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Connected On</p>
                    <p>
                      {new Date(selectedJob.connection_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-3">Job Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-lg z-50">
          <div className="flex items-center p-4 border-b">
            <User className="text-primary-green mr-3" size={24} />
            <div>
              <h3 className="font-bold">{employeeData.full_name || 'Employee'}</h3>
              <p className="text-sm text-gray-500">Employee Profile</p>
            </div>
          </div>
          <button
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
            onClick={() => {
              setShowSidebar(false);
              setEditMode(false);
            }}
          >
            <ChevronLeft size={24} />
          </button>

          {editMode ? (
            <div className="p-4">
              <h4 className="font-bold mb-4">Edit Profile</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-green focus:outline-none"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    onKeyDown={allowOnlyLetters}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-green focus:outline-none"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onKeyDown={allowOnlyNumbers}
                    required
                  />
                  {formData.phone.length !== 13 && (
                    <p className="text-red-500 text-sm mt-1">Phone number must be 10 digits long</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-green focus:outline-none"
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-green focus:outline-none"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-green focus:outline-none"
                    value={formData.preferred_location}
                    onChange={(e) => setFormData({...formData, preferred_location: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Salary</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-green focus:outline-none"
                    value={formData.preferred_salary}
                    onChange={(e) => setFormData({...formData, preferred_salary: e.target.value})}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3 py-2">
                <Phone className="text-blue-500 flex-shrink-0" size={18} />
                <span>Phone: {employeeData.phone || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <GraduationCap className="text-blue-500 flex-shrink-0" size={18} />
                <span>Qualification: {employeeData.qualification || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <Briefcase className="text-blue-500 flex-shrink-0" size={18} />
                <span>Industry: {employeeData.industry || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <MapPin className="text-blue-500 flex-shrink-0" size={18} />
                <span>Preferred Location: {employeeData.preferred_location || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <IndianRupee className="text-blue-500 flex-shrink-0" size={18} />
                <span>Preferred Salary: {employeeData.preferred_salary || 'Not specified'}</span>
              </div>
              {employeeData.resume_link && (
                <div className="flex items-center space-x-3 py-2">
                  <FileText className="text-blue-500 flex-shrink-0" size={18} />
                  <a href={employeeData.resume_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Resume
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="p-4 mt-auto border-t space-y-2">
            {editMode ? (
              <>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className={`w-full flex items-center justify-center hover:bg-green-700 text-white px-3 py-2 rounded-lg mb-2 ${
                    updating ? 'bg-teal-800' : 'bg-teal-700'
                  }`}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
                <button 
                  onClick={() => setEditMode(false)}
                  className="w-full bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setEditMode(true)}
                className="w-full hover:bg-green-600 text-white px-3 py-2 rounded-lg bg-teal-700"
              >
                Edit Profile
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}