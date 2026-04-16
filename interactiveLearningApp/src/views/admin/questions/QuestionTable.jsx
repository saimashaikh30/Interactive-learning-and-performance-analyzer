import React, { useMemo, useState } from "react";
import {
  MdEdit,
  MdDelete,
  MdChevronLeft,
  MdChevronRight,
  MdVisibility,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import DeleteConfirmModal from "../domains/DeleteConfirmModal";
import "../../../components/DataTable.css";

const ROWS_PER_PAGE = 6;

const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "—";

const QuestionTable = ({ questions = [], loading = false, onEdit, onDelete }) => {
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(questions.length / ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ROWS_PER_PAGE;
  const paginated = questions.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
      .reduce((acc, p, i, arr) => {
        if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
        acc.push(p);
        return acc;
      }, []);
  }, [totalPages, safeCurrentPage]);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await onDelete?.(deleteId);
    setDeleteId(null);
  };

  const toggleView = (questionId) => {
    setExpandedQuestionId((prev) => (prev === questionId ? null : questionId));
  };

  return (
    <>
      <div className="dt-card">
        <div className="dt-scroll">
          <table className="dt-table">
            <thead className="dt-thead">
              <tr>
                <th className="dt-th" style={{ width: "80px" }}>Sr. No.</th>
                <th className="dt-th" style={{ minWidth: "320px" }}>Question</th>
                <th className="dt-th" style={{ width: "180px" }}>Creator</th>
                <th className="dt-th" style={{ width: "140px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, ri) => (
                  <tr key={ri} className="dt-row">
                    {[30, 80, 50, 50].map((w, ci) => (
                      <td key={ci} className="dt-td">
                        <div className="dt-skeleton" style={{ width: `${w}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length > 0 ? (
                paginated.map((q, index) => {
                  const isExpanded = expandedQuestionId === q.question_id;
                  const occurrences = q.occurrences || [];

                  return (
                    <React.Fragment key={q.question_id}>
                      <tr className="dt-row">
                        <td className="dt-td">
                          <span className="dt-text-secondary">{startIndex + index + 1}</span>
                        </td>

                        <td className="dt-td">
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span
                              className="dt-text-primary"
                              style={{ whiteSpace: "normal", wordBreak: "break-word", fontWeight: 600 }}
                            >
                              {q.question_string || "—"}
                            </span>

                            {q.type_name && (
                              <span className="dt-text-muted" style={{ fontSize: "13px" }}>
                                Type: {q.type_name}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="dt-td">
                          <span className="dt-text-secondary">{q.creator_name || "—"}</span>
                        </td>

                        <td className="dt-td" style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                            <button
                              title="View"
                              onClick={() => toggleView(q.question_id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#0f766e",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <MdVisibility size={18} />
                              {isExpanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
                            </button>

                            <button
                              title="Edit"
                              onClick={() => onEdit?.(q)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#2563eb",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <MdEdit size={18} />
                            </button>

                            <button
                              title="Delete"
                              onClick={() => setDeleteId(q.question_id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#dc2626",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="dt-td" style={{ background: "#f8fafc", padding: "16px 20px" }}>
                            <div
                              style={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                overflow: "hidden",
                                background: "#ffffff",
                              }}
                            >
                              <div
                                style={{
                                  padding: "12px 16px",
                                  background: "#eff6ff",
                                  borderBottom: "1px solid #dbeafe",
                                  fontWeight: 600,
                                  color: "#1e3a8a",
                                }}
                              >
                                Occurrence Details
                              </div>

                              {occurrences.length > 0 ? (
                                <div style={{ overflowX: "auto" }}>
                                  <table
                                    style={{
                                      width: "100%",
                                      borderCollapse: "collapse",
                                      minWidth: "760px",
                                    }}
                                  >
                                    <thead>
                                      <tr style={{ background: "#f8fafc" }}>
                                        <th style={subThStyle}>Sr. No.</th>
                                        <th style={subThStyle}>Company</th>
                                        <th style={subThStyle}>Difficulty</th>
                                        <th style={subThStyle}>Year</th>
                                        <th style={subThStyle}>Language</th>
                                        <th style={subThStyle}>Technology</th>
                                        <th style={subThStyle}>Added By</th>
                                        <th style={subThStyle}>Created At</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {occurrences.map((occ, occIndex) => (
                                        <tr key={occ.occurrence_id || occIndex}>
                                          <td style={subTdStyle}>{occIndex + 1}</td>
                                          <td style={subTdStyle}>{occ.company_name || "—"}</td>
                                          <td style={subTdStyle}>{capitalize(occ.difficulty_level) || "—"}</td>
                                          <td style={subTdStyle}>{occ.year || "—"}</td>
                                          <td style={subTdStyle}>{occ.language || "—"}</td>
                                          <td style={subTdStyle}>{occ.technology || "—"}</td>
                                          <td style={subTdStyle}>{occ.creator_name || "—"}</td>
                                          <td style={subTdStyle}>
                                            {occ.created_at
                                              ? new Date(occ.created_at).toLocaleString()
                                              : "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div style={{ padding: "16px", color: "#64748b" }}>
                                  No occurrence data found.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="dt-empty">No questions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && questions.length > ROWS_PER_PAGE && (
          <div className="dt-pagination">
            <span className="dt-pg-info">
              Showing <strong>{startIndex + 1}–{Math.min(startIndex + ROWS_PER_PAGE, questions.length)}</strong> of <strong>{questions.length}</strong>
            </span>

            <div className="dt-pg-buttons">
              <button
                className="dt-pg-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
              >
                <MdChevronLeft size={18} />
              </button>

              {pageNumbers.map((item, i) =>
                item === "..." ? (
                  <span key={`e-${i}`} className="dt-pg-ellipsis">…</span>
                ) : (
                  <button
                    key={item}
                    className={`dt-pg-btn${safeCurrentPage === item ? " dt-pg-active" : ""}`}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                className="dt-pg-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

const subThStyle = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const subTdStyle = {
  padding: "12px 14px",
  fontSize: "14px",
  color: "#475569",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
};

export default QuestionTable;