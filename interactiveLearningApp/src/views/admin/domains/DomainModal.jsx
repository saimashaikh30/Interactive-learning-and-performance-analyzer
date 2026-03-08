import React, { useState } from "react";

const DomainModal = ({ initialData, onClose, onRefresh }) => {
  const [domainName, setDomainName] = useState(initialData?.domain_name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const domainId = initialData?.domain_id;
  const isEditing = !!domainId; 


  const url = isEditing
    ? "http://127.0.0.1:5000/domains/editDomain"
    : "http://127.0.0.1:5000/domains/addDomain";

  const method = isEditing ? "PUT" : "POST";

  const body = isEditing
    ? { domain_id: domainId, domain_name: domainName }
    : { domain_name: domainName };

  setLoading(true);
  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      if (onRefresh) onRefresh();
      onClose();
    } else {
      alert(data.message || "Operation failed");
    }
  } catch (error) {
    alert("Network error");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Domain" : "Add Domain"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">Enter domain details below</p>
        </div>

        {/* Body - Wrapped in a form for 'Enter' key support */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Domain Name
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)} // 3. Input Handler
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default DomainModal;