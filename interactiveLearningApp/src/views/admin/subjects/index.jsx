import React, { useState } from "react";
import SubjectTable from "./SubjectTable";
import SubjectModal from "./SubjectModal";

const Subjects = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);

  // dummy UI data (design only)
  const subjects = [
    {
      subject_id: 1,
      subject_name: "DSA",
      topics_count: 12,
      created_at: "12 Feb 2025",
      updated_at: "18 Feb 2025",
    },
    {
      subject_id: 2,
      subject_name: "Computer Networks",
      topics_count: 9,
      created_at: "10 Feb 2025",
      updated_at: "20 Feb 2025",
    },
    {
      subject_id: 3,
      subject_name: "Operating System",
      topics_count: 15,
      created_at: "10 Feb 2025",
      updated_at: "20 Feb 2025",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <br/>
        <br/>
        <br/>

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

      {/* Subjects Table */}
      <SubjectTable
        subjects={subjects}
        onEdit={(subject) => {
          setEditSubject(subject);
          setOpenModal(true);
        }}
      />

      {/* Modal */}
      {openModal && (
        <SubjectModal
          initialData={editSubject}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
};

export default Subjects;