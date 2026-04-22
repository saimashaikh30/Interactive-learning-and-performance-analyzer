import React, { useState } from "react";
import axios from "axios";

export default function ContributorRequestCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleSendRequest = async () => {
    if (!remark.trim()) return;

    try {
      setSending(true);

      // ✅ FIX: ALWAYS use this
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        setMessage("User not found. Please login again.");
        return;
      }

      const res = await axios.post(
        "http://127.0.0.1:5000/contributorRequests/addContributorRequest",
        {
          user_id: parseInt(userId), // ✅ ensure number
          remarks: remark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(res.data.message);
      setRemark("");
      setIsModalOpen(false);

    } catch (err) {
      console.error(err);

      if (err.response?.status === 409) {
        setMessage("You already have a pending request ⏳");
      } else if (err.response?.status === 404) {
        setMessage("User not found. Please login again.");
      } else {
        setMessage(err.response?.data?.message || "Failed to send request");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* ── Card ── */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
          Contribute
        </span>

        <h2 className="text-2xl font-bold text-white mb-2">
          Become a Contributor
        </h2>

        <p className="text-blue-100 text-sm max-w-md mb-5">
          Submit a request to gain contributor access and help improve the platform.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-blue-700 font-semibold px-7 py-2.5 rounded-lg hover:bg-blue-50 transition shadow text-sm"
        >
          Request Contributor Access
        </button>

        {message && (
          <p className="text-blue-100 mt-4 text-sm font-medium">
            {message}
          </p>
        )}
      </section>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                Request Contributor Access
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Tell us why you want to become a contributor.
              </p>
            </div>

            <textarea
              placeholder="Enter your reason..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-blue-50/50"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSendRequest}
                disabled={sending || !remark.trim()}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50 transition"
              >
                {sending ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}