import { useState } from "react";
import { API_BASE_URL } from '../config/api'; 
const Register = () => {
  const [type, setType] = useState(""); // Candidate or Employer
  const [employerStatus, setEmployerStatus] = useState(""); // New or Existing
  const [showJobFields, setShowJobFields] = useState(false);
  const [showEmployerFields, setShowEmployerFields] = useState(false);
  const [loginValid, setLoginValid] = useState(false);

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setType(val);
    setShowJobFields(val === "Need a job");
    setShowEmployerFields(val === "Need a candidate");
    setEmployerStatus("");
    setLoginValid(false);
  };

  const handleEmployerStatusChange = (e) => {
    setEmployerStatus(e.target.value);
    setLoginValid(false);
  };

  const validateLogin = () => {
    // Replace with real validation
    const userId = document.getElementById("userId").value.trim();
    const password = document.getElementById("userPassword").value.trim();
    if (userId === "admin" && password === "1234") {
      alert("Login Successful");
      setLoginValid(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Submitted. Connect this to your server.");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl text-center font-semibold mb-6">
        Employer / Job Seeker Registration
      </h2>
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <label className="block font-semibold">Name</label>
        <input
          type="text"
          required
          className="w-full p-2 mt-1 border rounded"
        />

        <label className="block font-semibold mt-4">Email</label>
        <input
          type="email"
          required
          className="w-full p-2 mt-1 border rounded"
        />

        <label className="block font-semibold mt-4">Mobile</label>
        <input
          type="text"
          required
          pattern="[0-9]+"
          className="w-full p-2 mt-1 border rounded"
        />

        <label className="block font-semibold mt-4">You Are</label>
        <select
          required
          value={type}
          onChange={handleTypeChange}
          className="w-full p-2 mt-1 border rounded"
        >
          <option value="">Select</option>
          <option value="Need a candidate">Need a candidate (Employer)</option>
          <option value="Need a job">Need a job (Candidate)</option>
        </select>

        {/* Employer Section */}
        {showEmployerFields && (
          <>
            <label className="block font-semibold mt-4">
              Are you a new or existing employer?
            </label>
            <select
              value={employerStatus}
              onChange={handleEmployerStatusChange}
              className="w-full p-2 mt-1 border rounded"
            >
              <option value="">Select</option>
              <option value="New">New</option>
              <option value="Existing">Existing</option>
            </select>

            {employerStatus === "Existing" && (
              <>
                <label className="block mt-4">User ID</label>
                <input
                  type="text"
                  id="userId"
                  className="w-full p-2 mt-1 border rounded"
                />

                <label className="block mt-4">Password</label>
                <input
                  type="password"
                  id="userPassword"
                  className="w-full p-2 mt-1 border rounded"
                />

                <button
                  type="button"
                  onClick={validateLogin}
                  className="bg-blue-600 text-white w-full mt-4 p-2 rounded"
                >
                  Validate Login
                </button>
              </>
            )}

            {employerStatus === "New" && (
              <>
                <label className="block mt-4">Designation</label>
                <input type="text" className="w-full p-2 mt-1 border rounded" />

                <label className="block mt-4">Company Name</label>
                <input type="text" className="w-full p-2 mt-1 border rounded" />

                <label className="block mt-4">Upload Agreement</label>
                <input type="file" className="w-full p-2 mt-1 border rounded" />
              </>
            )}

            {loginValid && (
              <>
                <label className="block mt-4">Job Role Required</label>
                <input type="text" className="w-full p-2 mt-1 border rounded" />

                <label className="block mt-4">Vacancies</label>
                <input type="number" className="w-full p-2 mt-1 border rounded" />

                <label className="block mt-4">Gender Preference</label>
                <select className="w-full p-2 mt-1 border rounded">
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <label className="block mt-4">Salary Range</label>
                <input type="text" className="w-full p-2 mt-1 border rounded" />

                <label className="block mt-4">Job Location</label>
                <input type="text" className="w-full p-2 mt-1 border rounded" />

                <label className="block mt-4">Work Timing</label>
                <input type="text" className="w-full p-2 mt-1 border rounded" />

                <label className="block mt-4">Other Details</label>
                <textarea className="w-full p-2 mt-1 border rounded" />
              </>
            )}
          </>
        )}

        {/* Job Seeker Section */}
        {showJobFields && (
          <>
            <label className="block mt-4">Qualification</label>
            <input type="text" className="w-full p-2 mt-1 border rounded" />

            <label className="block mt-4">Domain</label>
            <input type="text" className="w-full p-2 mt-1 border rounded" />

            <label className="block mt-4">Preferred Location</label>
            <input type="text" className="w-full p-2 mt-1 border rounded" />

            <label className="block mt-4">Preferred Salary</label>
            <input type="text" className="w-full p-2 mt-1 border rounded" />

            <label className="block mt-4">Skills</label>
            <textarea className="w-full p-2 mt-1 border rounded" />

            <label className="block mt-4">Upload Resume</label>
            <input type="file" className="w-full p-2 mt-1 border rounded" />
          </>
        )}

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white w-full mt-6 p-3 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Register;
