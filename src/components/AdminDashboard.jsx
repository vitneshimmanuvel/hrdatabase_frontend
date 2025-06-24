import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout } from '../utils/auth';

const API_BASE = 'http://localhost:4000';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State for main dashboard
  const [view, setView] = useState('employees');
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [details, setDetails] = useState(null);
  const [jobRequests, setJobRequests] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [jobError, setJobError] = useState(null);
  const [employeesForForm, setEmployeesForForm] = useState([]);
  const [companiesForForm, setCompaniesForForm] = useState([]);
  const [jobRequestsForForm, setJobRequestsForForm] = useState([]);
  const [selectedCompanyForForm, setSelectedCompanyForForm] = useState('');
  
  // State for add forms
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    mobile: '+91',
    email: '',
    password: '',
    confirmPassword: '',
    qualification: '',
    industry: '',
    emplocation: '',
    empsalary: '',
    skills: '',
    companyName: '',
    location: '',
    contactPersonName: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  
  // State for secondary dashboard
  const [dashboardData, setDashboardData] = useState({
    jobRequests: [],
    adminConnectedEmployees: [],
    joinRequests: [],
    stats: {
      totalJobRequests: 0,
      totalAdminConnections: 0,
      totalJoinRequests: 0
    }
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Check authentication on component load
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Fetch initial data
    fetchInitialData();
  }, [navigate]);

  const fetchInitialData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch employees and companies for forms
      const [employeesRes, companiesRes] = await Promise.all([
        fetch(`${API_BASE}/api/employees`, { headers }),
        fetch(`${API_BASE}/api/companies`, { headers })
      ]);

      if (employeesRes.status === 401 || companiesRes.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      const employeesData = await employeesRes.json();
      const companiesData = await companiesRes.json();

      setEmployeesForForm(employeesData);
      setCompaniesForForm(companiesData);

      // Fetch main view data
      if (view === 'employees') fetchEmployees();
      else fetchCompanies();

      // Fetch dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  // Fetch dashboard data with authentication
  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      if (!token) {
        logout();
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const endpoints = [
        `${API_BASE}/api/admin/job-requests`,
        `${API_BASE}/api/admin/connected-employees`,
        `${API_BASE}/api/admin/join-requests`,
        `${API_BASE}/api/admin/dashboard-stats`
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(endpoint, { headers }).then(res => {
            if (res.status === 401) {
              logout();
              navigate('/login');
              throw new Error('Unauthorized');
            }
            return res.json();
          })
        )
      );

      const processedResponses = responses.map(res => 
        res.status === 'fulfilled' ? res.value : null
      );

      if (processedResponses.includes(null)) return;

      const [jobData, connData, joinData, statsData] = processedResponses;

      setDashboardData({
        jobRequests: jobData || [],
        adminConnectedEmployees: connData || [],
        joinRequests: joinData || [],
        stats: statsData || {
          totalJobRequests: 0,
          totalAdminConnections: 0,
          totalJoinRequests: 0
        }
      });
      setDashboardError(null);
    } catch (err) {
      console.error('Dashboard API Error:', err);
      setDashboardError(err.message || 'Failed to load dashboard data');
    } finally {
      setDashboardLoading(false);
    }
  };

  // Set up fetch functions with authentication
  const fetchEmployees = () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    fetch(`${API_BASE}/api/employees`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          return [];
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          setError(null);
        } else {
          throw new Error('Expected employees array');
        }
      })
      .catch(err => {
        console.error(err);
        setItems([]);
        setError('Failed to load employees');
      })
      .finally(() => setLoading(false));
  };

  const fetchCompanies = () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    fetch(`${API_BASE}/api/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          return [];
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          setError(null);
        } else {
          throw new Error('Expected companies array');
        }
      })
      .catch(err => {
        console.error(err);
        setItems([]);
        setError('Failed to load companies');
      })
      .finally(() => setLoading(false));
  };

  const fetchItemDetails = (id) => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    fetch(`${API_BASE}/api/${view}/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          return {};
        }
        return res.json();
      })
      .then(data => {
        setDetails(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load details');
      })
      .finally(() => setLoading(false));
  };

  const fetchJobRequests = (companyId) => {
    setJobLoading(true);
    const token = getToken();
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    fetch(`${API_BASE}/api/companies/${companyId}/job-requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          navigate('/login');
          return [];
        }
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setJobRequests(data))
      .catch(err => {
        console.error(err);
        setJobError('Failed to load job requests');
      })
      .finally(() => setJobLoading(false));
  };

  // Form handling functions
  const fetchJobRequestsForForm = (companyId) => {
    if (!companyId) {
      setJobRequestsForForm([]);
      return;
    }
    
    const token = getToken();
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    fetch(`${API_BASE}/api/companies/${companyId}/job-requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setJobRequestsForForm(data))
      .catch(() => setJobRequestsForForm([]));
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompanyForForm(companyId);
    fetchJobRequestsForForm(companyId);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    const formData = new FormData(e.target);
    const employeeId = formData.get('employee');
    const companyId = formData.get('company');
    const requestId = formData.get('jobRequest');

    try {
      const response = await fetch(`${API_BASE}/api/connections`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: employeeId,
          company_id: companyId,
          request_id: requestId
        })
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create connection');
      }

      alert('Employee connected to job request successfully!');
      setSelectedCompanyForForm('');
      setJobRequestsForForm([]);
      e.target.reset();
      fetchDashboardData();
    } catch (error) {
      console.error('Connection error:', error);
      alert(error.message);
    }
  };

  // Add item functions
  const openAddEmployeeModal = () => {
    setIsAddEmployeeOpen(true);
    setAddForm(prev => ({
      ...prev,
      role: 'employee'
    }));
  };

  const openAddCompanyModal = () => {
    setIsAddCompanyOpen(true);
    setAddForm(prev => ({
      ...prev,
      role: 'company'
    }));
  };

  const handleAddFormChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'mobile') {
      if (value.startsWith('+91') && value.length <= 13) {
        setAddForm({ ...addForm, [id]: value });
      } else if (value === '+9') {
        setAddForm({ ...addForm, [id]: value });
      } else if (value.length < 4) {
        setAddForm({ ...addForm, [id]: '+91' });
      } else {
        setAddForm({ ...addForm, [id]: addForm.mobile });
      }
    } else {
      setAddForm({ ...addForm, [id]: value });
    }
  };

  const checkEmail = async (email) => {
    try {
      const token = getToken();
      if (!token) {
        logout();
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/auth/check-email?email=${email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEmailExists(data.exists);
    } catch (err) {
      console.error('Email check failed:', err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (addForm.password !== addForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setAddLoading(true);
    setEmailExists(false);

    try {
      const token = getToken();
      if (!token) {
        logout();
        navigate('/login');
        return;
      }

      await checkEmail(addForm.email);
      if (emailExists) {
        setAddLoading(false);
        return;
      }

      const payload = { ...addForm };
      if (isAddEmployeeOpen) {
        payload.role = 'employee';
      } else {
        payload.role = 'company';
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Registration failed');
        setAddLoading(false);
        return;
      }

      alert('Registration successful!');
      setIsAddEmployeeOpen(false);
      setIsAddCompanyOpen(false);
      
      if (addForm.role === 'employee') fetchEmployees();
      else fetchCompanies();
      
      fetchDashboardData();

    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  // Helper variables
  const labelField = view === 'employees' ? 'full_name' : 'name';
  const filteredJobRequests = jobRequests
    .filter(request => 
      request.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortOption === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return 0;
    });

  // Handle view changes
  useEffect(() => {
    if (view === 'employees') fetchEmployees();
    else fetchCompanies();
  }, [view]);

  // Handle item selection
  const handleItemClick = (item) => {
    setSelectedItem(item);
    fetchItemDetails(item[view === 'employees' ? 'employee_id' : 'company_id']);
    
    if (view === 'companies') {
      fetchJobRequests(item.company_id);
    } else {
      setJobRequests([]);
    }
  };

  return (
    <div className="grid grid-cols-8 grid-rows-12 gap-4 p-6 min-h-screen bg-gray-300">
      {/* Top-left cards */}
      <div className="col-span-2 bg-white shadow rounded-xl p-4">
        {selectedItem && (
          <div
            className={`flex items-center justify-center p-4 rounded-xl ${
              view === 'employees' ? 'bg-green-100' : 'bg-blue-100'
            }`}
          >
            <h3 className="text-xl font-semibold text-center">
              {view === 'employees' ? selectedItem.full_name : selectedItem.name}
            </h3>
          </div>
        )}
      </div>
      <div className="col-span-2 row-span-3 col-start-1 row-start-2 bg-white shadow rounded-xl p-4">
        {details && view === 'employees' && (
          <div className="space-y-2">
            <p>Phone: {details.phone}</p>
            <p>Qualification: {details.qualification}</p>
            <p>Industry: {details.industry}</p>
            <p>Preferred Location: {details.preferred_location}</p>
            <p>Preferred Salary: {details.preferred_salary}</p>
          </div>
        )}
        {details && view === 'companies' && (
          <div className="space-y-2">
            <p>Industry: {details.industry}</p>
            <p>Location: {details.location}</p>
            <p>Contact Person: {details.contact_person_name}</p>
            <p>Contact Phone: {details.contact_person_phone}</p>
            <p>Contact Email: {details.contact_email}</p>
          </div>
        )}
      </div>
      <div className="col-span-4 col-start-3 row-start-1 bg-white shadow rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center w-full max-w-md">
            <Search className="absolute p-0.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search job requests..."
              className="pl-10 pr-3 py-2 border rounded-full w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="ml-4 py-2 px-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
      <div className="col-span-4 row-span-3 col-start-3 row-start-2 bg-white shadow rounded-xl p-4 scrolly">
        {view === 'companies' && selectedItem && (
          <div className="h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Job Requests</h3>
            {jobLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loader"></div>
              </div>
            ) : jobError ? (
              <p className="text-red-500">{jobError}</p>
            ) : filteredJobRequests.length === 0 ? (
              <p className="text-gray-500">No job requests found</p>
            ) : (
              <ul className="space-y-2">
                {filteredJobRequests.map(request => (
                  <li
                    key={request.request_id}
                    className="bg-gray-50 p-3 rounded-lg shadow-sm transition duration-300 hover:bg-gray-100"
                  >
                    <h4 className="font-medium">{request.title}</h4>
                    <p className="text-sm text-gray-600">
                      Location: {request.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {request.employment_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {request.status}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      Posted on: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!view || view === 'employees' && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Select a company to view job requests</p>
          </div>
        )}
      </div>

      {/* Toggle Buttons */}
      <div className="col-span-2 grid grid-cols-1 gap-2 col-start-7 row-start-1">
        <button
          className={`p-3 text-center rounded-xl ${
            view === 'employees' ? 'bg-green-600 text-white' : 'bg-white shadow'
          }`}
          onClick={() => setView('employees')}
        >
          Employees
        </button>
        <button
          className={`p-3 text-center rounded-xl ${
            view === 'companies' ? 'bg-blue-500 text-white' : 'bg-white shadow'
          }`}
          onClick={() => setView('companies')}
        >
          Companies
        </button>
      </div>

      {/* List Pane */}
      <div className="col-span-2 row-span-4 col-start-7 row-start-2 bg-white shadow rounded-xl p-4 scrolly">
        <h2 className="text-lg font-semibold mb-2">
          {view === 'employees' ? 'Employees' : 'Companies'}
        </h2>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        )}

        {error && !loading && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item[view === 'employees' ? 'employee_id' : 'company_id']} className="flex justify-between items-center iteeem">
                <span>{item[labelField]}</span>
                <button
                  className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleItemClick(item)}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Employee Button */}
      <div className="col-span-3 row-start-6 bg-white shadow rounded-xl p-4 flex items-center justify-center">
        <button
          onClick={openAddEmployeeModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <PlusCircle size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Add Company Button */}
      <div className="col-span-3 col-start-4 row-start-6 bg-white shadow rounded-xl p-4 flex items-center justify-center">
        <button
          onClick={openAddCompanyModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <PlusCircle size={20} />
          <span>Add Company</span>
        </button>
      </div>

      {/* Connection Form */}
      <div className="col-span-6 col-start-1 row-start-5 bg-white shadow rounded-xl p-4">
        <form 
          onSubmit={handleConnect}
          className="w-full flex justify-between items-center"
        >
          <div className="flex-1 mr-2">
            <label className="block text-sm mb-1">Employee</label>
            <select 
              name="employee"
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select employee</option>
              {employeesForForm.map(emp => (
                <option 
                  key={emp.employee_id} 
                  value={emp.employee_id}
                >
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 mx-2">
            <label className="block text-sm mb-1">Company</label>
            <select 
              name="company"
              className="w-full border rounded px-3 py-2"
              onChange={handleCompanyChange}
              required
            >
              <option value="">Select company</option>
              {companiesForForm.map(comp => (
                <option 
                  key={comp.company_id} 
                  value={comp.company_id}
                >
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 ml-2">
            <label className="block text-sm mb-1">Job Request</label>
            <select 
              name="jobRequest"
              className="w-full border rounded px-3 py-2"
              required
              disabled={!selectedCompanyForForm}
            >
              <option value="">Select request</option>
              {jobRequestsForForm.map(req => (
                <option 
                  key={req.request_id} 
                  value={req.request_id}
                >
                  {req.title}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition self-end"
          >
            Connect
          </button>
        </form>
      </div>

      {/* Secondary Dashboard */}
      <div className="col-span-8 row-start-7 row-span-6 grid grid-cols-6 gap-2">
        {/* Loading state */}
        {dashboardLoading && (
          <div className="col-span-6 flex items-center justify-center bg-white shadow-lg rounded-lg">
            <div className="text-xl font-semibold text-gray-700">Loading dashboard data...</div>
          </div>
        )}

        {/* Error state */}
        {dashboardError && (
          <div className="col-span-6 flex items-center justify-center bg-white shadow-lg rounded-lg">
            <div className="text-xl font-semibold text-red-600">{dashboardError}</div>
          </div>
        )}

        {/* Dashboard content */}
        {!dashboardLoading && !dashboardError && (
          <>
            {/* Company Job Requests */}
            <div className="bg-white shadow-lg rounded-lg col-span-2 row-span-5 p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Active Job Requests</h2>
              <div className="space-y-3">
                {dashboardData.jobRequests.map((request) => (
                  <div
                    key={request.request_id}
                    className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg"
                  >
                    <h3 className="font-semibold text-gray-800">{request.title}</h3>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm font-medium text-gray-600">{request.domain}</span>
                      <span className="text-xs font-medium text-gray-500">{request.company_name}</span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      {request.interviewDate ? (
                        <span className="flex items-center text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(request.interviewDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">No date set</span>
                      )}
                      <span className={`px-2 py-1 rounded ${
                        request.status === 'active' ? 'bg-green-100 text-green-800' : 
                        request.status === 'closed' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-xs mt-1 flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a2 2 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {request.count} positions
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employees Connected by Admin */}
            <div className="bg-white shadow-lg rounded-lg col-start-3 col-span-2 row-span-5 p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Admin Connected Employees</h2>
              <div className="space-y-3">
                {dashboardData.adminConnectedEmployees.map((conn) => (
                  <div
                    key={conn.connection_id}
                    className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg"
                  >
                    <h3 className="font-semibold text-gray-800">{conn.employee_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Job Role: {conn.job_title}</p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(conn.connection_date).toLocaleDateString()}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {conn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* People Wanting to Join */}
            <div className="bg-white shadow-lg rounded-lg col-start-5 col-span-2 row-span-5 p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Employee Join Requests</h2>
              <div className="space-y-3">
                {dashboardData.joinRequests.map((conn) => (
                  <div
                    key={conn.connection_id}
                    className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg"
                  >
                    <h3 className="font-semibold text-gray-800">{conn.employee_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Interested in: {conn.job_title}</p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                        </svg>
                        {conn.company_name}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {conn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Footer */}
            <div className="bg-white shadow-lg rounded-lg col-span-6 p-4 flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{dashboardData.stats.totalJobRequests}</div>
                <div className="text-sm text-gray-500">Total Job Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{dashboardData.stats.totalAdminConnections}</div>
                <div className="text-sm text-gray-500">Admin Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{dashboardData.stats.totalJoinRequests}</div>
                <div className="text-sm text-gray-500">Join Requests</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Employee</h3>
              <button onClick={() => setIsAddEmployeeOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={addForm.name}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  id="mobile"
                  value={addForm.mobile}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {addForm.mobile.length !== 13 && (
                  <p className="text-red-500 text-sm mt-1">Mobile number must be 10 digits long</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={addForm.email}
                  onChange={handleAddFormChange}
                  onBlur={() => checkEmail(addForm.email)}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {emailExists && (
                  <p className="text-red-500 text-sm mt-1">This email is already registered</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  value={addForm.password}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={addForm.confirmPassword}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Qualification</label>
                <input
                  type="text"
                  id="qualification"
                  value={addForm.qualification}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Industry</label>
                <select
                  id="industry"
                  value={addForm.industry}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="IT">IT</option>
                  <option value="Non-IT">Non-IT</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Preferred Location</label>
                <input
                  type="text"
                  id="emplocation"
                  value={addForm.emplocation}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Preferred Salary Range</label>
                <input
                  type="text"
                  id="empsalary"
                  value={addForm.empsalary}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Skill Set (comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  value={addForm.skills}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className={`px-4 py-2 rounded-md ${
                    addLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {addLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Company</h3>
              <button onClick={() => setIsAddCompanyOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  value={addForm.companyName}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Industry</label>
                <select
                  id="industry"
                  value={addForm.industry}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="IT">IT</option>
                  <option value="Non-IT">Non-IT</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Company Location</label>
                <input
                  type="text"
                  id="location"
                  value={addForm.location}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  id="contactPersonName"
                  value={addForm.contactPersonName}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  id="mobile"
                  value={addForm.mobile}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {addForm.mobile.length !== 13 && (
                  <p className="text-red-500 text-sm mt-1">Mobile number must be 10 digits long</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={addForm.email}
                  onChange={handleAddFormChange}
                  onBlur={() => checkEmail(addForm.email)}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {emailExists && (
                  <p className="text-red-500 text-sm mt-1">This email is already registered</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  value={addForm.password}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={addForm.confirmPassword}
                  onChange={handleAddFormChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className={`px-4 py-2 rounded-md ${
                    addLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {addLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;