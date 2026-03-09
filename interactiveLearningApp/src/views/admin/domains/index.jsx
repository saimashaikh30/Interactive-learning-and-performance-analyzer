import React, { useState, useEffect } from "react";
import axios from "axios";
import DomainTable from "./DomainTable";
import DomainModal from "./DomainModal";

const Domains = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editDomain, setEditDomain] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchDomains = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:5000/domains/getDomain"
      );

      setDomains(res.data?.domains || []);
    } catch (err) {
      console.error("Error fetching domains:", err);

      setMessage({
        type: "error",
        text: "Failed to load domains",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  // Auto hide message
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleAddDomain = () => {
    setEditDomain(null);
    setOpenModal(true);
  };

  const handleEditDomain = (domain) => {
    setEditDomain(domain);
    setOpenModal(true);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Domain Management
        </h1>

        <button
          onClick={handleAddDomain}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Add Domain
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading domains...
        </div>
      ) : (
        <DomainTable
          domains={domains}
          onEdit={handleEditDomain}
          onRefresh={fetchDomains}
          setMessage={setMessage}
        />
      )}

      {/* Modal */}
      {openModal && (
        <DomainModal
          key={editDomain ? editDomain.domain_id : "new-domain"}
          initialData={editDomain}
          onClose={() => setOpenModal(false)}
          onRefresh={fetchDomains}
          setMessage={setMessage}
        />
      )}
    </div>
  );
};

export default Domains;