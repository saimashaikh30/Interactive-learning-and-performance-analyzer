import React from "react";

const DeleteConfirmModal = ({ open, onClose, onConfirm, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Delete Domain
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-gray-600">
          Are you sure you want to delete this domain?
          <br />
          <span className="text-gray-500 text-xs">
            This action cannot be undone.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          {/* Delete Button */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmModal;