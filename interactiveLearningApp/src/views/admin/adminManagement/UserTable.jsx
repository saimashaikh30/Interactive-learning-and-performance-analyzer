import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const UserTable = ({ users, onRoleChange, currentUserId }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter out superadmins and optionally the current logged-in superadmin
  const visibleUsers = users.filter(
    (u) => u.role !== "superadmin" && u.id !== currentUserId
  );

  // Handle role dropdown click
  const handleRoleSelect = (user, newRole) => {
    if (user.role === newRole) return;
    setSelectedUser({ ...user, newRole });
  };

  // Confirm role change
  const handleConfirm = async () => {
    if (!selectedUser) return;
    setLoading(true);
    await onRoleChange(selectedUser, selectedUser.newRole);
    setLoading(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="overflow-x-auto border bg-white rounded-lg">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {visibleUsers.length > 0 ? (
              visibleUsers.map((user) => (
                <tr key={user.id} className="border-b bg-white">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleSelect(user, e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!selectedUser}
        title="Change Role"
        message={`Are you sure you want to change role of ${selectedUser?.name} to ${selectedUser?.newRole}?`}
        onClose={() => setSelectedUser(null)}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
};

export default UserTable;