import React, { useState } from "react";

const CompanyModal = ({ initialData, onClose, onRefresh, setMessage }) => {

  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const name = companyName.trim();

    if (!name) {
      setError("Company name is required");
      return false;
    }

    if (name.length < 2) {
      setError("Company name must be at least 2 characters");
      return false;
    }

    if (!/^[A-Za-z\s.&]+$/.test(name)) {
      setError("Invalid company name");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const companyId = initialData?.company_id;
    const isEditing = !!companyId;

    const url = isEditing
      ? "http://127.0.0.1:5000/companies/editCompany"
      : "http://127.0.0.1:5000/companies/addCompany";

    const method = isEditing ? "PUT" : "POST";

    const body = isEditing
      ? { company_id: companyId, company_name: companyName }
      : { company_name: companyName };

    setLoading(true);

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {

        setMessage({
          type: "success",
          text: data.message || "Company saved successfully",
        });

        await onRefresh();
        onClose();

      } else {

        setMessage({
          type: "error",
          text: data.message || "Operation failed",
        });

      }

    } catch {
      setMessage({
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

        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Company" : "Add Company"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-2">

            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>

            <input
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Google"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white
              ${
                error
                  ? "border-red-400"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

          </div>

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

export default CompanyModal;