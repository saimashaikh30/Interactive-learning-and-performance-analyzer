import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectTable from "./SubjectTable";
import SubjectModal from "./SubjectModal";

const Subjects = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      setError("");

      const res = await axios.get("http://127.0.0.1:5000/subjects/getSubjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (subjectId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:5000/subjects/deleteSubject/${subjectId}`);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete subject");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <br />
          <br />
          <br />
        </div>

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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <SubjectTable
        subjects={subjects}
        loading={loadingSubjects}
        onEdit={(subject) => {
          setEditSubject(subject);
          setOpenModal(true);
        }}
        onDelete={handleDelete}
      />

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