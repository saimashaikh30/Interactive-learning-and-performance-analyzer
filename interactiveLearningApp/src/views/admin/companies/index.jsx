import React, { useState, useEffect } from "react";
import axios from "axios";
import CompanyTable from "./CompanyTable";
import CompanyModal from "./CompanyModal";

const Companies = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:5000/companies/getCompanies"
      );

      setCompanies(res.data?.companies || []);
    } catch (err) {
      console.error("Error fetching companies:", err);

      setMessage({
        type: "error",
        text: "Failed to load companies",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleAddCompany = () => {
    setEditCompany(null);
    setOpenModal(true);
  };

  const handleEditCompany = (company) => {
    setEditCompany(company);
    setOpenModal(true);
  };

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          
        </h1>

        <button
          onClick={handleAddCompany}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Company
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
          Loading companies...
        </div>
      ) : (
        <CompanyTable
          companies={companies}
          onEdit={handleEditCompany}
          onRefresh={fetchCompanies}
          setMessage={setMessage}
        />
      )}

      {openModal && (
        <CompanyModal
          key={editCompany ? editCompany.company_id : "new-company"}
          initialData={editCompany}
          onClose={() => setOpenModal(false)}
          onRefresh={fetchCompanies}
          setMessage={setMessage}
        />
      )}
    </div>
  );
};

export default Companies;