import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api'; 
import {
  Users, Building, Briefcase, TrendingUp, Calendar,
  Search, Filter, Eye, Edit, Trash2, UserPlus, Plus,
  CheckCircle, Clock, XCircle, Phone, Mail, MapPin,
  DollarSign, FileText, BarChart3, Activity,
  LogOut, Download, RefreshCw, AlertCircle, Star, Save,
  ChevronDown, User, Building2, Award, Target, X, Code, Cpu, Lock
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobRequests, setJobRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionSearchTerm, setConnectionSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [userRole, setUserRole] = useState('admin');
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Token and API functions
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return null;
    }
    return token;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const apiRequest = async (url, options = {}) => {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [
        statsData,
        empData,
        compData,
        jobData,
        connData,
        placeData
      ] = await Promise.allSettled([
        apiRequest('/api/admin/dashboard-stats'),
        apiRequest('/api/admin/employees'),
        apiRequest('/api/admin/companies'),
        apiRequest('/api/admin/job-requests'),
        apiRequest('/api/admin/connections'),
        apiRequest('/api/admin/connections')
      ]);

      setDashboardStats(statsData.status === 'fulfilled' ? statsData.value : {});
      setEmployees(empData.status === 'fulfilled' ? empData.value : []);
      setCompanies(compData.status === 'fulfilled' ? compData.value : []);
      setJobRequests(jobData.status === 'fulfilled' ? jobData.value : []);
      setConnections(connData.status === 'fulfilled' ? connData.value : []);
      
      // Filter placements from connections
      const placementData = placeData.status === 'fulfilled' ? placeData.value.filter(conn => conn.placement_status === 'placed') : [];
      setPlacements(placementData);

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'admin';
    setUserRole(role);
    fetchData();
  }, []);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle mobile number formatting
    if (name === 'mobile' || name === 'phone' || name === 'contact_person_phone') {
      let cleanValue = value.replace(/[^\d+]/g, '');
      
      if (!cleanValue.startsWith('+91')) {
        if (cleanValue.startsWith('91')) {
          cleanValue = '+' + cleanValue;
        } else if (cleanValue.startsWith('9')) {
          cleanValue = '+9' + cleanValue.substring(1);
        } else {
          cleanValue = '+91' + cleanValue;
        }
      }
      
      if (cleanValue.length <= 13) {
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  // Input restrictions
  const allowOnlyLetters = (e) => {
    const char = e.key;
    if (!/^[a-zA-Z\s]$/.test(char) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(char)) {
      e.preventDefault();
    }
  };

  const allowOnlyNumbers = (e) => {
    const char = e.key;
    if (!/^[0-9]$/.test(char) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(char)) {
      e.preventDefault();
    }
  };

  // Add Employee function
  const addEmployee = async () => {
    try {
      setActionLoading(true);
      
      if (!formData.full_name?.trim()) {
        alert('Full name is required');
        return;
      }
      
      if (!formData.email?.trim()) {
        alert('Email is required');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      if (!formData.phone?.trim()) {
        alert('Phone number is required');
        return;
      }

      if (!formData.phone.startsWith('+91') || formData.phone.length !== 13) {
        alert('Phone number must be in format +91XXXXXXXXXX (10 digits after +91)');
        return;
      }

      if (!formData.password?.trim()) {
        alert('Password is required');
        return;
      }

      if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }

      const payload = {
        role: 'employee',
        email: formData.email.trim(),
        password: formData.password,
        mobile: formData.phone.replace('+91', ''),
        name: formData.full_name.trim(),
        qualification: formData.qualification?.trim() || '',
        industry: formData.industry || '',
        emplocation: formData.preferred_location?.trim() || '',
        empsalary: formData.preferred_salary ? parseInt(formData.preferred_salary) : 0,
        skills: formData.skills?.trim() || ''
      };

      const result = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (result) {
        await fetchData();
        setShowModal(false);
        setFormData({});
        alert('Employee added successfully');
      }
    } catch (error) {
      console.error('Add employee error:', error);
      alert(error.message || 'Failed to add employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Company function
  const addCompany = async () => {
    try {
      setActionLoading(true);
      
      if (!formData.name?.trim()) {
        alert('Company name is required');
        return;
      }
      
      if (!formData.email?.trim()) {
        alert('Email is required');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      if (!formData.contact_person_name?.trim()) {
        alert('Contact person name is required');
        return;
      }

      if (!formData.contact_person_phone?.trim()) {
        alert('Phone number is required');
        return;
      }

      if (!formData.contact_person_phone.startsWith('+91') || formData.contact_person_phone.length !== 13) {
        alert('Phone number must be in format +91XXXXXXXXXX (10 digits after +91)');
        return;
      }

      if (!formData.password?.trim()) {
        alert('Password is required');
        return;
      }

      if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }

      const payload = {
        role: 'company',
        email: formData.email.trim(),
        password: formData.password,
        mobile: formData.contact_person_phone.replace('+91', ''),
        companyName: formData.name.trim(),
        contactPersonName: formData.contact_person_name.trim(),
        location: formData.location?.trim() || '',
        industry: formData.industry || ''
      };

      const result = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (result) {
        await fetchData();
        setShowModal(false);
        setFormData({});
        alert('Company added successfully');
      }
    } catch (error) {
      console.error('Add company error:', error);
      alert(error.message || 'Failed to add company');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Job Request
  const addJobRequest = async () => {
    try {
      setActionLoading(true);
      
      if (!formData.company_id || !formData.title || !formData.description) {
        alert('Company, title, and description are required');
        return;
      }

      const result = await apiRequest('/jobs/create', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (result) {
        await fetchData();
        setShowModal(false);
        setFormData({});
        alert('Job request added successfully');
      }
    } catch (error) {
      alert(error.message || 'Failed to add job request');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Connection
  const createConnection = async () => {
    try {
      setActionLoading(true);
      
      if (!formData.request_id || !formData.employee_id) {
        alert('Please select both job and employee');
        return;
      }

      const result = await apiRequest('/api/admin/create-connection', {
        method: 'POST',
        body: JSON.stringify({
          request_id: formData.request_id,
          employee_id: formData.employee_id,
          notes: formData.notes
        })
      });

      if (result) {
        await fetchData();
        setShowModal(false);
        setFormData({});
        alert('Connection created successfully');
      }
    } catch (error) {
      alert(error.message || 'Failed to create connection');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Placement Status
  const updatePlacementStatus = async (connectionId, status) => {
    if (!window.confirm(`Are you sure you want to update status to "${status}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      
      const result = await apiRequest(`/api/admin/connections/${connectionId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          placement_status: status
        })
      });

      if (result) {
        await fetchData();
        alert('Placement status updated successfully');
      }
    } catch (error) {
      alert(error.message || 'Failed to update placement status');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete handlers
  const handleDelete = async (type, id) => {
    if (userRole !== 'super_admin') {
      alert('Only Super Admin can delete records');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;

    try {
      setActionLoading(true);
      
      const endpoints = {
        'employee': `/api/admin/employees/${id}`,
        'company': `/api/admin/companies/${id}`,
        'job': `/api/admin/job-requests/${id}`,
        'connection': `/api/admin/connections/${id}`
      };

      const result = await apiRequest(endpoints[type], {
        method: 'DELETE'
      });

      if (result) {
        await fetchData();
        alert(`${type} deleted successfully`);
      }
    } catch (error) {
      alert(error.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  // Filter connections based on search term
  const filteredConnections = connections.filter(connection => 
    connection.employee_name?.toLowerCase().includes(connectionSearchTerm.toLowerCase()) ||
    connection.company_name?.toLowerCase().includes(connectionSearchTerm.toLowerCase()) ||
    connection.job_title?.toLowerCase().includes(connectionSearchTerm.toLowerCase()) ||
    connection.employee_phone?.includes(connectionSearchTerm) ||
    connection.placement_status?.toLowerCase().includes(connectionSearchTerm.toLowerCase())
  );

  // Filter placements based on search term
  const filteredPlacements = placements.filter(placement => 
    placement.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Role: {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                disabled={actionLoading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw size={18} className={actionLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'companies', label: 'Companies', icon: Building },
              { id: 'jobs', label: 'Job Requests', icon: Briefcase },
              { id: 'connections', label: 'Connections', icon: Activity },
              { id: 'placements', label: 'Placements', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Employees"
                value={dashboardStats.totalEmployees || 0}
                icon={Users}
                color="bg-blue-500"
              />
              <StatsCard
                title="Active Companies"
                value={dashboardStats.totalCompanies || 0}
                icon={Building}
                color="bg-green-500"
              />
              <StatsCard
                title="Job Requests"
                value={dashboardStats.totalJobRequests || 0}
                icon={Briefcase}
                color="bg-purple-500"
              />
              <StatsCard
                title="Successful Placements"
                value={dashboardStats.totalPlacements || 0}
                icon={CheckCircle}
                color="bg-yellow-500"
              />
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => { 
                      setModalType('addEmployee'); 
                      setShowModal(true); 
                      setFormData({ phone: '+91' }); 
                    }}
                    disabled={actionLoading}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <UserPlus size={18} />
                    <span>Add Employee</span>
                  </button>
                  <button
                    onClick={() => { 
                      setModalType('addCompany'); 
                      setShowModal(true); 
                      setFormData({ contact_person_phone: '+91' }); 
                    }}
                    disabled={actionLoading}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Building2 size={18} />
                    <span>Add Company</span>
                  </button>
                  <button
                    onClick={() => { 
                      setModalType('addJob'); 
                      setShowModal(true); 
                      setFormData({}); 
                    }}
                    disabled={actionLoading}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Plus size={18} />
                    <span>Add Job Request</span>
                  </button>
                  <button
                    onClick={() => { 
                      setModalType('createConnection'); 
                      setShowModal(true); 
                      setFormData({}); 
                    }}
                    disabled={actionLoading}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Activity size={18} />
                    <span>Create Connection</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold mb-4">Recent Connections</h3>
                <div className="space-y-3">
                  {connections.slice(0, 5).map(conn => (
                    <div key={conn.connection_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{conn.employee_name}</p>
                        <p className="text-xs text-gray-600">{conn.job_title}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        conn.placement_status === 'placed' ? 'bg-green-100 text-green-800' :
                        conn.placement_status === 'interview_scheduled' ? 'bg-blue-100 text-blue-800' :
                        conn.placement_status === 'offered' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {conn.placement_status || 'pending'}
                      </span>
                    </div>
                  ))}
                  {connections.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No connections yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Management Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Employee Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { 
                    setModalType('addEmployee'); 
                    setShowModal(true); 
                    setFormData({ phone: '+91' }); 
                  }}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <UserPlus size={18} />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees
                    .filter(emp => emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  emp.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(employee => {
                      const latestConnection = connections
                        .filter(conn => conn.employee_id === employee.employee_id)
                        .sort((a, b) => new Date(b.connection_date) - new Date(a.connection_date))[0];
                      
                      return (
                        <tr key={employee.employee_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                              <div className="text-sm text-gray-500">{employee.qualification}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.phone}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{employee.industry}</div>
                            <div className="text-sm text-gray-500">{employee.preferred_location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {latestConnection ? (
                              <div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  latestConnection.placement_status === 'placed' ? 'bg-green-100 text-green-800' :
                                  latestConnection.placement_status === 'interview_scheduled' ? 'bg-blue-100 text-blue-800' :
                                  latestConnection.placement_status === 'offered' ? 'bg-purple-100 text-purple-800' :
                                  latestConnection.placement_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {latestConnection.placement_status || 'pending'}
                                </span>
                              </div>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(employee);
                                  setModalType('viewEmployee');
                                  setShowModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              {userRole === 'super_admin' && (
                                <button
                                  onClick={() => handleDelete('employee', employee.employee_id)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  title="Delete Employee"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {employees.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No employees found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Company Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { 
                    setModalType('addCompany'); 
                    setShowModal(true); 
                    setFormData({ contact_person_phone: '+91' }); 
                  }}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Building2 size={18} />
                  <span>Add Company</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies
                    .filter(comp => comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   comp.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(company => {
                      const companyJobs = jobRequests.filter(job => job.company_id === company.company_id);
                      
                      return (
                        <tr key={company.company_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-500">{company.location}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{company.contact_person_name}</div>
                            <div className="text-sm text-gray-500">{company.contact_person_phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{company.industry}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(company);
                                  setModalType('viewCompany');
                                  setShowModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              {userRole === 'super_admin' && (
                                <button
                                  onClick={() => handleDelete('company', company.company_id)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  title="Delete Company"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {companies.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No companies found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Jobs Tab - WITH RED BACKGROUND FOR CLOSED STATUS */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Job Request Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { 
                    setModalType('addJob'); 
                    setShowModal(true); 
                    setFormData({}); 
                  }}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Plus size={18} />
                  <span>Add Job Request</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connections</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobRequests
                    .filter(job => job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(job => {
                      const jobConnections = connections.filter(conn => conn.request_id === job.request_id);
                      const placedCount = jobConnections.filter(conn => conn.placement_status === 'placed').length;
                      
                      return (
                        <tr 
                          key={job.request_id}
                          className={job.status === 'closed' ? 'bg-red-50' : ''}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                              <div className="text-sm text-gray-500">{job.domain}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{job.company_name}</div>
                            <div className="text-sm text-gray-500">{job.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{job.salary_range}</div>
                            <div className="text-sm text-gray-500">Count: {job.count}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              job.status === 'closed' ? 'bg-red-100 text-red-800' :
                              job.status === 'open' ? 'bg-green-100 text-green-800' :
                              job.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Total: {jobConnections.length}
                            </div>
                            <div className="text-sm text-gray-500">
                              Placed: {placedCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(job);
                                  setModalType('viewJob');
                                  setShowModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              {userRole === 'super_admin' && (
                                <button
                                  onClick={() => handleDelete('job', job.request_id)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  title="Delete Job Request"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {jobRequests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No job requests found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connections Tab with Search */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Job Connections</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search connections..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={connectionSearchTerm}
                    onChange={(e) => setConnectionSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { 
                    setModalType('createConnection'); 
                    setShowModal(true); 
                    setFormData({}); 
                  }}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  <Plus size={18} />
                  <span>Create Connection</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConnections.map(connection => (
                    <tr key={connection.connection_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{connection.employee_name}</div>
                        <div className="text-sm text-gray-500">{connection.employee_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{connection.job_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{connection.company_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={connection.placement_status || 'pending'}
                          onChange={(e) => updatePlacementStatus(connection.connection_id, e.target.value)}
                          disabled={actionLoading}
                          className="text-xs p-1 border rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="interview_completed">Interview Completed</option>
                          <option value="selected">Selected</option>
                          <option value="offered">Offered</option>
                          <option value="placed">Placed</option>
                          <option value="rejected">Rejected</option>
                          <option value="dropped">Dropped</option>
                          <option value="resigned">Resigned</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItem(connection);
                              setModalType('viewConnection');
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {userRole === 'super_admin' && (
                            <button
                              onClick={() => handleDelete('connection', connection.connection_id)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Connection"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredConnections.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {connectionSearchTerm ? 'No connections match your search' : 'No connections found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UPDATED Placements Tab - With Info Button and Fixed Salary Display */}
        {activeTab === 'placements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Successful Placements</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search placements..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <span className="text-sm text-green-600 font-semibold">
                  Total: {filteredPlacements.length} placements
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placement Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlacements.map(placement => {
                    // Calculate correct salary display
                    const displaySalary = placement.final_salary || placement.offered_salary || 0;
                    
                    return (
                      <tr key={placement.connection_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{placement.employee_name}</div>
                          <div className="text-sm text-gray-500">{placement.employee_phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{placement.job_title}</div>
                          <div className="text-sm text-gray-500">{placement.job_domain}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{placement.company_name}</div>
                          <div className="text-sm text-gray-500">{placement.job_location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {displaySalary > 0 ? `₹${displaySalary.toLocaleString()}` : 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {placement.placement_date ? new Date(placement.placement_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Placed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedItem(placement);
                              setModalType('viewPlacement');
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Placement Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredPlacements.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'No placements match your search' : 'No placements found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {modalType === 'addEmployee' ? 'Add New Employee' :
                   modalType === 'addCompany' ? 'Add New Company' :
                   modalType === 'addJob' ? 'Add Job Request' :
                   modalType === 'createConnection' ? 'Create Job Connection' :
                   modalType === 'viewEmployee' ? 'Employee Details' :
                   modalType === 'viewCompany' ? 'Company Details' :
                   modalType === 'viewJob' ? 'Job Details' :
                   modalType === 'viewPlacement' ? 'Placement Details' :
                   'Connection Details'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                  className="disabled:opacity-50"
                >
                  <X className="text-gray-500" size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Add Employee Modal */}
              {modalType === 'addEmployee' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <div className="flex items-center border rounded-lg">
                        <User className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          onKeyDown={allowOnlyLetters}
                          placeholder="Full Name"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <div className="flex items-center border rounded-lg">
                        <Mail className="text-gray-400 m-2" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          placeholder="Email Address"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <div className="flex items-center border rounded-lg">
                        <Phone className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone || '+91'}
                          onChange={handleInputChange}
                          placeholder="+91XXXXXXXXXX"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <div className="flex items-center border rounded-lg">
                        <Lock className="text-gray-400 m-2" size={18} />
                        <input
                          type="password"
                          name="password"
                          value={formData.password || ''}
                          onChange={handleInputChange}
                          placeholder="Password (min 8 characters)"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <div className="flex items-center border rounded-lg">
                        <FileText className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification || ''}
                          onChange={handleInputChange}
                          placeholder="Qualification"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <div className="flex items-center border rounded-lg">
                        <Cpu className="text-gray-400 m-2" size={18} />
                        <select
                          name="industry"
                          value={formData.industry || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                        >
                          <option value="">Select Industry</option>
                          <option value="IT">IT</option>
                          <option value="Non-IT">Non-IT</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                      <div className="flex items-center border rounded-lg">
                        <MapPin className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="preferred_location"
                          value={formData.preferred_location || ''}
                          onChange={handleInputChange}
                          placeholder="Preferred Location"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Salary (₹)</label>
                      <div className="flex items-center border rounded-lg">
                        <DollarSign className="text-gray-400 m-2" size={18} />
                        <input
                          type="number"
                          name="preferred_salary"
                          value={formData.preferred_salary || ''}
                          onChange={handleInputChange}
                          placeholder="Expected Salary"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                    <div className="flex items-center border rounded-lg">
                      <Code className="text-gray-400 m-2" size={18} />
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills || ''}
                        onChange={handleInputChange}
                        placeholder="React, Node.js, Python, etc."
                        className="w-full p-2 rounded-r-lg focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addEmployee}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Employee'
                    )}
                  </button>
                </div>
              )}

              {/* Add Company Modal */}
              {modalType === 'addCompany' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                      <div className="flex items-center border rounded-lg">
                        <Building className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          placeholder="Company Name"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <div className="flex items-center border rounded-lg">
                        <Mail className="text-gray-400 m-2" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          placeholder="company@example.com"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name *</label>
                      <div className="flex items-center border rounded-lg">
                        <User className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name || ''}
                          onChange={handleInputChange}
                          onKeyDown={allowOnlyLetters}
                          placeholder="Contact Person Name"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <div className="flex items-center border rounded-lg">
                        <Phone className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="contact_person_phone"
                          value={formData.contact_person_phone || '+91'}
                          onChange={handleInputChange}
                          placeholder="+91XXXXXXXXXX"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <div className="flex items-center border rounded-lg">
                        <Lock className="text-gray-400 m-2" size={18} />
                        <input
                          type="password"
                          name="password"
                          value={formData.password || ''}
                          onChange={handleInputChange}
                          placeholder="Password (min 8 characters)"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <div className="flex items-center border rounded-lg">
                        <Cpu className="text-gray-400 m-2" size={18} />
                        <select
                          name="industry"
                          value={formData.industry || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                        >
                          <option value="">Select Industry</option>
                          <option value="IT">IT</option>
                          <option value="Non-IT">Non-IT</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Location</label>
                      <div className="flex items-center border rounded-lg">
                        <MapPin className="text-gray-400 m-2" size={18} />
                        <input
                          type="text"
                          name="location"
                          value={formData.location || ''}
                          onChange={handleInputChange}
                          placeholder="City, State"
                          className="w-full p-2 rounded-r-lg focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={addCompany}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Company'
                    )}
                  </button>
                </div>
              )}

              {/* Add Job Modal */}
              {modalType === 'addJob' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <select
                        name="company_id"
                        value={formData.company_id || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Company</option>
                        {companies.map(comp => (
                          <option key={comp.company_id} value={comp.company_id}>
                            {comp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                      <input
                        type="text"
                        name="domain"
                        value={formData.domain || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                      <select
                        name="employment_type"
                        value={formData.employment_type || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                      <input
                        type="text"
                        name="salary_range"
                        value={formData.salary_range || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 50000-80000"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                      <input
                        type="number"
                        name="count"
                        value={formData.count || 1}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority || 'medium'}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={addJobRequest}
                    disabled={actionLoading}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Adding...' : 'Add Job Request'}
                  </button>
                </div>
              )}

              {/* Create Connection Modal */}
              {modalType === 'createConnection' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Job *</label>
                    <select
                      name="request_id"
                      value={formData.request_id || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose a job...</option>
                      {jobRequests.filter(job => job.status === 'open' || job.status === 'active').map(job => (
                        <option key={job.request_id} value={job.request_id}>
                          {job.title} - {job.company_name} ({job.location})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee *</label>
                    <select
                      name="employee_id"
                      value={formData.employee_id || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose an employee...</option>
                      {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                          {emp.full_name} - {emp.industry} ({emp.preferred_location})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional notes..."
                    />
                  </div>
                  <button
                    onClick={createConnection}
                    disabled={actionLoading}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Creating...' : 'Create Connection'}
                  </button>
                </div>
              )}

              {/* View Employee Modal */}
              {modalType === 'viewEmployee' && selectedItem && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">{selectedItem.full_name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedItem.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedItem.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>
                      <p className="font-medium">{selectedItem.qualification}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="font-medium">{selectedItem.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Preferred Location</p>
                      <p className="font-medium">{selectedItem.preferred_location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Preferred Salary</p>
                      <p className="font-medium">₹{selectedItem.preferred_salary?.toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedItem.skills && selectedItem.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(selectedItem.skills || '[]').map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {skill.skill_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Company Modal */}
              {modalType === 'viewCompany' && selectedItem && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">{selectedItem.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedItem.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{selectedItem.contact_person_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedItem.contact_person_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="font-medium">{selectedItem.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedItem.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company Size</p>
                      <p className="font-medium">{selectedItem.company_size}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* View Job Modal */}
              {modalType === 'viewJob' && selectedItem && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">{selectedItem.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{selectedItem.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Domain</p>
                      <p className="font-medium">{selectedItem.domain}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedItem.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salary Range</p>
                      <p className="font-medium">{selectedItem.salary_range}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Count</p>
                      <p className="font-medium">{selectedItem.count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{selectedItem.status}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700">{selectedItem.description}</p>
                  </div>
                </div>
              )}

              {/* View Connection Modal */}
              {modalType === 'viewConnection' && selectedItem && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Connection Details</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Employee</p>
                      <p className="font-medium">{selectedItem.employee_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Job</p>
                      <p className="font-medium">{selectedItem.job_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{selectedItem.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{selectedItem.placement_status || 'Pending'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Connection Date</p>
                      <p className="font-medium">{new Date(selectedItem.connection_date).toLocaleDateString()}</p>
                    </div>
                    {selectedItem.placement_date && (
                      <div>
                        <p className="text-sm text-gray-500">Placement Date</p>
                        <p className="font-medium">{new Date(selectedItem.placement_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedItem.final_salary && (
                      <div>
                        <p className="text-sm text-gray-500">Final Salary</p>
                        <p className="font-medium">₹{selectedItem.final_salary.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedItem.admin_notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="font-medium">{selectedItem.admin_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NEW View Placement Modal */}
              {modalType === 'viewPlacement' && selectedItem && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Placement Details</h4>
                  
                  {/* Employee Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Employee Information</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedItem.employee_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedItem.employee_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedItem.employee_email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Job Information */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Job Information</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{selectedItem.job_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Domain</p>
                        <p className="font-medium">{selectedItem.job_domain || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Employment Type</p>
                        <p className="font-medium">{selectedItem.employment_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{selectedItem.job_location}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Information */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">Company Information</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Company Name</p>
                        <p className="font-medium">{selectedItem.company_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Industry</p>
                        <p className="font-medium">{selectedItem.company_industry || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Placement Details */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">Placement Details</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Final Salary</p>
                        <p className="font-medium text-green-600">
                          {(selectedItem.final_salary || selectedItem.offered_salary) > 0 
                            ? `₹${(selectedItem.final_salary || selectedItem.offered_salary).toLocaleString()}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Placement Date</p>
                        <p className="font-medium">
                          {selectedItem.placement_date ? new Date(selectedItem.placement_date).toLocaleDateString() : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Joining Date</p>
                        <p className="font-medium">
                          {selectedItem.joining_date ? new Date(selectedItem.joining_date).toLocaleDateString() : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Connection Date</p>
                        <p className="font-medium">
                          {selectedItem.connection_date ? new Date(selectedItem.connection_date).toLocaleDateString() : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Notes */}
                  {selectedItem.admin_notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Admin Notes</h5>
                      <p className="text-sm text-gray-700">{selectedItem.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
