import React, { useState, useEffect } from "react";
import axios from "axios";

const TopicModal = ({ initialData, onClose, onRefresh, setMessage }) => {

  const [topicName, setTopicName] = useState(initialData?.topic_name || "");
  const [subjectId, setSubjectId] = useState(initialData?.subject_id || "");
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/subjects/getSubjects")
      .then((res) => {
        setSubjects(res.data?.subjects || []);
      });
  }, []);

  const validate = () => {
    if (!topicName.trim()) {
      setError("Topic name is required");
      return false;
    }

    if (!subjectId) {
      setError("Please select a subject");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const topicId = initialData?.topic_id;
    const isEditing = !!topicId;

    const url = isEditing
      ? "http://127.0.0.1:5000/topics/editTopic"
      : "http://127.0.0.1:5000/topics/addTopic";

    const method = isEditing ? "PUT" : "POST";

    const body = isEditing
      ? { topic_id: topicId, topic_name: topicName, subject_id: subjectId }
      : { topic_name: topicName, subject_id: subjectId };

    setLoading(true);

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || "Topic saved successfully",
        });

        await onRefresh();
        onClose();

      } else {
        setMessage({
          type: "error",
          text: data.message || "Operation failed",
        });
      }

    } catch {
      setMessage({
        type: "error",
        text: "Network error",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Topic" : "Add Topic"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="px-6 py-5 space-y-3">

            <label className="text-sm font-medium text-gray-700">
              Subject
            </label>

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="">Select Subject</option>

              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_name}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-gray-700">
              Topic Name
            </label>

            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white"
            />

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
            >
              {loading ? "Saving..." : "Save"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default TopicModal;