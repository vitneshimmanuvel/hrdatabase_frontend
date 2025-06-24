import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobRequests: 0,
    totalAdminConnections: 0,
    totalJoinRequests: 0
  });
  const [jobRequests, setJobRequests] = useState([]);
  const [connectedEmployees, setConnectedEmployees] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:3000/api/admin/dashboard-stats', { headers });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch job requests
      const jobsResponse = await fetch('http://localhost:3000/api/admin/job-requests', { headers });
      const jobsData = await jobsResponse.json();
      setJobRequests(jobsData);

      // Fetch connected employees
      const employeesResponse = await fetch('http://localhost:3000/api/admin/connected-employees', { headers });
      const employeesData = await employeesResponse.json();
      setConnectedEmployees(employeesData);

      // Fetch join requests
      const joinResponse = await fetch('http://localhost:3000/api/admin/join-requests', { headers });
      const joinData = await joinResponse.json();
      setJoinRequests(joinData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Job Requests</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalJobRequests}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Admin Connections</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalAdminConnections}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Join Requests</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalJoinRequests}</dd>
            </div>
          </div>
        </div>

        {/* Job Requests Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Active Job Requests</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobRequests.map((job) => (
                    <tr key={job.request_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.domain}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Connected Employees Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Connected Employees</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connectedEmployees.map((employee) => (
                    <tr key={employee.connection_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.employee_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.job_title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(employee.connection_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Join Requests Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Pending Join Requests</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {joinRequests.map((request) => (
                    <tr key={request.connection_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.employee_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.job_title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 