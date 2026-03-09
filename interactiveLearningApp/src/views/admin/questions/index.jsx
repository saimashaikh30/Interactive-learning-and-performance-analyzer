import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QuestionTable from "./QuestionTable";
import QuestionTypeModal from "./QuestionTypeModal";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [types, setTypes] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);

  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:5000/questions/getQuestions");
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

  const fetchFilters = async () => {
    try {
      const [typesRes, levelsRes, companiesRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/question_types/getQuestionTypes"),
        axios.get("http://127.0.0.1:5000/questions/getDifficultyLevels"),
        axios.get("http://127.0.0.1:5000/companies/getCompanies"),
      ]);
      setTypes(typesRes.data.types || []);
      setDifficultyLevels(levelsRes.data.levels || []);
      setCompanies(companiesRes.data.companies || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchFilters();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    return (
      (!selectedType || q.type_name === selectedType) &&
      (!selectedLevel || q.difficulty_level === selectedLevel)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            {difficultyLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowTypeModal(true)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
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
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <QuestionTable
        questions={filteredQuestions}
        loading={loading}
        onEdit={(q) => navigate(`/questions/edit/${q.question_id}`)}
      />

      {showTypeModal && (
        <QuestionTypeModal
          onClose={() => setShowTypeModal(false)}
          onRefresh={fetchFilters}
          setMessage={setMessage}
        />
      )}
    </div>
  );
};

export default Questions;