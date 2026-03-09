import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const AddQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questionString, setQuestionString] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [typeId, setTypeId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [year, setYear] = useState("");
  const [language, setLanguage] = useState("");
  const [technology, setTechnology] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicQuery, setTopicQuery] = useState("");
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);

  const [types, setTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!id;
  const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchFilters();
    fetchQuestion();
  }, []);

  const fetchFilters = async () => {
    try {
      const [typesRes, companiesRes, subjectsRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/question_types/getQuestionTypes"),
        axios.get("http://127.0.0.1:5000/companies/getCompanies"),
        axios.get("http://127.0.0.1:5000/subjects/getSubjects"),
      ]);
      setTypes(typesRes.data.types || []);
      setCompanies(companiesRes.data.companies || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestion = async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://127.0.0.1:5000/questions/getQuestion/${id}`
      );
      const q = res.data.question;
      setQuestionString(q.question_string || "");
      setDifficulty(q.difficulty_level || "");
      setTypeId(q.type_id || "");
      setCompanyId(q.company_id || "");
      setYear(q.year || "");
      setLanguage(q.language || "");
      setTechnology(q.technology || "");
      setSubjectId(q.subject_id || "");
      setSelectedTopics(q.topics || []);
      if (q.options?.length) setOptions(q.options);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicSuggestions = async (subjectId, query) => {
    if (!subjectId || !query) return setTopicSuggestions([]);
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/topics/getTopics?subject_id=${subjectId}&q=${query}`
      );
      setTopicSuggestions(res.data.topics || []);
    } catch {
      setTopicSuggestions([]);
    }
  };

  const handleTopicInput = (e) => {
    const value = e.target.value;
    setTopicQuery(value);
    fetchTopicSuggestions(subjectId, value);
  };

  const addTopic = (topic) => {
    if (!selectedTopics.find((t) => t.topic_id === topic.topic_id)) {
      setSelectedTopics([...selectedTopics, topic]);
    }
    setTopicQuery("");
    setTopicSuggestions([]);
  };

  const removeTopic = (topicId) => {
    setSelectedTopics(selectedTopics.filter((t) => t.topic_id !== topicId));
  };

  const handleOptionChange = (index, key, value) => {
    const newOptions = [...options];
    if (key === "is_correct") {
      newOptions.forEach((o, i) => (o.is_correct = i === index));
    } else {
      newOptions[index][key] = value;
    }
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionString.trim() || !difficulty || !typeId || !subjectId) {
      setError("Please fill all required fields");
      return;
    }
    if (types.find((t) => t.type_id === Number(typeId))?.type_name === "MCQ") {
      if (options.some((o) => !o.option_text.trim())) {
        setError("All MCQ options must be filled");
        return;
      }
      if (!options.some((o) => o.is_correct)) {
        setError("Please select the correct answer");
        return;
      }
    }

    const payload = {
      question_string: questionString,
      difficulty_level: difficulty,
      type_id: Number(typeId),
      company_id: companyId ? Number(companyId) : null,
      year: year || null,
      language,
      technology,
      subject_id: Number(subjectId),
      topics: selectedTopics.map((t) => t.topic_id),
      options,
    };

    try {
      setSaving(true);
      setError("");
      if (isEdit) {
        await axios.put(`http://127.0.0.1:5000/questions/editQuestion`, {
          question_id: Number(id),
          ...payload,
        });
      } else {
        await axios.post(`http://127.0.0.1:5000/questions/addQuestion`, payload);
      }
      navigate("/questions");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-gray-50 rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          {isEdit ? "Edit Question" : "Add Question"}
        </h1>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Question */}
        <div className="bg-white rounded-xl shadow p-4">
          <label className="block text-lg font-semibold text-gray-700 mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            value={questionString}
            onChange={(e) => setQuestionString(e.target.value)}
            rows={4}
            className="w-full text-gray-800 bg-white h-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your question"
          />
        </div>

        {/* Type/Difficulty/Subject/Topics */}
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                {types.map((t) => (
                  <option key={t.type_id} value={t.type_id}>
                    {t.type_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Difficulty</option>
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topics */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topics
              </label>
              <input
                type="text"
                value={topicQuery}
                onChange={handleTopicInput}
                placeholder="Type to search topics"
                className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {topicSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow max-h-40 overflow-y-auto text-sm">
                  {topicSuggestions.map((t) => (
                    <li
                      key={t.topic_id}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => addTopic(t)}
                    >
                      {t.topic_name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedTopics.map((t) => (
                  <span
                    key={t.topic_id}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1 text-xs"
                  >
                    {t.topic_name}
                    <button
                      type="button"
                      onClick={() => removeTopic(t.topic_id)}
                      className="font-bold text-gray-600 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MCQ Options */}
        {types.find((t) => t.type_id === Number(typeId))?.type_name === "MCQ" && (
          <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">MCQ Options</h2>
            {options.map((o, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  value={o.option_text}
                  onChange={(e) =>
                    handleOptionChange(i, "option_text", e.target.value)
                  }
                  placeholder={`Option ${i + 1}`}
                  className="h-10 flex-1 text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={o.is_correct}
                    onChange={() => handleOptionChange(i, "is_correct", true)}
                  />
                  Correct
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Company / Year / Language / Technology */}
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c.company_id} value={c.company_id}>
                {c.company_name}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Technology"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            className="h-10 w-full text-gray-800 bg-white rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/questions")}
            className="h-10 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving || loading}
            className="h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Question" : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;