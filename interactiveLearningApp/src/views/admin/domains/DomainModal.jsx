import React, { useState } from "react";

const DomainModal = ({ initialData, onClose, onRefresh, setMessage }) => {
  const [domainName, setDomainName] = useState(initialData?.domain_name || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const name = domainName.trim();

    if (!name) {
      setError("Domain name is required");
      return false;
    }

    if (name.length < 3) {
      setError("Domain name must be at least 3 characters");
      return false;
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
      setError("Only letters are allowed");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

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
        setMessage?.({
          type: "success",
          text: data.message || "Domain saved successfully",
        });

        await onRefresh?.();
        onClose();

      } else {
        setMessage?.({
          type: "error",
          text: data.message || "Operation failed",
        });
      }

    } catch (error) {
      setMessage?.({
        type: "error",
        text: "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Domain" : "Add Domain"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-2">

            <label className="block text-sm font-medium text-gray-700">
              Domain Name
            </label>

            <input
              type="text"
              value={domainName}
              onChange={(e) => {
                setDomainName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Computer Science"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white
              focus:outline-none focus:ring-2
              ${
                error
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 rounded-b-2xl">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
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