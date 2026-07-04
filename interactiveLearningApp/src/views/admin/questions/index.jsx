import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import QuestionTable from "./QuestionTable";
import QuestionTypeModal from "./QuestionTypeModal";

const BASE_URL = "http://127.0.0.1:5000";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const difficultyLevels = ["easy", "medium", "hard"];

  const searchText = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("search") || "").trim().toLowerCase();
  }, [location.search]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const res = await axios.get(`${BASE_URL}/questions/getQuestions`);
      console.table(res.data.questions);
     
      setQuestions(res.data.questions || []);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/questionTypes/getQuestionTypes`);
      setTypes(res.data.question_types || []);
    } catch (err) {
      console.error("Failed to load question types", err);
      setTypes([]);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchQuestionTypes();
  }, []);

  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`${BASE_URL}/questions/deleteQuestion/${questionId}`);

      setQuestions((prev) =>
        prev.filter((q) => q.question_id !== questionId)
      );

      setMessage({
        type: "success",
        text: "Question deleted successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete question",
      });
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
       alert(
  `Question: ${q.question_string}
Difficulty: ${q.difficulty_level}
Selected: ${selectedLevel}`
);
      const matchesType = !selectedType || q.type_name === selectedType;
     const matchesDifficulty =
  !selectedLevel ||
  (q.occurrences || []).some(
    occ =>
      occ.difficulty_level &&
      occ.difficulty_level.toLowerCase() ===
      selectedLevel.toLowerCase()
  );
      const matchesSearch =
        !searchText ||
        q.question_string?.toLowerCase().includes(searchText) ||
        q.type_name?.toLowerCase().includes(searchText) ||
        q.difficulty_level?.toLowerCase().includes(searchText) ||
        q.company_name?.toLowerCase().includes(searchText) ||
        q.creator_name?.toLowerCase().includes(searchText) ||
        q.technology?.toLowerCase().includes(searchText) ||
        q.language?.toLowerCase().includes(searchText) ||
        q.year?.toString().includes(searchText) ||
        q.question_id?.toString().includes(searchText);

      return matchesType && matchesDifficulty && matchesSearch;
    });
  }, [questions, selectedType, selectedLevel, searchText]);

  const formatDifficulty = (value) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t.type_id} value={t.type_name}>
                {t.type_name}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {formatDifficulty(level)}
              </option>
            ))}
          </select>

          {(selectedType || selectedLevel) && (
            <button
              onClick={() => {
                setSelectedType("");
                setSelectedLevel("");
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTypeModal(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + Add Question Type
          </button>

          <button
            onClick={() => navigate("/admin/questions/add")}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            + Add Question
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <QuestionTable
        questions={filteredQuestions}
        loading={loading}
        onEdit={(q) => navigate(`/admin/questions/edit/${q.question_id}`)}
        onDelete={handleDelete}
      />

      {showTypeModal && (
        <QuestionTypeModal
          onClose={() => setShowTypeModal(false)}
          onRefresh={fetchQuestionTypes}
          setMessage={setMessage}
        />
      )}
    </div>
  );
};

export default Questions;