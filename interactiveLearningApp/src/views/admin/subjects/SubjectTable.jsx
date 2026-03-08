import React from "react";
import { MdEdit, MdDelete } from "react-icons/md";

const SubjectTable = ({ subjects, onEdit }) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Subject Name
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Domain
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Topics
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Created At
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Updated At
            </th>

            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

          {subjects.map((s) => (
            <tr
              key={s.subject_id}
              className="border-b last:border-b-0 hover:bg-gray-50"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {s.subject_name}
              </td>

              <td className="px-6 py-4 text-sm text-gray-700">
                {s.domain_name}
              </td>

              <td className="px-6 py-4">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {s.topics_count}
                </span>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {s.created_at}
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {s.updated_at}
              </td>

              <td className="px-6 py-4 text-right space-x-3">

                <button
                  onClick={() => onEdit(s)}
                  className="text-brand-500 hover:text-brand-600"
                  title="Edit"
                >
                  <MdEdit size={18} />
                </button>

                <button
                  className="text-red-500 hover:text-red-600"
                  title="Delete"
                >
                  <MdDelete size={18} />
                </button>

              </td>
            </tr>
          ))}

          {subjects.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                No subjects available
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
};

export default SubjectTable;