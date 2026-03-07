import React, { useState } from "react";
import DomainTable from "./DomainTable";
import DomainModal from "./DomainModal";

const Domains = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editDomain, setEditDomain] = useState(null);

  // dummy data (UI only)
  const domains = [
    {
      domain_id: 1,
      domain_name: "Computer Science",
    },
    {
      domain_id: 2,
      domain_name: "Mechanical Engineering",
    },
    {
      domain_id: 3,
      domain_name: "Electronics",
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <br />
        <br />
        <br />

        <button
          onClick={() => {
            setEditDomain(null);
            setOpenModal(true);
          }}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Add Domain
        </button>
      </div>

      <DomainTable
        domains={domains}
        onEdit={(domain) => {
          setEditDomain(domain);
          setOpenModal(true);
        }}
      />

      {openModal && (
        <DomainModal
          initialData={editDomain}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
};

export default Domains;