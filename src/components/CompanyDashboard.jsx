import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Building, Search, Briefcase, Plus, X, User, 
  MapPin, Users, Calendar, Mail, Phone, Globe
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
    .min(1, 'Must be at least 1'),
  interview_time: Yup.date().nullable()
});

const companyProfileSchema = Yup.object().shape({
  name: Yup.string().required('Company name is required'),
  contact_person_phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
    .required('Contact phone is required'),
  contact_email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  industry: Yup.string().required('Industry is required'),
  location: Yup.string().required('Location is required'),
  contact_person_name: Yup.string().required('Contact person is required'),
  company_size: Yup.string().required('Company size is required'),
  website_url: Yup.string().url('Invalid URL'),
  about_us: Yup.string(),
  hiring_status: Yup.string().required('Hiring status is required')
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
  const [activeTab, setActiveTab] = useState('all');

  // Formik for job requests
  const jobFormik = useFormik({
    initialValues: {
      title: '',
      domain: '',
      description: '',
      employment_type: '',
      location: '',
      salary_range: '',
      count: '',
      interview_time: ''
    },
    validationSchema: jobRequestSchema,
    onSubmit: async (values) => {
      try {
        const token = getToken();
        if (!token) return logout(navigate);
        
        const url = selectedJob 
          ? `http://localhost:4000/jobs/requests/${selectedJob.request_id}`
          : 'http://localhost:4000/jobs/create';
          
        const method = selectedJob ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...values,
            count: parseInt(values.count, 10),
            interview_time: values.interview_time || null
          })
        });

        if (response.status === 401) return logout(navigate);
        if (!response.ok) throw new Error(selectedJob ? 'Update failed' : 'Creation failed');
        
        const jobData = await response.json();
        
        if (selectedJob) {
          setJobRequests(jobRequests.map(job => 
            job.request_id === jobData.request_id ? jobData : job
          ));
        } else {
          setJobRequests([jobData, ...jobRequests]);
        }
        
        setApiMessage({ type: 'success', message: `Job ${selectedJob ? 'updated' : 'created'} successfully!` });
        handleCloseForms();
      } catch (error) {
        console.error('Job operation error:', error);
        setApiMessage({ type: 'error', message: error.message || 'Operation failed' });
      }
    }
  });

  // Formik for company profile
  const profileFormik = useFormik({
    initialValues: {
      name: '',
      contact_person_phone: '',
      contact_email: '',
      industry: '',
      location: '',
      contact_person_name: '',
      company_size: '',
      website_url: '',
      about_us: '',
      hiring_status: ''
    },
    validationSchema: companyProfileSchema,
    onSubmit: async (values) => {
      try {
        const token = getToken();
        if (!token) return logout(navigate);
        
        const response = await fetch(`http://localhost:4000/api/companies/${companyData.company_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });

        if (response.status === 401) return logout(navigate);
        if (!response.ok) throw new Error('Profile update failed');
        
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

  const fetchCompanyData = async () => {
    try {
      const token = getToken();
      if (!token) return logout(navigate);
      
      const response = await fetch('http://localhost:4000/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) return logout(navigate);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setCompanyData(data);
      
      // Set initial values for profile form
      profileFormik.setValues({
        name: data.companyname || data.name || '',
        contact_person_phone: data.contact_person_phone || '',
        contact_email: data.contact_email || '',
        industry: data.industry || '',
        location: data.location || '',
        contact_person_name: data.contact_person_name || '',
        company_size: data.company_size || '',
        website_url: data.website_url || '',
        about_us: data.about_us || '',
        hiring_status: data.hiring_status || ''
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  const fetchJobRequests = async () => {
    try {
      const token = getToken();
      if (!token) return logout(navigate);
      
      const response = await fetch('http://localhost:4000/jobs/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) return logout(navigate);
      if (!response.ok) throw new Error('Failed to fetch job requests');
      
      setJobRequests(await response.json());
    } catch (error) {
      console.error('Error fetching job requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
    fetchJobRequests();
  }, []);

  const handleCloseForms = () => {
    setShowJobForm(false);
    setShowJobDetails(false);
    setSelectedJob(null);
    jobFormik.resetForm();
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    jobFormik.setValues({
      title: job.title,
      domain: job.domain,
      description: job.description,
      employment_type: job.employment_type,
      location: job.location,
      salary_range: job.salary_range || '',
      count: job.count.toString(),
      interview_time: job.interview_time || ''
    });
    setShowJobForm(true);
  };

  // Filter job requests based on active tab
  const getFilteredRequests = () => {
    if (activeTab === 'active') {
      return jobRequests.filter(job => job.status === 'open');
    } else if (activeTab === 'placed') {
      // Mock data for placed positions
      return [
        {
          request_id: 'placed-1',
          title: 'Senior Developer',
          domain: 'Technology',
          employment_type: 'Full-time',
          count: 3,
          location: 'Mumbai',
          salary_range: '1,500,000 - 2,000,000',
          status: 'placed',
          created_at: new Date().toISOString(),
          description: 'Successfully placed candidates for senior developer roles'
        },
        {
          request_id: 'placed-2',
          title: 'UX Designer',
          domain: 'Design',
          employment_type: 'Full-time',
          count: 2,
          location: 'Bangalore',
          salary_range: '1,200,000 - 1,500,000',
          status: 'placed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          description: 'Placed UX designers in top companies'
        }
      ];
    }
    return jobRequests.filter(r =>
      (r.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (r.domain?.toLowerCase() || '').includes(search.toLowerCase())
    );
  };

  const filteredRequests = getFilteredRequests();

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Building className="animate-spin text-blue-500 text-6xl mb-4" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-800 flex items-center space-x-2">
            <Building size={24} />
            <span>{companyData?.companyname || companyData?.name || 'Company Dashboard'}</span>
          </h1>
          <button 
            onClick={() => setShowSidebar(true)} 
            className="flex items-center space-x-2 text-blue-800"
          >
            <User size={24} />
            <span>{companyData?.contact_person_name || 'Account'}</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search job roles or domains..."
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
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
        </div>

        {apiMessage && (
          <div className={`p-4 rounded-lg mb-6 ${
            apiMessage.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {apiMessage.message}
          </div>
        )}

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b overflow-x-auto whitespace-nowrap">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('all')}
            >
              Your Job Requests
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('active')}
            >
              Active Job Requests
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'placed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('placed')}
            >
              Placed Positions
            </button>
          </div>
          
          {filteredRequests.length > 0 ? (
            filteredRequests.map(req => (
              <div key={req.request_id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-blue-800">{req.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                        {req.domain}
                      </span>
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                        {req.employment_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <p className="text-sm text-gray-500">
                      Created: {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs mt-1 ${
                      req.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : req.status === 'placed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 line-clamp-2 mb-4">{req.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-500 mr-2" />
                    <span>{req.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="text-gray-500 mr-2" />
                    <span>{req.count} positions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">Rs</span>
                    <span>{req.salary_range || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-500 mr-2" />
                    <span>
                      {req.interview_time 
                        ? new Date(req.interview_time).toLocaleString() 
                        : 'Not scheduled'}
                    </span>
                  </div>
                </div>
                
                {activeTab !== 'placed' && (
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                      onClick={() => handleEditJob(req)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      onClick={() => {
                        setSelectedJob(req);
                        setShowJobDetails(true);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Briefcase className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-bold mb-2">
                {activeTab === 'placed' 
                  ? 'No placed positions' 
                  : 'No job requests found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'placed' 
                  ? 'You haven\'t placed any candidates yet' 
                  : 'Create your first job request to get started'}
              </p>
              {activeTab !== 'placed' && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  onClick={() => setShowJobForm(true)}
                >
                  Create Job Request
                </button>
              )}
            </div>
          )}
        </div>

        {/* Job Request Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-blue-800">
                    {selectedJob ? 'Edit Job Request' : 'Create New Job Request'}
                  </h2>
                  <button onClick={handleCloseForms}>
                    <X size={24} className="text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
                
                <form onSubmit={jobFormik.handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Job Title *</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:outline-none"
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
                      <label className="block text-gray-700 mb-2">Number of Positions *</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-3 border rounded-lg focus:outline-none"
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
                      <label className="block text-gray-700 mb-2">Domain *</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:outline-none"
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
                      <label className="block text-gray-700 mb-2">Employment Type *</label>
                      <select
                        className="w-full p-3 border rounded-lg focus:outline-none"
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
                      <label className="block text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:outline-none"
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
                      <label className="block text-gray-700 mb-2">Interview Time</label>
                      <input
                        type="datetime-local"
                        className="w-full p-3 border rounded-lg focus:outline-none"
                        name="interview_time"
                        value={jobFormik.values.interview_time}
                        onChange={jobFormik.handleChange}
                        onBlur={jobFormik.handleBlur}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2">Salary Range</label>
                      <div className="flex items-center">
                        <span className="mr-2 font-medium">Rs</span>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-lg focus:outline-none"
                          name="salary_range"
                          value={jobFormik.values.salary_range}
                          onChange={jobFormik.handleChange}
                          onBlur={jobFormik.handleBlur}
                          placeholder="Example: 80,000 - 100,000"
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2">Job Description *</label>
                      <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none"
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
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                      onClick={handleCloseForms}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      disabled={jobFormik.isSubmitting}
                    >
                      {jobFormik.isSubmitting ? 'Processing...' : 'Save Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-blue-800">Job Details</h2>
                  <button onClick={() => setShowJobDetails(false)}>
                    <X size={24} className="text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">{selectedJob.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {selectedJob.domain}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {selectedJob.employment_type}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                        {selectedJob.count} positions
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Location</h4>
                      <p>{selectedJob.location}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Salary Range</h4>
                      <p>Rs {selectedJob.salary_range || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Interview Time</h4>
                      <p>
                        {selectedJob.interview_time 
                          ? new Date(selectedJob.interview_time).toLocaleString() 
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Status</h4>
                      <p className={`inline-block px-2 py-1 rounded ${
                        selectedJob.status === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedJob.status === 'closed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedJob.status}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Job Description</h4>
                    <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <button 
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                      onClick={() => setShowJobDetails(false)}
                    >
                      Close
                    </button>
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      onClick={() => {
                        setShowJobDetails(false);
                        handleEditJob(selectedJob);
                      }}
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        {showSidebar && companyData && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-lg z-50">
            <div className="p-4 border-b flex items-center">
              <Building className="text-blue-500 mr-3" size={28} />
              <div>
                <h3 className="font-bold text-lg">{companyData.companyname || companyData.name}</h3>
                <p className="text-sm text-gray-600">{companyData.contact_email}</p>
              </div>
              <button
                className="ml-auto text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowSidebar(false);
                  setIsEditingProfile(false);
                }}
              >
                <X size={24} />
              </button>
            </div>

            {isEditingProfile ? (
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
                <h2 className="text-xl font-bold text-blue-800 mb-4">Edit Profile</h2>
                
                <form onSubmit={profileFormik.handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:outline-none"
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
                    <label className="block text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:outline-none"
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
                    <label className="block text-gray-700 mb-2">Contact Phone *</label>
                    <div className="flex items-center">
                      <span className="mr-2 p-2 bg-gray-100 rounded-l-lg">+91</span>
                      <input
                        type="tel"
                        className="w-full p-3 border rounded-r-lg focus:outline-none"
                        name="contact_person_phone"
                        value={profileFormik.values.contact_person_phone}
                        onChange={(e) => {
                          // Allow only numbers
                          const value = e.target.value.replace(/\D/g, '');
                          // Limit to 10 digits
                          if (value.length <= 10) {
                            profileFormik.setFieldValue('contact_person_phone', value);
                          }
                        }}
                        onBlur={profileFormik.handleBlur}
                        placeholder="1234567890"
                      />
                    </div>
                    {profileFormik.touched.contact_person_phone && profileFormik.errors.contact_person_phone && (
                      <p className="text-red-500 text-sm mt-1">{profileFormik.errors.contact_person_phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Industry *</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:outline-none"
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
                    <label className="block text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:outline-none"
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
                    <label className="block text-gray-700 mb-2">Company Size *</label>
                    <select
                      className="w-full p-3 border rounded-lg focus:outline-none"
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
                    <label className="block text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      className="w-full p-3 border rounded-lg focus:outline-none"
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
                  
                  <div className="hidden">
                    <input
                      type="text"
                      name="hiring_status"
                      value={profileFormik.values.hiring_status}
                      onChange={profileFormik.handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">About Us</label>
                    <textarea
                      className="w-full p-3 border rounded-lg focus:outline-none"
                      rows={3}
                      name="about_us"
                      value={profileFormik.values.about_us}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      placeholder="Describe your company..."
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
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
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      disabled={profileFormik.isSubmitting}
                    >
                      {profileFormik.isSubmitting ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                    <div className="flex items-center mb-1">
                      <User size={16} className="text-gray-500 mr-2" />
                      <span>{companyData.contact_person_name}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <Phone size={16} className="text-gray-500 mr-2" />
                      <span>+91 {companyData.contact_person_phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-500 mr-2" />
                      <span>{companyData.contact_email}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Company Details</h4>
                    <div className="flex items-center mb-1">
                      <Building size={16} className="text-gray-500 mr-2" />
                      <span>{companyData.industry}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <MapPin size={16} className="text-gray-500 mr-2" />
                      <span>{companyData.location}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <Users size={16} className="text-gray-500 mr-2" />
                      <span>{companyData.company_size || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe size={16} className="text-gray-500 mr-2" />
                      <span>{companyData.website_url || 'No website'}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">About Us</h4>
                    <p className="text-gray-600">
                      {companyData.about_us || 'No description provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
                  <button
                    className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                  <button 
                    className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
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