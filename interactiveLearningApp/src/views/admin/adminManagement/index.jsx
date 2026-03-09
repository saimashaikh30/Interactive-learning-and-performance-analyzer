import React, { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "./UserTable";

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("userId"), 10);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:5000/users/getUsers");
      // Exclude current superadmin
      const filtered = res.data.users.filter(u => u.id !== currentUserId);
      setUsers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (user, newRole) => {
    try {
      await axios.put(`http://127.0.0.1:5000/users/changeRole/${user.id}`, {
        role: newRole
      });
      fetchUsers(); // Refresh table
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => !filterRole || u.role === filterRole);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2"><br></br>
      <br/>
      <br/>
        <label className="text-sm font-medium text-gray-900">Filter by Role:</label>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded border border-gray-300 px-2 text-gray-900 py-1 text-sm"
        >
          <option value="" className="text-gray-700">All</option>
          <option value="user" className="text-gray-700">User</option>
          <option value="admin" className="text-gray-700">Admin</option>
        </select>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        onRoleChange={handleRoleChange}
        currentUserId={currentUserId}
      />

      {/* Pagination placeholder */}
      {/* <div className="flex justify-center mt-4 gap-2">
        <button className="px-3 py-1 border rounded hover:bg-gray-100">&lt;</button>
        <button className="px-3 py-1 border rounded bg-blue-500 text-white">1</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-100">&gt;</button>
      </div> */}
    </div>
  );
};

export default AdminManagement;