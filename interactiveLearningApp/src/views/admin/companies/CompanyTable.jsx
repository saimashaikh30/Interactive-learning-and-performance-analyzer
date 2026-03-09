import React, { useState } from "react";
import axios from "axios";
import { MdEdit, MdDelete } from "react-icons/md";
import DeleteConfirmModal from "../domains/DeleteConfirmModal";

const CompanyTable = ({ companies, onEdit, onRefresh, setMessage }) => {

  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
        if (!deleteId) return;

        try {
            setLoading(true);

            const res = await axios.delete(
            `http://127.0.0.1:5000/companies/deleteCompany/${deleteId}`
            );

            setMessage({
            type: "success",
            text: res.data.message || "Company deleted successfully",
            });

            if (onRefresh) onRefresh();

        } catch (err) {
            setMessage({
            type: "error",
            text: err.response?.data?.message || "Failed to delete company",
            });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Company Name
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => (
              <tr key={c.company_id} className="border-b hover:bg-gray-50">

                <td className="px-6 py-4 font-medium text-gray-900">
                  {c.company_name}
                </td>

                <td className="px-6 py-4 text-right space-x-3">

                  <button
                    onClick={() => onEdit(c)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <MdEdit size={18} />
                  </button>

                  <button
                    onClick={() => setDeleteId(c.company_id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <MdDelete size={18} />
                  </button>

                </td>
              </tr>
            ))}

            {companies.length === 0 && (
              <tr>
                <td colSpan="2" className="py-8 text-center text-gray-500">
                  No companies available
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
};

export default CompanyTable;