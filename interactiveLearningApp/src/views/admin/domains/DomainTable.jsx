import React from "react";
import { MdEdit, MdDelete } from "react-icons/md";

const DomainTable = ({ domains, onEdit }) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Domain Name
            </th>

            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {domains.map((d) => (
            <tr
              key={d.domain_id}
              className="border-b last:border-b-0 hover:bg-gray-50"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {d.domain_name}
              </td>

              <td className="px-6 py-4 text-right space-x-3">
                <button
                  onClick={() => onEdit(d)}
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

          {domains.length === 0 && (
            <tr>
              <td
                colSpan="2"
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                No domains available
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
};

export default DomainTable;