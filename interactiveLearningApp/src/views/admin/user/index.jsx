import React, { useEffect, useState, useMemo } from "react";
import Card from "components/card";
import { MdPerson, MdSecurity, MdEdit } from "react-icons/md";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();

  const searchText = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("search") || "").trim().toLowerCase();
  }, [location.search]);

  useEffect(() => {
    fetchUsers();
  }, []);

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

      const res = await axios.get("http://127.0.0.1:5000/users/getUsers", {
        headers,
      });

      setUsers(res.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-GB");
  };

  const filteredUsers = useMemo(() => {
    if (!searchText) return users;

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.role?.toLowerCase().includes(searchText) ||
        user.authprovider?.toLowerCase().includes(searchText) ||
        user.id?.toString().includes(searchText)
      );
    });
  }, [users, searchText]);

  return (
    <div className="mt-6">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          User Management
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Auth Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Created At
                </th>
                {/* <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th> */}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b text-sm text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-navy-700"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-white">
                      <div className="flex items-center gap-2">
                        <MdPerson />
                        {user.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-800 dark:text-white">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                        {user.role?.toUpperCase() || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {user.authprovider?.toUpperCase() || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-800 dark:text-white">
                      {formatDate(user.created_at)}
                    </td>

                    {/* <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          title="Change Role"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <MdSecurity size={20} />
                        </button>
                        <button
                          title="Edit User"
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                        >
                          <MdEdit size={20} />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}