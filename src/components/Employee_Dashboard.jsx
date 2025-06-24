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

function InterviewCountdown({ interviewTime }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false
  });

  useEffect(() => {
    if (!interviewTime) return;
    
    const calculateTimeLeft = () => {
      const difference = new Date(interviewTime) - new Date();
      
      if (difference <= 0) {
        return { isFinished: true };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isFinished: false
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewTime]);

  if (!interviewTime) {
    return <span className="text-amber-600">Not scheduled yet</span>;
  }

  if (timeLeft.isFinished) {
    return <span className="text-gray-500">Interview completed</span>;
  }

  return (
    <div className="flex items-center">
      {timeLeft.days > 0 && (
        <span className="bg-blue-500 text-white px-2 py-1 rounded mr-1">
          {timeLeft.days}d
        </span>
      )}
      <span className="bg-green-500 text-white px-2 py-1 rounded">
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
}

export default function EmployeeDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [quickConnectJobs, setQuickConnectJobs] = useState([]);
  const [activeView, setActiveView] = useState('profile');
  const [activeTab, setActiveTab] = useState('available');
  const [applications, setApplications] = useState([]);

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
      
      // Fetch job requests
      const jobRes = await fetch('http://localhost:4000/api/job-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!jobRes.ok) throw new Error('Failed to fetch job requests');
      const jobData = await jobRes.json();
      setJobRequests(jobData);
      
      // Fetch applications with details
      const appRes = await fetch('http://localhost:4000/api/applications/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData);
        
        // Extract job IDs from applications
        const appliedJobIds = appData.map(app => app.request_id);
        setQuickConnectJobs(appliedJobIds);
      }
      
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

  const filteredJobs = jobRequests.filter(
    job => 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.domain.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase())
  );

  const requestedJobs = applications.filter(app => app.status === 'pending');
  const scheduledJobs = applications.filter(app => app.status === 'scheduled');
  const placedJobs = applications.filter(app => app.status === 'accepted');

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

  const handleQuickConnect = async (jobId) => {
    if (quickConnectJobs.includes(jobId)) return;
    
    try {
      const token = getToken();
      const response = await fetch('http://localhost:4000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ job_request_id: jobId })
      });

      if (!response.ok) throw new Error('Connection failed');
      
      const newApp = await response.json();
      
      // Update state
      setQuickConnectJobs([...quickConnectJobs, jobId]);
      setApplications([...applications, newApp]);
      
      // Show success message
      const job = jobRequests.find(j => j.id === jobId);
      alert(`Job request sent successfully for "${job.title}"!`);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect. Please try again.');
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

  const renderJobCard = (job) => {
    const isApplied = quickConnectJobs.includes(job.id);
    const application = applications.find(app => app.request_id === job.id);
    
    return (
      <div
        key={job.id}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
              <p className="text-gray-600 text-sm">{job.domain}</p>
            </div>
            <Bookmark className="text-gray-300 hover:text-primary-green" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center text-sm">
              <MapPin className="text-gray-500 mr-2" size={16} />
              <span>{job.location || 'Remote'}</span>
            </div>
            <div className="flex items-center text-sm">
              <IndianRupee className="text-gray-500 mr-2" size={16} />
              <span>{job.salary_range || 'Competitive salary'}</span>
            </div>
            <div className="flex items-center text-sm">
              <Briefcase className="text-gray-500 mr-2" size={16} />
              <span>{job.employment_type || 'Full-time'}</span>
            </div>
          </div>

          <p className="mt-4 text-gray-600 text-sm line-clamp-2">
            {job.description}
          </p>

          <div className="mt-6 flex justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="mr-1" size={14} />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>
            
            {isApplied ? (
              <button 
                className={`${
                  application?.status === 'scheduled' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : application?.status === 'accepted'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-amber-500 hover:bg-amber-600'
                } text-white px-4 py-2 rounded-full flex items-center`}
                onClick={() => setSelectedJob(job)}
              >
                {application?.status === 'scheduled' ? (
                  <ClockIcon size={16} className="mr-1" />
                ) : application?.status === 'accepted' ? (
                  <Check size={16} className="mr-1" />
                ) : (
                  <HelpCircle size={16} className="mr-1" />
                )}
                {application?.status === 'scheduled' 
                  ? 'Interview' 
                  : application?.status === 'accepted'
                  ? 'Accepted'
                  : 'Pending'}
              </button>
            ) : (
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full flex items-center"
                onClick={() => handleQuickConnect(job.id)}
              >
                <Send size={16} className="mr-1" />
                Quick Connect
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'available':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs
              .filter(job => !quickConnectJobs.includes(job.id))
              .map(job => renderJobCard(job))
            }
            
            {filteredJobs.filter(job => !quickConnectJobs.includes(job.id)).length === 0 && (
              <div className="col-span-2 bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <CheckCircle className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No available jobs</h3>
                <p className="text-gray-500">
                  You've applied to all available positions
                </p>
              </div>
            )}
          </div>
        );
      
      case 'requested':
        return (
          <div className="space-y-4">
            {requestedJobs.length > 0 ? (
              requestedJobs.map(app => {
                const job = jobRequests.find(j => j.id === app.request_id);
                if (!job) return null;
                
                return (
                  <div 
                    key={app.connection_id} 
                    className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                        <p className="text-primary-green">{job.domain}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        Request Sent
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Building className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Company</p>
                          <p>{app.company_name}</p>
                        </div>
                      </div>
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
                          <p className="text-sm text-gray-500">Applied</p>
                          <p>{new Date(app.connection_date).toLocaleDateString()}</p>
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
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <Send className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No job requests</h3>
                <p className="text-gray-500">
                  You haven't applied to any jobs yet
                </p>
                <button 
                  className="mt-4 bg-primary-green text-white px-4 py-2 rounded-lg"
                  onClick={() => setActiveTab('available')}
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        );
      
      case 'scheduled':
        return (
          <div className="space-y-4">
            {scheduledJobs.length > 0 ? (
              scheduledJobs.map(app => {
                const job = jobRequests.find(j => j.id === app.request_id);
                if (!job) return null;
                
                return (
                  <div 
                    key={app.connection_id} 
                    className="bg-white rounded-xl shadow-sm p-5 border border-blue-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                        <p className="text-primary-green">{job.domain}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Interview Scheduled
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Building className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Company</p>
                          <p>{app.company_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Interview Time</p>
                          <div className="font-medium">
                            <InterviewCountdown interviewTime={app.interview_time} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p>{job.interview_location || job.location || 'Remote'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <UserCheck className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Contact Person</p>
                          <p>{job.contact_person || 'HR Department'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {job.contact_email && (
                          <div className="flex items-center">
                            <Mail className="mr-2" size={16} />
                            <span>{job.contact_email}</span>
                          </div>
                        )}
                      </div>
                      <button 
                        className="text-primary-green font-medium hover:underline"
                        onClick={() => setSelectedJob(job)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <ClockIcon className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No interviews scheduled</h3>
                <p className="text-gray-500">
                  Your scheduled interviews will appear here
                </p>
                <button 
                  className="mt-4 bg-primary-green text-white px-4 py-2 rounded-lg"
                  onClick={() => setActiveTab('requested')}
                >
                  View Applications
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
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
          <p className="opacity-90">Find your next career opportunity from these openings</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search job title, location, or domain..."
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'available' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('available')}
          >
            <div className="flex items-center">
              <List className="mr-2" size={18} />
              Available Jobs
            </div>
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'requested' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('requested')}
          >
            <div className="flex items-center">
              <Send className="mr-2" size={18} />
              Requested Jobs
              {requestedJobs.length > 0 && (
                <span className="ml-2 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {requestedJobs.length}
                </span>
              )}
            </div>
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'scheduled' ? 'text-primary-green border-b-2 border-primary-green' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('scheduled')}
          >
            <div className="flex items-center">
              <ClockIcon className="mr-2" size={18} />
              Interviews
              {scheduledJobs.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {scheduledJobs.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Job Requests Content */}
        {renderTabContent()}
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
                {quickConnectJobs.includes(selectedJob.id) && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                    Applied
                  </span>
                )}
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
                  <Building className="text-gray-500 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p>{selectedJob.employment_type}</p>
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
                    <p className="text-sm text-gray-500">Posted</p>
                    <p>{new Date(selectedJob.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-3">Job Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                {quickConnectJobs.includes(selectedJob.id) ? (
                  <button 
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Check size={18} className="mr-2" />
                    Applied
                  </button>
                ) : (
                  <button 
                    className="bg-primary-green hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                    onClick={() => handleQuickConnect(selectedJob.id)}
                  >
                    <Send size={18} className="mr-2" />
                    Quick Connect
                  </button>
                )}
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
              setActiveView('profile');
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
          ) : activeView === 'profile' ? (
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
          ) : (
            <div className="p-4">
              <h3 className="font-bold mb-4">Placed Jobs</h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {placedJobs.length > 0 ? (
                  placedJobs.map(app => {
                    const job = jobRequests.find(j => j.id === app.request_id);
                    if (!job) return null;
                    
                    return (
                      <div 
                        key={app.connection_id} 
                        className="bg-gray-50 p-4 rounded-lg border border-green-200 hover:bg-white transition-colors"
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">{job.title}</h4>
                            <p className="text-sm text-gray-600">{app.company_name}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Placed
                          </span>
                        </div>
                        
                        <div className="mt-3 flex items-center text-xs text-gray-500">
                          <IndianRupee className="mr-1" size={14} />
                          <span>{job.salary_range || 'Competitive salary'}</span>
                        </div>
                        
                        <div className="mt-2 flex justify-between text-xs">
                          <div className="flex items-center">
                            <Calendar className="mr-1" size={14} />
                            <span>
                              Joined on {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-primary-green font-medium">View Details</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto bg-gray-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <CheckCircle className="text-gray-400" size={20} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No placements yet</h3>
                    <p className="text-gray-500">
                      Your placements will appear here once you're hired
                    </p>
                  </div>
                )}
              </div>
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
              <>
                <button 
                  onClick={() => {
                    setEditMode(true);
                    setActiveView('profile');
                  }}
                  className="w-full hover:bg-green-600 text-white px-3 py-2 rounded-lg bg-teal-700"
                >
                  Edit Profile
                </button>
                
                <button 
                  onClick={() => setActiveView(activeView === 'placed' ? 'profile' : 'placed')}
                  className={`w-full px-3 py-2 rounded-lg ${
                    activeView === 'placed' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {activeView === 'placed' ? 'Back to Profile' : 'Placed Jobs'}
                </button>
              </>
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