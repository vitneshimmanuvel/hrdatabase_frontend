import { Link } from 'react-router-dom';  
import { API_BASE_URL } from '../config/api';   
const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md p-6 bg-white border border-gray-300 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="mb-4">You do not have permission to access this resource.</p>
        <Link to="/login" className="text-blue-500 hover:text-blue-700">Go to Login</Link>
      </div>
    </div>
  );
};
export default Unauthorized;