import React, { useEffect, useState } from "react";
import axios from "axios";
import ContributorRequestCard from "./components/ContributorRequestCard";

const BASE_URL = "http://127.0.0.1:5000";

export default function UserDashboard() {
  const [questions, setQuestions] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingMyQuestions, setLoadingMyQuestions] = useState(false);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("id");

  const role =
    localStorage.getItem("role") ||
    localStorage.getItem("user_role");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const res = await axios.get(`${BASE_URL}/questions/getQuestions`);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.log("Error fetching questions:", err.response?.data || err.message);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/users/getProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user || null);
      } catch (err) {
        console.log("Error fetching profile:", err.response?.data || err.message);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const effectiveRole = (user?.role || role || "").toLowerCase();
    const effectiveUserId = user?.id || userId;

    if (effectiveRole !== "contributor" || !effectiveUserId) return;

    const fetchMyQuestions = async () => {
      try {
        setLoadingMyQuestions(true);

        const res = await axios.get(
          `${BASE_URL}/questions/getQuestionsByCreator/${effectiveUserId}`
        );

        setMyQuestions(res.data.questions || []);
      } catch (err) {
        console.log(
          "Error fetching contributor questions:",
          err.response?.data || err.message
        );
      } finally {
        setLoadingMyQuestions(false);
      }
    };

    fetchMyQuestions();
  }, [user, role, userId]);

  const effectiveRole = (user?.role || role || "").toLowerCase();
  const isContributor = effectiveRole === "contributor";

  return (
    <div className="space-y-6 !text-gray-800">
      {!isContributor && <ContributorRequestCard />}

      {isContributor ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-gray-900">
            My Added Questions
          </h2>

          {loadingMyQuestions ? (
            <p className="text-sm text-gray-600">Loading your questions...</p>
          ) : myQuestions.length > 0 ? (
            <div className="space-y-2">
              {myQuestions.slice(0, 6).map((q) => (
                <div
                  key={q.question_id}
                  className="p-3 rounded-lg hover:bg-slate-50 border border-slate-100 bg-white"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {q.question_string}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {q.type_name || "Question"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              You have not added any questions yet.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-gray-900">
            Recent Questions
          </h2>

          {loadingQuestions ? (
            <p className="text-sm text-gray-600">Loading questions...</p>
          ) : questions.length > 0 ? (
            <div className="space-y-2">
              {questions.slice(0, 6).map((q) => (
                <div
                  key={q.question_id}
                  className="p-3 rounded-lg hover:bg-slate-50 border border-slate-100 bg-white"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {q.question_string}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No questions found.</p>
          )}
        </div>
      )}
    </div>
  );
}