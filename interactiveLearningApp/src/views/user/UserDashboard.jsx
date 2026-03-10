import React, { useEffect, useState } from "react";
import axios from "axios";
import DomainCard from "./components/DomainCard";
import SubjectCard from "./components/SubjectCard";
import QuestionCard from "./components/QuestionCard";

export default function UserDashboard() {
  const [domains, setDomains] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newQuestions, setNewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  /* ================= FETCH DASHBOARD DATA ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [domainsRes, subjectsRes, questionsRes] = await Promise.all([
          axios.get("http://127.0.0.1:5000/domains/getDomain", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:5000/subjects/getSubjects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:5000/questions/getQuestions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDomains(
          (domainsRes.data.domains || []).map((d) => ({
            id: d.domain_id,
            name: d.domain_name,
          }))
        );

        setSubjects(
          (subjectsRes.data.subjects || []).map((s) => ({
            id: s.subject_id,
            name: s.subject_name,
            questions: s.topics_count || 0,
          }))
        );

        setNewQuestions(
          (questionsRes.data.questions || []).map((q) => ({
            id: q.question_id,
            title: q.question_string,
            subject:
              q.topics?.length > 0 ? q.topics[0].subject_name : "General",
          }))
        );
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  /* ================= SEND CONTRIBUTOR REQUEST ================= */

  const handleSendRequest = async () => {
    console.log("SEND BUTTON CLICKED");

    if (!remark.trim()) {
      console.log("Remark empty");
      return;
    }

    try {
      setSending(true);

      let userId = null;
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("USER OBJECT:", user);
        userId = user?.id || user?.user_id;
      }

      /* fallback if user not stored */
      if (!userId) {
        console.warn("User not found in localStorage, using fallback userId=1");
        userId = 1;
      }

      console.log("USER ID:", userId);

      const res = await axios.post(
        "http://127.0.0.1:5000/contributorRequests/addContributorRequest",
        {
          user_id: userId,
          remarks: remark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API RESPONSE:", res.data);

      setMessage(res.data.message);
      setRemark("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("REQUEST ERROR:", err.response?.data);
      setMessage(err.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

        {/* Contributor Request Panel */}

        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Become a Contributor
          </h2>

          <p className="text-gray-700 mb-4">
            Submit a request to gain contributor access and help improve the
            platform.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Request Contributor Access
          </button>

          {message && (
            <p className="text-gray-900 mt-4 font-medium">{message}</p>
          )}
        </section>

        {/* Domains */}

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Explore Domains
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        </section>

        {/* Subjects */}

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Active Subjects
          </h2>

          {subjects.length === 0 ? (
            <p className="text-gray-500 italic">No subjects available.</p>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-2">
              {subjects.map((sub) => (
                <div key={sub.id} className="min-w-[260px] flex-shrink-0">
                  <SubjectCard subject={sub} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest Questions */}

        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Latest Questions
            </h2>

            <button className="text-sm font-semibold text-purple-600 hover:text-purple-800">
              See All
            </button>
          </div>

          {newQuestions.length === 0 ? (
            <p className="text-gray-500 italic">No questions available.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
              {newQuestions.slice(0, 12).map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
          )}
        </section>

        {/* Modal */}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Request Contributor Access
                </h2>

                <p className="text-gray-700 mt-2 text-sm">
                  Tell us why you want to become a contributor.
                </p>
              </div>

              <textarea
                placeholder="Enter your reason..."
                value={remark}
                onChange={(e) => {
                  console.log("TEXT:", e.target.value);
                  setRemark(e.target.value);
                }}
                rows={5}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <div className="flex justify-end gap-4">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={sending}
                  className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Request"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}