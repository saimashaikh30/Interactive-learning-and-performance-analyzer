import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import DomainTable from "./DomainTable";
import DomainModal from "./DomainModal";

const Domains = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editDomain, setEditDomain] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const location = useLocation();

  const searchText = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("search") || "").trim().toLowerCase();
  }, [location.search]);

  const fetchDomains = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://127.0.0.1:5000/domains/getDomain");

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

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const filteredDomains = useMemo(() => {
    if (!searchText) return domains;

    return domains.filter((domain) => {
      return (
        domain.domain_name?.toLowerCase().includes(searchText) ||
        domain.domain_id?.toString().includes(searchText)
      );
    });
  }, [domains, searchText]);

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

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading domains...
        </div>
      ) : (
        <DomainTable
          domains={filteredDomains}
          onEdit={handleEditDomain}
          onRefresh={fetchDomains}
          setMessage={setMessage}
        />
      )}

      {!loading && filteredDomains.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
          No domains found
        </div>
      )}

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