import React, { useEffect, useMemo, useState } from "react";
import Card from "components/card";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdPendingActions,
  MdNavigateNext,
  MdNavigateBefore,
} from "react-icons/md";

const BASE_URL = "http://127.0.0.1:5000";

export default function ContributorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const adminId = Number(localStorage.getItem("user_id"));
  const itemsPerPage = 5;
  const location = useLocation();

  const searchText = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("search") || "").trim().toLowerCase();
  }, [location.search]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const res = await axios.get(
        `${BASE_URL}/contributorRequests/getContributorRequests`
      );

      setRequests(res.data.requests || []);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || "Failed to load contributor requests",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const filteredRequests = useMemo(() => {
    if (!searchText) return requests;

    return requests.filter((req) => {
      return (
        req.user_name?.toLowerCase().includes(searchText) ||
        req.user_email?.toLowerCase().includes(searchText) ||
        req.status?.toLowerCase().includes(searchText) ||
        "contributor".includes(searchText) ||
        req.request_id?.toString().includes(searchText)
      );
    });
  }, [requests, searchText]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / itemsPerPage)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const paginatedData = useMemo(() => {
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, startIndex]);

  const formatDate = (value) => {
    if (!value) return "-";

    try {
      const date = new Date(value);
      return date.toLocaleDateString();
    } catch {
      return value;
    }
  };

  const formatStatus = (status) => {
    if (!status) return "-";
    return status.toUpperCase();
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
    }
    if (status === "rejected") {
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-green-200";
    }
    if (status === "revoked") {
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const updateRequestInState = (updatedRequest) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.request_id === updatedRequest.request_id ? updatedRequest : req
      )
    );
  };

  const ensureAdminId = () => {
    if (!adminId) {
      setMessage({
        type: "error",
        text: "Admin id not found. Please login again.",
      });
      return false;
    }
    return true;
  };

  const handleApprove = async (requestId) => {
    if (!ensureAdminId()) return;

    try {
      setActionLoadingId(requestId);
      setMessage(null);

      const res = await axios.put(
        `${BASE_URL}/contributorRequests/approveContributorRequest`,
        {
          request_id: requestId,
          reviewed_by: adminId,
          remarks: "Approved by admin",
        }
      );

      if (res.data.request) {
        updateRequestInState(res.data.request);
      }

      setMessage({
        type: "success",
        text: res.data.message || "Contributor request approved successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || "Failed to approve contributor request",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!ensureAdminId()) return;

    try {
      setActionLoadingId(requestId);
      setMessage(null);

      const res = await axios.put(
        `${BASE_URL}/contributorRequests/rejectContributorRequest`,
        {
          request_id: requestId,
          reviewed_by: adminId,
          remarks: "Rejected by admin",
        }
      );

      if (res.data.request) {
        updateRequestInState(res.data.request);
      }

      setMessage({
        type: "success",
        text: res.data.message || "Contributor request rejected successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || "Failed to reject contributor request",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (requestId) => {
    if (!ensureAdminId()) return;

    try {
      setActionLoadingId(requestId);
      setMessage(null);

      const res = await axios.put(
        `${BASE_URL}/contributorRequests/revokeContributorRequest`,
        {
          request_id: requestId,
          reviewed_by: adminId,
          remarks: "Contributor access revoked by admin",
        }
      );

      if (res.data.request) {
        updateRequestInState(res.data.request);
      }

      setMessage({
        type: "success",
        text: res.data.message || "Contributor request revoked successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message || "Failed to revoke contributor request",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="mt-6">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Contributor Requests
        </h2>

        {message && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading contributor requests...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((req, index) => {
                  const isPending = req.status === "pending";
                  const isApproved = req.status === "approved";
                  const isRowLoading = actionLoadingId === req.request_id;

                  return (
                    <tr
                      key={req.request_id}
                      className="border-b text-sm text-gray-800 hover:bg-gray-50 dark:text-white dark:hover:bg-navy-700"
                    >
                      <td className="py-4">{startIndex + index + 1}</td>

                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <MdPerson />
                          <span>{req.user_name || "-"}</span>
                        </div>
                      </td>

                      <td>{req.user_email || "-"}</td>

                      <td>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                          CONTRIBUTOR
                        </span>
                      </td>

                      <td>
                        <span
                          className={`flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs ${getStatusBadge(
                            req.status
                          )}`}
                        >
                          <MdPendingActions />
                          {formatStatus(req.status)}
                        </span>
                      </td>

                      <td>{formatDate(req.requested_at)}</td>

                      <td className="text-center">
                        <div className="flex justify-center gap-3">
                          {isPending && (
                            <>
                              <button
                                title="Approve"
                                onClick={() => handleApprove(req.request_id)}
                                disabled={isRowLoading}
                                className="text-green-600 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <MdCheckCircle size={22} />
                              </button>

                              <button
                                title="Reject"
                                onClick={() => handleReject(req.request_id)}
                                disabled={isRowLoading}
                                className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <MdCancel size={22} />
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              title="Revoke"
                              onClick={() => handleRevoke(req.request_id)}
                              disabled={isRowLoading}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Revoke
                            </button>
                          )}

                          {!isPending && !isApproved && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No contributor requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-4">
          <button
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 dark:text-gray-300"
          >
            <MdNavigateBefore /> Prev
          </button>

          <span className="text-sm text-gray-700 dark:text-white">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 dark:text-gray-300"
          >
            Next <MdNavigateNext />
          </button>
        </div>
      </Card>
    </div>
  );
}