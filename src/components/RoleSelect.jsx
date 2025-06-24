import React from 'react';

export default function RoleSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
    >
      <option value="">Select Role</option>
      <option value="employee">Employee</option>
      <option value="company">Employer</option>
    </select>
  );
}