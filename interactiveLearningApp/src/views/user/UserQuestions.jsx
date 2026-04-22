import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

export default function UserQuestions() {
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // ================= STATE =================
  const [domains, setDomains] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // ================= FETCH DOMAINS ON MOUNT =================
  useEffect(() => {
    axios
      .get(`${BASE_URL}/domains/getDomain`, authHeader)
      .then((res) => setDomains(res.data.domains || []))
      .catch(console.error);
  }, []);

  // ================= HANDLERS =================
  const handleSelectDomain = async (domain) => {
    setSelectedDomain(domain);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSubjects([]);
    setTopics([]);
    setQuestions([]);

    setLoadingSubjects(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/subjects/getSubjectsByDomain/${domain.domain_id}`,
        authHeader
      );
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setSelectedTopic(null);
    setTopics([]);
    setQuestions([]);

    setLoadingTopics(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/topics/getTopicsBySubject/${subject.subject_id}`,
        authHeader
      );
      setTopics(res.data.topics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setQuestions([]);

    setLoadingQuestions(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/questions/getQuestionsByTopic/${topic.topic_id}`,
        authHeader
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetAll = () => {
    setSelectedDomain(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSubjects([]);
    setTopics([]);
    setQuestions([]);
    setSearch("");
    setLevel("");
    setType("");
  };

  // ================= FILTER =================
  const filtered = questions.filter((q) => {
    return (
      (!search ||
        q.question_string.toLowerCase().includes(search.toLowerCase())) &&
      (!level || q.difficulty_level?.toLowerCase() === level.toLowerCase()) &&
      (!type || q.type_name?.toLowerCase() === type.toLowerCase())
    );
  });

  // ================= STEP RENDERER (LEFT PANEL) =================
  const renderStep = () => {
    // STEP 1: DOMAINS
    if (!selectedDomain) {
      return (
        <div>
          <h2 className="font-bold text-lg mb-3">Select Domain</h2>
          {domains.length === 0 ? (
            <p className="text-sm text-gray-400">No domains found</p>
          ) : (
            domains.map((d) => (
              <button
                key={d.domain_id}
                onClick={() => handleSelectDomain(d)}
                className="block w-full text-left p-2 rounded hover:bg-blue-50"
              >
                {d.domain_name}
              </button>
            ))
          )}
        </div>
      );
    }

    // STEP 2: SUBJECTS
    if (!selectedSubject) {
      return (
        <div>
          <h2 className="font-bold text-lg mb-3">Select Subject</h2>
          {loadingSubjects ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-gray-400">No subjects found</p>
          ) : (
            subjects.map((s) => (
              <button
                key={s.subject_id}
                onClick={() => handleSelectSubject(s)}
                className="block w-full text-left p-2 rounded hover:bg-blue-50"
              >
                {s.subject_name}
              </button>
            ))
          )}
        </div>
      );
    }

    // STEP 3: TOPICS
    if (!selectedTopic) {
      return (
        <div>
          <h2 className="font-bold text-lg mb-3">Select Topic</h2>
          {loadingTopics ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : topics.length === 0 ? (
            <p className="text-sm text-gray-400">No topics found</p>
          ) : (
            topics.map((t) => (
              <button
                key={t.topic_id}
                onClick={() => handleSelectTopic(t)}
                className="block w-full text-left p-2 rounded hover:bg-blue-50"
              >
                {t.topic_name}
              </button>
            ))
          )}
        </div>
      );
    }

    // STEP 4: DONE — show count in sidebar
    return (
      <div>
        <h2 className="font-bold text-lg mb-3">Topic Selected</h2>
        <p className="text-sm text-gray-500">
          {loadingQuestions
            ? "Loading questions..."
            : `${filtered.length} question${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>
    );
  };

  // ================= DIFFICULTY BADGE =================
  const difficultyColor = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  // ================= RETURN =================
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">

      {/* LEFT PANEL */}
      <div className="w-80 bg-white border-r p-5 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Explorer</h2>

        {/* SEARCH */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTERS */}
        <select
          className="w-full border p-2 rounded"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          className="w-full border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="Coding">Coding</option>
          <option value="Theory">Theory</option>
        </select>

        {/* RESET */}
        <button
          onClick={resetAll}
          className="w-full bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Reset All
        </button>

        <hr />

        {/* STEP NAVIGATOR */}
        {renderStep()}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* BREADCRUMB */}
        <h1 className="text-2xl font-bold mb-4">
          {selectedDomain?.domain_name || "Select Domain"}
          {selectedSubject ? ` → ${selectedSubject.subject_name}` : ""}
          {selectedTopic ? ` → ${selectedTopic.topic_name}` : ""}
        </h1>

        {/* PROMPT TO KEEP SELECTING */}
        {!selectedTopic ? (
          <p className="text-gray-400 mt-10">
            Complete selection on the left to view questions.
          </p>
        ) : loadingQuestions ? (
          <p className="text-gray-400 mt-10">Loading questions...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 mt-10">No questions found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((q, idx) => (
              <div
                key={q.question_id}
                className="bg-white border p-4 rounded-lg hover:shadow space-y-2"
              >
                {/* Question text */}
                <div className="flex gap-2">
                  <span className="text-gray-400 text-sm shrink-0">Q{idx + 1}.</span>
                  <h3 className="font-semibold text-sm">{q.question_string}</h3>
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap ml-5">
                  {q.difficulty_level && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[q.difficulty_level] || "bg-gray-100 text-gray-600"}`}>
                      {q.difficulty_level}
                    </span>
                  )}
                  {q.type_name && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {q.type_name}
                    </span>
                  )}
                  {q.company_name && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                      {q.company_name}
                    </span>
                  )}
                </div>

                {/* Options */}
                {q.options?.length > 0 && (
                  <div className="ml-5 space-y-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.option_id}
                        className={`text-xs px-2 py-1 rounded ${
                          opt.is_correct
                            ? "bg-green-50 text-green-700 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {opt.is_correct ? "✓ " : "• "}{opt.option_text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}