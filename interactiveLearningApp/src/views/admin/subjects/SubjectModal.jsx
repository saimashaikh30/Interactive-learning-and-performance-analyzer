import React, { useEffect, useState } from "react";
import { MdRefresh } from "react-icons/md";
import axios from "axios";

const SubjectModal = ({ initialData, onClose, onSuccess }) => {
  const [subjectName, setSubjectName] = useState(initialData?.subject_name || "");
  const [subjectCode, setSubjectCode] = useState(initialData?.subject_code || "");
  const [domainId, setDomainId] = useState(initialData?.domain_id || "");

  const [domains, setDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData;

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoadingDomains(true);
      setError("");

      const res = await axios.get("http://127.0.0.1:5000/domains/getDomain");
      setDomains(res.data.domains || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load domains");
    } finally {
      setLoadingDomains(false);
    }
  };

  const handleSubmit = async () => {
    if (!subjectName.trim() || !subjectCode.trim() || !domainId) {
      setError("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        subject_name: subjectName.trim(),
        subject_code: subjectCode.trim(),
        domain_id: Number(domainId),
      };

      if (isEdit) {
        await axios.put("http://127.0.0.1:5000/subjects/editSubject", {
          subject_id: initialData.subject_id,
          ...payload,
        });
      } else {
        await axios.post("http://127.0.0.1:5000/subjects/addSubject", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Subject" : "Add Subject"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter subject details below
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject Code
            </label>
            <input
              type="text"
              placeholder="e.g. CS101"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject Name
            </label>
            <input
              type="text"
              placeholder="e.g. Data Structures"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Domain
            </label>

            {loadingDomains ? (
              <div className="flex items-center justify-center rounded-lg border border-gray-300 py-3">
                <MdRefresh className="animate-spin text-xl text-brand-500" />
              </div>
            ) : (
              <select
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Select Domain</option>
                {domains.map((d) => (
                  <option key={d.domain_id} value={d.domain_id}>
                    {d.domain_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 rounded-b-2xl border-t bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving || loadingDomains}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectModal;