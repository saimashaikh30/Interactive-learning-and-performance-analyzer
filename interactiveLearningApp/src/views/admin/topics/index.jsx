import React, { useState, useEffect } from "react";
import axios from "axios";
import TopicTable from "./TopicTable";
import TopicModal from "./TopicModal";

const Topics = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:5000/topics/getTopics"
      );

      setTopics(res.data?.topics || []);

    } catch (err) {
      console.error("Error fetching topics:", err);

      setMessage({
        type: "error",
        text: "Failed to load topics",
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => clearTimeout(timer);

  }, [message]);

  const handleAddTopic = () => {
    setEditTopic(null);
    setOpenModal(true);
  };

  const handleEditTopic = (topic) => {
    setEditTopic(topic);
    setOpenModal(true);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Topic Management
        </h1>

        <button
          onClick={handleAddTopic}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Topic
        </button>
      </div>

      {/* Message */}
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

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading topics...
        </div>
      ) : (
        <TopicTable
          topics={topics}
          onEdit={handleEditTopic}
          onRefresh={fetchTopics}
          setMessage={setMessage}
        />
      )}

      {/* Modal */}
      {openModal && (
        <TopicModal
          key={editTopic ? editTopic.topic_id : "new-topic"}
          initialData={editTopic}
          onClose={() => setOpenModal(false)}
          onRefresh={fetchTopics}
          setMessage={setMessage}
        />
      )}

    </div>
  );
};

export default Topics;