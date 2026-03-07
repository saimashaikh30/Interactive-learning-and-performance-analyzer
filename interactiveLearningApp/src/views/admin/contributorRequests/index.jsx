import React, { useState } from "react";
import Card from "components/card";
import {
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdPendingActions,
  MdNavigateNext,
  MdNavigateBefore,
} from "react-icons/md";

const initialRequests = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    requested_role: "CONTRIBUTOR",
    status: "PENDING",
    requested_at: "2026-02-21",
  },
  {
    id: 2,
    name: "Anjali Patel",
    email: "anjali@gmail.com",
    requested_role: "CONTRIBUTOR",
    status: "PENDING",
    requested_at: "2026-02-22",
  },
  {
    id: 3,
    name: "Karan Mehta",
    email: "karan@gmail.com",
    requested_role: "CONTRIBUTOR",
    status: "PENDING",
    requested_at: "2026-02-23",
  },
];

export default function ContributorRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 2;
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = requests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const updateStatus = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
  };

  const getStatusBadge = (status) => {
    if (status === "APPROVED")
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
    if (status === "REJECTED")
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
  };

  return (
    <div className="mt-6">
      <Card className="p-6">
        {/* Header */}
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Contributor Requests
        </h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500 dark:text-gray-400">
                <th className="py-3 text-left">SR No.</th>
                <th className="text-left">User</th>
                <th className="text-left">Email</th>
                <th className="text-left">Requested Role</th>
                <th className="text-left">Status</th>
                <th className="text-left">Requested At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((req, index) => (
                <tr
                  key={req.id}
                  className="border-b text-sm text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700"
                >
                  {/* SR NO */}
                  <td className="py-4">
                    {startIndex + index + 1}
                  </td>

                  {/* Name */}
                  <td className="flex items-center gap-2">
                    <MdPerson />
                    {req.name}
                  </td>

                  {/* Email */}
                  <td>{req.email}</td>

                  {/* Role */}
                  <td>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                      {req.requested_role}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      <MdPendingActions />
                      {req.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td>{req.requested_at}</td>

                  {/* Actions */}
                  <td className="text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        title="Approve"
                        onClick={() => updateStatus(req.id, "APPROVED")}
                        disabled={req.status !== "PENDING"}
                        className="text-green-600 hover:text-green-800 disabled:opacity-40"
                      >
                        <MdCheckCircle size={22} />
                      </button>

                      <button
                        title="Reject"
                        onClick={() => updateStatus(req.id, "REJECTED")}
                        disabled={req.status !== "PENDING"}
                        className="text-red-600 hover:text-red-800 disabled:opacity-40"
                      >
                        <MdCancel size={22} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-end gap-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            <MdNavigateBefore /> Prev
          </button>

          <span className="text-sm text-gray-700 dark:text-white">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            Next <MdNavigateNext />
          </button>
        </div>
      </Card>
    </div>
  );
}