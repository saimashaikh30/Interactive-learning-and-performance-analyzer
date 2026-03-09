import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

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
  const [allSubjectTopics, setAllSubjectTopics] = useState([]);
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
  const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

  const createdBy = Number(localStorage.getItem("user_id")) || 2;

  const selectedType = useMemo(
    () => types.find((t) => Number(t.type_id) === Number(typeId)),
    [types, typeId]
  );

  const isMcqType = useMemo(() => {
    const name = selectedType?.type_name?.toLowerCase() || "";
    return name === "mcq" || name === "multiple choice";
  }, [selectedType]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (isEdit && types.length > 0 && subjects.length > 0) {
      fetchQuestion();
    }
  }, [isEdit, types, subjects]);

  useEffect(() => {
    if (subjectId) {
      fetchTopicsBySubject(subjectId);
    } else {
      setAllSubjectTopics([]);
      setTopicSuggestions([]);
      setSelectedTopics([]);
      setTopicQuery("");
    }
  }, [subjectId]);

  const fetchFilters = async () => {
    try {
      const [typesRes, companiesRes, subjectsRes] = await Promise.all([
        axios.get(`${BASE_URL}/questionTypes/getQuestionTypes`),
        axios.get(`${BASE_URL}/companies/getCompanies`),
        axios.get(`${BASE_URL}/subjects/getSubjects`),
      ]);

      setTypes(typesRes.data.question_types || []);
      setCompanies(companiesRes.data.companies || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load form data");
    }
  };

  const fetchQuestion = async () => {
    if (!isEdit) return;

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${BASE_URL}/questions/getQuestion/${id}`);
      const q = res.data.question;

      setQuestionString(q.question_string || "");
      setDifficulty(q.difficulty_level || "");
      setTypeId(q.type_id ? String(q.type_id) : "");
      setCompanyId(q.company_id ? String(q.company_id) : "");
      setYear(q.year || "");
      setLanguage(q.language || "");
      setTechnology(q.technology || "");

      const questionTopics = q.topics || [];
      setSelectedTopics(questionTopics);

      if (questionTopics.length > 0) {
        const firstSubjectId = questionTopics[0]?.subject_id;
        if (firstSubjectId) {
          setSubjectId(String(firstSubjectId));
        }
      }

      if (q.options?.length > 0) {
        setOptions(
          q.options.map((o) => ({
            option_text: o.option_text || "",
            is_correct: !!o.is_correct,
          }))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsBySubject = async (subId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/topics/getTopicsBySubject/${subId}`
      );
      const topics = res.data.topics || [];
      setAllSubjectTopics(topics);

      if (topicQuery.trim()) {
        const filtered = topics.filter((t) =>
          t.topic_name.toLowerCase().includes(topicQuery.toLowerCase())
        );
        setTopicSuggestions(filtered);
      } else {
        setTopicSuggestions([]);
      }
    } catch (err) {
      setAllSubjectTopics([]);
      setTopicSuggestions([]);
    }
  };

  const handleTopicInput = (e) => {
    const value = e.target.value;
    setTopicQuery(value);

    if (!value.trim()) {
      setTopicSuggestions([]);
      return;
    }

    const filtered = allSubjectTopics.filter((t) =>
      t.topic_name.toLowerCase().includes(value.toLowerCase())
    );
    setTopicSuggestions(filtered);
  };

  const addTopic = (topic) => {
    if (!selectedTopics.find((t) => Number(t.topic_id) === Number(topic.topic_id))) {
      setSelectedTopics((prev) => [...prev, topic]);
    }
    setTopicQuery("");
    setTopicSuggestions([]);
  };

  const removeTopic = (topicId) => {
    setSelectedTopics((prev) =>
      prev.filter((t) => Number(t.topic_id) !== Number(topicId))
    );
  };

  const handleOptionChange = (index, key, value) => {
    const newOptions = [...options];

    if (key === "is_correct") {
      newOptions.forEach((o, i) => {
        o.is_correct = i === index;
      });
    } else {
      newOptions[index][key] = value;
    }

    setOptions(newOptions);
  };

  const validateForm = () => {
    if (!questionString.trim()) {
      setError("Question is required");
      return false;
    }

    if (!difficulty) {
      setError("Difficulty is required");
      return false;
    }

    if (!typeId) {
      setError("Question type is required");
      return false;
    }

    if (!subjectId) {
      setError("Subject is required");
      return false;
    }

    if (selectedTopics.length === 0) {
      setError("Please select at least one topic");
      return false;
    }

    if (isMcqType) {
      if (options.some((o) => !o.option_text.trim())) {
        setError("All MCQ options must be filled");
        return false;
      }

      if (!options.some((o) => o.is_correct)) {
        setError("Please select the correct answer");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      question_string: questionString.trim(),
      difficulty_level: difficulty,
      type_id: Number(typeId),
      company_id: companyId ? Number(companyId) : null,
      year: year || null,
      language: language.trim() || null,
      technology: technology.trim() || null,
      topic_ids: selectedTopics.map((t) => Number(t.topic_id)),
      options: isMcqType
        ? options.map((o) => ({
            option_text: o.option_text.trim(),
            is_correct: o.is_correct,
          }))
        : [],
    };

    if (!isEdit) {
      payload.created_by = createdBy;
    }

    try {
      setSaving(true);
      setError("");

      if (isEdit) {
        await axios.put(`${BASE_URL}/questions/editQuestion`, {
          question_id: Number(id),
          ...payload,
        });
      } else {
        await axios.post(`${BASE_URL}/questions/addQuestion`, payload);
      }

      navigate("/admin/questions");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectChange = (e) => {
    const newSubjectId = e.target.value;
    setSubjectId(newSubjectId);
    setSelectedTopics([]);
    setTopicQuery("");
    setTopicSuggestions([]);
  };

  const formatDifficulty = (value) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6 rounded-2xl bg-gray-50 p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          {isEdit ? "Edit Question" : "Add Question"}
        </h1>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow">
            Loading question...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl bg-white p-4 shadow">
              <label className="mb-1 block text-lg font-semibold text-gray-700">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                value={questionString}
                onChange={(e) => setQuestionString(e.target.value)}
                rows={4}
                className="h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your question"
              />
            </div>

            <div className="space-y-4 rounded-xl bg-white p-4 shadow">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {types.map((t) => (
                      <option key={t.type_id} value={t.type_id}>
                        {t.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Difficulty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Difficulty</option>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <option key={d} value={d}>
                        {formatDifficulty(d)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectId}
                    onChange={handleSubjectChange}
                    className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Topics <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topicQuery}
                    onChange={handleTopicInput}
                    placeholder={
                      subjectId ? "Type to search topics" : "Select subject first"
                    }
                    disabled={!subjectId}
                    className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />

                  {topicSuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white text-sm shadow">
                      {topicSuggestions.map((t) => (
                        <li
                          key={t.topic_id}
                          className="cursor-pointer px-3 py-2 hover:bg-blue-100"
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
                        className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
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

            {isMcqType && (
              <div className="rounded-xl bg-gray-50 p-4 shadow-inner">
                <h2 className="mb-2 text-sm font-semibold text-gray-700">
                  MCQ Options
                </h2>

                {options.map((o, i) => (
                  <div key={i} className="mb-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={o.option_text}
                      onChange={(e) =>
                        handleOptionChange(i, "option_text", e.target.value)
                      }
                      placeholder={`Option ${i + 1}`}
                      className="h-10 flex-1 rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-4">
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Technology"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/questions")}
                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="h-10 rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : isEdit ? "Update Question" : "Add Question"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddQuestion;