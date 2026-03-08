import React, { useState, useEffect } from "react";
import axios from "axios";
import DomainTable from "./DomainTable";
import DomainModal from "./DomainModal";

const Domains = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editDomain, setEditDomain] = useState(null);
  const [domains, setDomains] = useState([]); 
  const [loading, setLoading] = useState(true);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:5000/domains/getDomain");
      
      setDomains(res.data.domains || []);
    } catch (err) {
      console.error("Error fetching domains:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Domain Management</h1>
        <button
          onClick={() => {
            setEditDomain(null);
            setOpenModal(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Domain
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading domains...</div>
      ) : (
        <DomainTable
          domains={domains}
          onEdit={(domain) => {
            setEditDomain( domain );
            setOpenModal(true);
          }}
          onRefresh={fetchDomains} 
        />
      )}

      {openModal && (
        <DomainModal
        key={editDomain ? editDomain.domain_id : "new-domain"}
          initialData={editDomain}
          onClose={() => setOpenModal(false)}
          onRefresh={fetchDomains} 
        />
      )}
    </div>
  );
};

export default Domains;