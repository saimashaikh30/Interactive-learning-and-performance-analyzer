import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

const Questions = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/questions/getQuestionsByCreator/${userId}`
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (level) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          My Questions
        </h1>

        <br />

        <button
          onClick={() => navigate("/user/addQuestion")}
          className="w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          + Add Question
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="mt-10 text-center text-gray-500">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="mt-16 text-center text-gray-500">
          <p className="text-lg font-medium">No questions found</p>
          <p className="text-sm mt-1">
            Start contributing by clicking “Add Question”
          </p>
        </div>
      ) : (

        /* TABLE WRAPPER */
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow">

          <table className="w-full min-w-[800px]">

            {/* TABLE HEADER */}
            <thead className="bg-gray-100 text-left text-sm text-gray-600">
              <tr>
                <th className="p-4">Question</th>
                <th className="p-4">Type</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Year</th>
                <th className="p-4">Technology</th>
                <th className="p-4">Language</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {questions.map((q) => (
                <tr
                  key={q.question_id}
                  className="border-t hover:bg-gray-50 transition"
                >

                  {/* QUESTION */}
                  <td className="p-4 text-gray-800">
                    <div className="max-w-xs truncate">
                      {q.question_string}
                    </div>
                  </td>

                  {/* TYPE */}
                  <td className="p-4 text-gray-600">
                    {q.type_name || "-"}
                  </td>

                  {/* DIFFICULTY */}
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(
                        q.difficulty_level
                      )}`}
                    >
                      {q.difficulty_level}
                    </span>
                  </td>

                  {/* YEAR */}
                  <td className="p-4 text-gray-600">
                    {q.year || "-"}
                  </td>

                  {/* TECHNOLOGY */}
                  <td className="p-4 text-gray-600">
                    {q.technology || "-"}
                  </td>

                  {/* LANGUAGE */}
                  <td className="p-4 text-gray-600">
                    {q.language || "-"}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}
    </div>
  );
};

export default Questions;