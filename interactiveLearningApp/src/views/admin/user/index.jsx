import React from "react";
import Card from "components/card";
import { MdPerson, MdSecurity, MdEdit } from "react-icons/md";

const users = [
  {
    id: 1,
    name: "Preksha Arya",
    email: "preksha@gmail.com",
    role: "USER",
    authprovider: "GOOGLE",
    created_at: "2026-02-20",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    role: "CONTRIBUTOR",
    authprovider: "EMAIL",
    created_at: "2026-02-21",
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@gmail.com",
    role: "ADMIN",
    authprovider: "EMAIL",
    created_at: "2026-02-18",
  },
];

export default function UserManagement() {
  return (
    <div className="mt-6">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          User Management
        </h2>

        <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Auth Provider</th>
                <th>Created At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700"
                >
                  {/* User */}
                  <td className="py-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <MdPerson />
                    {user.name}
                  </td>

                  {/* Email */}
                  <td className="text-gray-800 dark:text-white">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                      {user.role}
                    </span>
                  </td>

                  {/* Auth Provider */}
                  <td>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {user.authprovider}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="text-gray-800 dark:text-white">
                    {user.created_at}
                  </td>

                  {/* Actions */}
                  <td className="text-center">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}