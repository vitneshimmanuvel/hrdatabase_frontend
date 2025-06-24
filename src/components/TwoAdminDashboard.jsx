import React, { useEffect, useState } from "react";

const TwoAdminDashboard = () => {
  const [jobRequests, setJobRequests] = useState([]);
  const [adminConnectedEmployees, setAdminConnectedEmployees] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [stats, setStats] = useState({
    totalJobRequests: 0,
    totalAdminConnections: 0,
    totalJoinRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Define endpoints
        const endpoints = [
          '/api/admin/job-requests',
          '/api/admin/connected-employees',
          '/api/admin/join-requests',
          '/api/admin/dashboard-stats'
        ];

        // Fetch all data concurrently
        const responses = await Promise.all(
          endpoints.map(endpoint => 
            fetch(endpoint, { headers })
              .then(response => {
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  return response.text().then(text => {
                    throw new Error(`Invalid content-type: ${contentType}. Response: ${text.substring(0, 100)}`);
                  });
                }
                return response.json();
              })
          )
        );

        // Extract data from responses
        const [jobData, connData, joinData, statsData] = responses;

        setJobRequests(jobData || []);
        setAdminConnectedEmployees(connData || []);
        setJoinRequests(joinData || []);
        setStats(statsData || {
          totalJobRequests: 0,
          totalAdminConnections: 0,
          totalJoinRequests: 0
        });
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 w-screen h-screen grid-rows-6 gap-2 bg-gray-100 p-4">
      {/* Column 1: Company Job Requests with Interview Dates */}
      <div className="bg-white shadow-lg rounded-lg col-span-2 row-span-5 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Active Job Requests</h2>
        <div className="space-y-3">
          {jobRequests.map((request) => (
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

      {/* Column 2: Employees Connected by Admin */}
      <div className="bg-white shadow-lg rounded-lg col-start-3 col-span-2 row-span-5 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Admin Connected Employees</h2>
        <div className="space-y-3">
          {adminConnectedEmployees.map((conn) => (
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

      {/* Column 3: People Wanting to Join */}
      <div className="bg-white shadow-lg rounded-lg col-start-5 col-span-2 row-span-5 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Employee Join Requests</h2>
        <div className="space-y-3">
          {joinRequests.map((conn) => (
            <div
              key={conn.connection_id}
              className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg"
            >
              <h3 className="font-semibold text-gray-800">{conn.employee_name}</h3>
              <p className="text-sm text-gray-600 mt-1">Interested in: {conn.job_title}</p>
              <div className="flex justify-between mt-2 text-xs">
                <span className="flex items-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
      <div className="bg-white shadow-lg rounded-lg col-span-6 row-start-6 p-4 flex items-center justify-between">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalJobRequests}</div>
          <div className="text-sm text-gray-500">Total Job Requests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalAdminConnections}</div>
          <div className="text-sm text-gray-500">Admin Connections</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalJoinRequests}</div>
          <div className="text-sm text-gray-500">Join Requests</div>
        </div>
      </div>
    </div>
  );
};

export default TwoAdminDashboard;