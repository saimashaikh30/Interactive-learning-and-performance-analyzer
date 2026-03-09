import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectTable from "./SubjectTable";
import SubjectModal from "./SubjectModal";

const Subjects = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const res = await axios.get("http://127.0.0.1:5000/subjects/getSubjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load subjects",
      });
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Auto-hide success/error messages
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  // Handle delete (called from SubjectTable after confirmation)
  const handleDelete = async (subjectId) => {
    try {
      const res = await axios.delete(
        `http://127.0.0.1:5000/subjects/deleteSubject/${subjectId}`
      );

      setMessage({
        type: "success",
        text: res.data.message || "Subject deleted successfully",
      });

      fetchSubjects();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete subject",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <h1 className="text-2xl font-bold text-gray-800">Subject Management</h1>

        <button
          onClick={() => {
            setEditSubject(null);
            setOpenModal(true);
          }}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Add Subject
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

      {/* Subject Table */}
      <SubjectTable
        subjects={subjects}
        loading={loadingSubjects}
        onEdit={(subject) => {
          setEditSubject(subject);
          setOpenModal(true);
        }}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      {openModal && (
        <SubjectModal
          initialData={editSubject}
          onClose={() => setOpenModal(false)}
          onSuccess={fetchSubjects}
        />
      )}
    </div>
  );
};

export default Subjects;