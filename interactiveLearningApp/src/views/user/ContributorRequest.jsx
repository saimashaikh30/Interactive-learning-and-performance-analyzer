import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ContributorRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id"); // ✅ get user_id

  // Fetch user's requests
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:5000/contributorRequests/getContributorRequests"
      );

      // ✅ filter only current user's requests
      const filtered = res.data.requests.filter(
        (r) => String(r.user_id) === String(userId)
      );

      setRequests(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Submit a contributor request
  const handleRequest = async () => {
    try {
      if (!token || !userId) {
        setMessage("Please login first");
        return;
      }

      const res = await axios.post(
        "http://127.0.0.1:5000/contributorRequests/addContributorRequest",
        {
          user_id: parseInt(userId), // ✅ REQUIRED
          remarks: "",               // optional
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Request submitted successfully!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to submit request.");
    }
  };

  // check if already pending
  const hasPending = requests.some((r) => r.status === "pending");

  return (
    <div className="flex flex-col space-y-8">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-gray-800">Contributor Access</h1>

      {/* Request Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-3xl">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">
            Become a Contributor
          </h2>
          <p className="text-gray-500 mt-1">
            Request access to create questions and contribute to the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRequest}
          disabled={hasPending}
          className={`mt-3 md:mt-0 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition ${
            hasPending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          }`}
        >
          {hasPending ? "Request Pending" : "Request Access"}
        </button>
      </div>

      {message && (
        <div className="max-w-3xl bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-md shadow">
          {message}
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Your Requests
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No requests submitted yet.</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-gray-700">Request ID</th>
                <th className="px-6 py-3 border-b text-gray-700">Status</th>
                <th className="px-6 py-3 border-b text-gray-700">
                  Requested On
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.request_id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 border-b">{req.request_id}</td>
                  <td className="px-6 py-3 border-b">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3 border-b">
                    {new Date(req.requested_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}