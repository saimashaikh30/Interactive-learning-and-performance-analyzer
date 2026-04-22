import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdMenu,
  MdStar,
  MdHome,
  MdQuiz,
  MdPeople,
  MdSettings,
  MdCode,
  MdPerson,
  MdLan,
} from "react-icons/md";

export default function UserSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { name: "Home", path: "/user/dashboard", icon: MdHome },

    { name: "Questions", path: "/user/userQuestions", icon: MdQuiz },
    // { name: "Contribute", path: "/user/contribute", icon: MdPeople },
    { name: "Profile", path: "/user/profile", icon: MdPerson },
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        color: "#1e52c2", // slate-900
        height: "100vh",
        width: collapsed ? "80px" : "260px",
        borderRight: "1px solid #e5e7eb",
        transition: "0.3s",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px",
          borderBottom: "1px solid #e5e7eb",
          alignItems: "center",
        }}
      >
        {!collapsed && (
          <span style={{ color: "#1e52c2", fontWeight: "bold" }}>
            User Panel
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: "#1e52c2",
            fontSize: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>

      {/* MENU */}
      <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px",
                borderRadius: "8px",
                textDecoration: "none",

                // 🔥 FORCE COLORS (IMPORTANT)
                backgroundColor: isActive ? "#2563eb" : "transparent",
                color: isActive ? "white" : "#063079",
              })}
            >
              {/* ICON */}
              <Icon size={22} color="currentColor" />

              {/* TEXT */}
              {!collapsed && (
                <span style={{ color: "inherit", fontWeight: 500 }}>
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}