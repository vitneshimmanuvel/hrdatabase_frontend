import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { API_BASE_URL } from '../config/api'; 
import * as Yup from 'yup';
import { 
  Building, Search, Briefcase, Plus, X, User, 
  MapPin, Users, Mail, Phone, Globe, Edit,
  CheckCircle, Clock, XCircle, AlertCircle
} from 'lucide-react';
import { getToken, logout } from '../utils/auth';

// Validation schemas
const jobRequestSchema = Yup.object().shape({
  title: Yup.string().required('Job title is required'),
  domain: Yup.string().required('Domain is required'),
  description: Yup.string().required('Description is required'),
  employment_type: Yup.string().required('Employment type is required'),
  location: Yup.string().required('Location is required'),
  salary_range: Yup.string(),
  count: Yup.number()
    .required('Number of positions is required')
    .min(1, 'Must be at least 1')
});

const companyProfileSchema = Yup.object().shape({
  name: Yup.string().required('Company name is required'),
  contact_person_phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
    .required('Contact phone is required'),
  industry: Yup.string().required('Industry is required'),
  location: Yup.string().required('Location is required'),
  contact_person_name: Yup.string().required('Contact person is required'),
  company_size: Yup.string().required('Company size is required'),
  website_url: Yup.string().url('Invalid URL'),
  about_us: Yup.string()
});

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [search, setSearch] = useState('');
  const [companyData, setCompanyData] = useState(null);
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [apiMessage, setApiMessage] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showStatusEditModal, setShowStatusEditModal] = useState(false);

  // Formik for job requests (creation only)
  const jobFormik = useFormik({
    initialValues: {
      title: '',
      domain: '',
      description: '',
      employment_type: '',
      location: '',
      salary_range: '',
      count: ''
    },
    validationSchema: jobRequestSchema,
    onSubmit: async (values) => {
      try {
        const token = getToken();
        if (!token) return logout(navigate);

        const response = await fetch(`${API_BASE_URL}/jobs/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...values,
            count: parseInt(values.count, 10),
          })
        });

        if (response.status === 401) return logout(navigate);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Creation failed');
        }
        
        const jobData = await response.json();
        setJobRequests([jobData, ...jobRequests]);
        setApiMessage({ type: 'success', message: 'Job created successfully!' });
        handleCloseForms();
      } catch (error) {
        console.error('Job creation error:', error);
        setApiMessage({ type: 'error', message: error.message || 'Creation failed' });
      }
    }
  });

  // Formik for company profile (email non-editable, phone without +91)
  const profileFormik = useFormik({
    initialValues: {
      name: '',
      contact_person_phone: '',
      industry: '',
      location: '',
      contact_person_name: '',
      company_size: '',
      website_url: '',
      about_us: ''
    },
    validationSchema: companyProfileSchema,
    onSubmit: async (values) => {
      try {
        if (!companyData?.company_id || isNaN(Number(companyData.company_id))) {
          setApiMessage({ type: 'error', message: 'No valid company ID found. Please reload and try again.' });
          return;
        }

        const token = getToken();
        if (!token) return logout(navigate);

        const companyIdNum = Number(companyData.company_id);
        const response = await fetch(`${API_BASE_URL}/api/companies/${companyIdNum}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });

        if (response.status === 401) return logout(navigate);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Profile update failed');
        }
        
        const updatedData = await response.json();
        setCompanyData(updatedData);
        setApiMessage({ type: 'success', message: 'Profile updated successfully!' });
        setIsEditingProfile(false);
      } catch (error) {
        console.error('Profile update error:', error);
        setApiMessage({ type: 'error', message: error.message || 'Update failed' });
      }
    }
  });

  // Status edit formik (status only)
  const statusFormik = useFormik({
    initialValues: {
      status: 'open'
    },
    onSubmit: async (values) => {
      try {
        const token = getToken();
        if (!token) return logout(navigate);

        const response = await fetch(`${API_BASE_URL}/jobs/requests/${selectedJob.request_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...selectedJob,
            status: values.status,
            count: parseInt(selectedJob.count, 10)
          })
        });

        if (response.status === 401) return logout(navigate);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Status update failed');
        }
        
        const updatedJob = await response.json();
        setJobRequests(jobRequests.map(job => 
          job.request_id === updatedJob.request_id ? updatedJob : job
        ));
        
        setApiMessage({ type: 'success', message: 'Job status updated successfully!' });
        setShowStatusEditModal(false);
        setSelectedJob(null);
      } catch (error) {
        console.error('Status update error:', error);
        setApiMessage({ type: 'error', message: error.message || 'Status update failed' });
      }
    }
  });

  const fetchCompanyData = async () => {
    try {
      const token = getToken();
      if (!token) return logout(navigate);

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) return logout(navigate);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setCompanyData(data);
      
      profileFormik.setValues({
        name: data.companyname || data.name || '',
        contact_person_phone: data.contact_person_phone || '',
        industry: data.industry || '',
        location: data.location || '',
        contact_person_name: data.contact_person_name || '',
        company_size: data.company_size || '',
        website_url: data.website_url || '',
        about_us: data.about_us || ''
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
      setApiMessage({ type: 'error', message: 'Failed to fetch company data' });
    }
  };

  const fetchJobRequests = async () => {
    try {
      const token = getToken();
      if (!token) return logout(navigate);

      const response = await fetch(`${API_BASE_URL}/jobs/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) return logout(navigate);
      if (!response.ok) throw new Error('Failed to fetch job requests');
      
      const data = await response.json();
      setJobRequests(data);
    } catch (error) {
      console.error('Error fetching job requests:', error);
      setApiMessage({ type: 'error', message: 'Failed to fetch job requests' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
    fetchJobRequests();
  }, []);

  // Clear API message after 5 seconds
  useEffect(() => {
    if (apiMessage) {
      const timer = setTimeout(() => setApiMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [apiMessage]);

  const handleCloseForms = () => {
    setShowJobForm(false);
    setShowJobDetails(false);
    setShowStatusEditModal(false);
    setSelectedJob(null);
    jobFormik.resetForm();
    statusFormik.resetForm();
  };

  const handleEditStatus = (job) => {
    setSelectedJob(job);
    statusFormik.setValues({
      status: job.status || 'open'
    });
    setShowStatusEditModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'closed':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const filteredRequests = jobRequests.filter(r =>
    (r.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (r.domain?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Building className="animate-spin text-blue-600 text-6xl mb-4 mx-auto" />
        <p className="text-slate-600 text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-3">
            <Building size={32} className="text-blue-600" />
            <span>{companyData?.companyname || companyData?.name || 'Company Dashboard'}</span>
          </h1>
          <button 
            onClick={() => setShowSidebar(true)} 
            className="flex items-center space-x-3 text-slate-700 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all duration-200 border border-slate-200"
          >
            <User size={20} />
            <span className="font-medium">{companyData?.contact_person_name || 'Account'}</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search job roles or domains..."
              className="w-full p-4 pl-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            onClick={() => {
              setSelectedJob(null);
              jobFormik.resetForm();
              setShowJobForm(true);
            }}
          >
            <Plus size={20} />
            <span>Create Job Request</span>
          </button>
        </div>

        {apiMessage && (
          <div className={`p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm ${
            apiMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <span className="font-medium">{apiMessage.message}</span>
            <button onClick={() => setApiMessage(null)} className="ml-4 hover:opacity-70">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Your Job Requests</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {jobRequests.length} Total
            </span>
          </div>
          
          {filteredRequests.length > 0 ? (
            <div className="grid gap-6">
              {filteredRequests.map(req => (
                <div key={req.request_id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{req.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-lg font-medium border border-blue-200">
                          {req.domain}
                        </span>
                        <span className="bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-lg font-medium border border-purple-200">
                          {req.employment_type}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(req.status)}
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(req.status)}`}>
                            {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-medium">
                        Created: {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">{req.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-slate-500 mr-2" />
                      <span className="text-slate-700">{req.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="text-slate-500 mr-2" />
                      <span className="text-slate-700">{req.count} positions</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-500 mr-1">₹</span>
                      <span className="text-slate-700">{req.salary_range || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center space-x-2 transition-all duration-200 font-medium"
                      onClick={() => handleEditStatus(req)}
                    >
                      <Edit size={16} />
                      <span>Edit Status</span>
                    </button>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                      onClick={() => {
                        setSelectedJob(req);
                        setShowJobDetails(true);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-100">
              <Briefcase className="mx-auto text-slate-400 text-5xl mb-4" />
              <h3 className="text-xl font-bold mb-2 text-slate-800">
                {search ? 'No jobs found matching your search' : 'No job requests found'}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {search 
                  ? 'Try adjusting your search terms to find what you\'re looking for'
                  : 'Create your first job request to get started with hiring'}
              </p>
              {!search && (
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                  onClick={() => {
                    setSelectedJob(null);
                    jobFormik.resetForm();
                    setShowJobForm(true);
                  }}
                >
                  Create Job Request
                </button>
              )}
            </div>
          )}
        </div>

        {/* Job Request Form Modal (Create Only) */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Create New Job Request</h2>
                  <button onClick={handleCloseForms} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={jobFormik.handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 mb-2 font-medium">Job Title *</label>
                      <input
                        type="text"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        name="title"
                        value={jobFormik.values.title}
                        onChange={jobFormik.handleChange}
                        onBlur={jobFormik.handleBlur}
                      />
                      {jobFormik.touched.title && jobFormik.errors.title && (
                        <p className="text-red-500 text-sm mt-1">{jobFormik.errors.title}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-slate-700 mb-2 font-medium">Number of Positions *</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        name="count"
                        value={jobFormik.values.count}
                        onChange={jobFormik.handleChange}
                        onBlur={jobFormik.handleBlur}
                      />
                      {jobFormik.touched.count && jobFormik.errors.count && (
                        <p className="text-red-500 text-sm mt-1">{jobFormik.errors.count}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-slate-700 mb-2 font-medium">Domain *</label>
                      <input
                        type="text"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        name="domain"
                        value={jobFormik.values.domain}
                        onChange={jobFormik.handleChange}
                        onBlur={jobFormik.handleBlur}
                      />
                      {jobFormik.touched.domain && jobFormik.errors.domain && (
                        <p className="text-red-500 text-sm mt-1">{jobFormik.errors.domain}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-slate-700 mb-2 font-medium">Employment Type *</label>
                      <select
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        name="employment_type"
                        value={jobFormik.values.employment_type}
                        onChange={jobFormik.handleChange}
                        onBlur={jobFormik.handleBlur}
                      >
                        <option value="">Select Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                      {jobFormik.touched.employment_type && jobFormik.errors.employment_type && (
                        <p className="text-red-500 text-sm mt-1">{jobFormik.errors.employment_type}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-slate-700 mb-2 font-medium">Location *</label>
                      <input
                        type="text"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        name="location"
                        value={jobFormik.values.location}
                        onChange={jobFormik.handleChange}
                        onBlur={jobFormik.handleBlur}
                      />
                      {jobFormik.touched.location && jobFormik.errors.location && (
                        <p className="text-red-500 text-sm mt-1">{jobFormik.errors.location}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-slate-700 mb-2 font-medium">Salary Range</label>
                      <div className="flex items-center">
                        <span className="mr-3 font-medium text-slate-600">₹</span>
                        <input
                          type="text"
                          className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          name="salary_range"
                          value={jobFormik.values.salary_range}
                          onChange={jobFormik.handleChange}
                          onBlur={jobFormik.handleBlur}
                          placeholder="Example: 80,000 - 100,000"
                        />
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-slate-700 mb-2 font-medium">Job Description *</label>
                      <textarea
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        rows={4}
                        name="description"
                        value={jobFormik.values.description}
                        onChange={jobFormik.handleChange}
                        onBlur={jobFormik.handleBlur}
                      />
                      {jobFormik.touched.description && jobFormik.errors.description && (
                        <p className="text-red-500 text-sm mt-1">{jobFormik.errors.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      type="button"
                      className="bg-slate-200 text-slate-800 px-6 py-3 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                      onClick={handleCloseForms}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                      disabled={jobFormik.isSubmitting}
                    >
                      {jobFormik.isSubmitting ? 'Creating...' : 'Create Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Status Edit Modal */}
        {showStatusEditModal && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Edit Job Status</h2>
                  <button onClick={handleCloseForms} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={statusFormik.handleSubmit}>
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <p className="text-slate-700 font-medium mb-1">Job: {selectedJob.title}</p>
                    <p className="text-slate-600 text-sm">Domain: {selectedJob.domain}</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-slate-700 mb-2 font-medium">Status *</label>
                    <select
                      className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="status"
                      value={statusFormik.values.status}
                      onChange={statusFormik.handleChange}
                      onBlur={statusFormik.handleBlur}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="bg-slate-200 text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                      onClick={handleCloseForms}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                      disabled={statusFormik.isSubmitting}
                    >
                      {statusFormik.isSubmitting ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal (View Only) */}
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Job Details</h2>
                  <button onClick={() => setShowJobDetails(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{selectedJob.title}</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium border border-blue-200">
                        {selectedJob.domain}
                      </span>
                      <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium border border-purple-200">
                        {selectedJob.employment_type}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium border border-indigo-200">
                        {selectedJob.count} positions
                      </span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedJob.status)}
                        <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(selectedJob.status)}`}>
                          {selectedJob.status?.charAt(0).toUpperCase() + selectedJob.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-1">Location</h4>
                      <p className="text-slate-600">{selectedJob.location}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-1">Salary Range</h4>
                      <p className="text-slate-600">₹ {selectedJob.salary_range || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-1">Created Date</h4>
                      <p className="text-slate-600">{new Date(selectedJob.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Job Description</h4>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button 
                      className="bg-slate-200 text-slate-800 px-6 py-3 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                      onClick={() => setShowJobDetails(false)}
                    >
                      Close
                    </button>
                    <button 
                      className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-200 font-medium"
                      onClick={() => {
                        setShowJobDetails(false);
                        handleEditStatus(selectedJob);
                      }}
                    >
                      Edit Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        {showSidebar && companyData && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center bg-gradient-to-r from-blue-50 to-slate-50">
              <Building className="text-blue-600 mr-4" size={32} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl truncate text-slate-800">{companyData.companyname || companyData.name}</h3>
                <p className="text-sm text-slate-600 truncate">{companyData.contact_email}</p>
              </div>
              <button
                className="ml-auto text-slate-400 hover:text-slate-600 p-2 transition-colors"
                onClick={() => {
                  setShowSidebar(false);
                  setIsEditingProfile(false);
                }}
              >
                <X size={24} />
              </button>
            </div>

            {isEditingProfile ? (
              <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Edit Profile</h2>
                
                <form onSubmit={profileFormik.handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Company Name *</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="name"
                      value={profileFormik.values.name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                    />
                    {profileFormik.touched.name && profileFormik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Contact Person *</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="contact_person_name"
                      value={profileFormik.values.contact_person_name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                    />
                    {profileFormik.touched.contact_person_name && profileFormik.errors.contact_person_name && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.contact_person_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Contact Phone *</label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="contact_person_phone"
                      value={profileFormik.values.contact_person_phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          profileFormik.setFieldValue('contact_person_phone', value);
                        }
                      }}
                      onBlur={profileFormik.handleBlur}
                      placeholder="1234567890"
                    />
                    {profileFormik.touched.contact_person_phone && profileFormik.errors.contact_person_phone && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.contact_person_phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Email (Non-editable)</label>
                    <input
                      type="email"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 cursor-not-allowed"
                      value={companyData.contact_email || companyData.email}
                      disabled
                    />
                    <p className="text-sm text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Industry *</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="industry"
                      value={profileFormik.values.industry}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                    />
                    {profileFormik.touched.industry && profileFormik.errors.industry && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.industry}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Location *</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="location"
                      value={profileFormik.values.location}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                    />
                    {profileFormik.touched.location && profileFormik.errors.location && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.location}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Company Size *</label>
                    <select
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="company_size"
                      value={profileFormik.values.company_size}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {profileFormik.touched.company_size && profileFormik.errors.company_size && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.company_size}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">Website</label>
                    <input
                      type="url"
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      name="website_url"
                      value={profileFormik.values.website_url}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      placeholder="https://example.com"
                    />
                    {profileFormik.touched.website_url && profileFormik.errors.website_url && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.website_url}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-slate-700 mb-2 font-medium">About Us</label>
                    <textarea
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      rows={3}
                      name="about_us"
                      value={profileFormik.values.about_us}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      placeholder="Describe your company..."
                    />
                  </div>
                  
                  <div className="flex justify-between mt-8 gap-3">
                    <button
                      type="button"
                      className="flex-1 bg-slate-200 text-slate-800 px-4 py-3 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                      onClick={() => {
                        if (profileFormik.dirty) {
                          if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
                            profileFormik.resetForm();
                            setIsEditingProfile(false);
                          }
                        } else {
                          setIsEditingProfile(false);
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                      disabled={profileFormik.isSubmitting}
                    >
                      {profileFormik.isSubmitting ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-800 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{companyData.contact_person_name || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{companyData.contact_person_phone || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{companyData.contact_email || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-800 mb-3">Company Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Building size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{companyData.industry || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{companyData.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{companyData.company_size || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <Globe size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{companyData.website_url || 'No website'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-800 mb-3">About Us</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {companyData.about_us || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-slate-200">
                  <button
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                  <button 
                    className="w-full bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-all duration-200 font-medium"
                    onClick={() => logout(navigate)}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
