import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import UserTable from "./UserTable";

const BASE_URL = "http://127.0.0.1:5000";

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();

  const currentUserId = Number(
    localStorage.getItem("user_id") || localStorage.getItem("userId")
  );

  const searchText = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("search") || "").trim().toLowerCase();
  }, [location.search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const res = await axios.get(`${BASE_URL}/users/getUsers`, { headers });

      const allUsers = res.data?.users || [];

      const filteredCurrentUser = allUsers.filter(
        (user) => user.id !== currentUserId
      );

      setUsers(filteredCurrentUser);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user, newRole) => {
    try {
      setError("");

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      await axios.put(
        `${BASE_URL}/users/changeRole/${user.id}`,
        { role: newRole },
        { headers }
      );

      fetchUsers();
    } catch (err) {
      console.error("Error changing role:", err);
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = !filterRole || user.role === filterRole;

      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.role?.toLowerCase().includes(searchText) ||
        user.authprovider?.toLowerCase().includes(searchText) ||
        user.id?.toString().includes(searchText);

      return matchesRole && matchesSearch;
    });
  }, [users, filterRole, searchText]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-900">
            Filter by Role:
          </label>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
          >
            <option value="">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="contributor">Contributor</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white px-4 py-10 text-center text-gray-500 shadow-sm">
          Loading users...
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onRoleChange={handleRoleChange}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default AdminManagement;