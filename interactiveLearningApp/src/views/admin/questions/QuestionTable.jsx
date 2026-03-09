import React, { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import DeleteConfirmModal from "../domains/DeleteConfirmModal"; // reuse your delete modal

const QuestionTable = ({ questions = [], loading = false, onEdit }) => {
  const [deleteId, setDeleteId] = useState(null);

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Question</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Year</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Company</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Language</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Technology</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Creator</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  Loading questions...
                </td>
              </tr>
            ) : questions.length > 0 ? (
              questions.map((q) => (
                <tr key={q.question_id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{q.question_string}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{q.type_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{q.difficulty_level}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{q.year || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{q.company_name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{q.language || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{q.technology || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{q.creator_name || "-"}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(q)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <MdEdit size={18} />
                    </button>

                    <button
                      onClick={() => setDeleteId(q.question_id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete"
                    >
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  No questions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete modal */}
      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          console.log("Delete question ID:", deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
};

export default QuestionTable;