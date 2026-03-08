import React from "react";

const DomainModal = ({ initialData, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Domain" : "Add Domain"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter domain details below
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Domain Name
            </label>

            <input
              type="text"
              placeholder="e.g. Computer Science"
              defaultValue={initialData?.domain_name}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900
              placeholder-gray-400
              focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default DomainModal;