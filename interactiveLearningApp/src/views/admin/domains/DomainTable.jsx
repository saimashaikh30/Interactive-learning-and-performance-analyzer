import React from "react";
import axios from "axios";
import { MdEdit, MdDelete } from "react-icons/md";

const DomainTable = ({ domains, onEdit ,onRefresh}) => {
const handleDelete = async (domainId) => {
  if (!window.confirm("Are you sure you want to delete this domain?")) return;

  try {
    const res = await axios.delete("http://127.0.0.1:5000/domains/deleteDomain", {
      data: { domain_id: domainId } // Axios requires the 'data' key for DELETE bodies
    });
    
    alert(res.data.message);
    
    // Logic to refresh the UI (assuming you pass onRefresh as a prop)
    if (typeof onRefresh === 'function') {
      onRefresh();
    }
  } catch (err) {
    console.error("Error deleting domain:", err);
    alert(err.response?.data?.message || "Failed to delete domain");
  }
};
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
                onClick={()=>handleDelete(d.domain_id)}
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