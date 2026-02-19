import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "layouts/user";
import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";

import GuestHome from "./views/landing/GuestHome";

const App = () => {
  return (
    <Routes>

      {/* Landing Page */}
      <Route path="/" element={<GuestHome />} />

      {/* Auth */}
      <Route path="auth/*" element={<AuthLayout />} />

      {/* Admin */}
      <Route path="admin/*" element={<AdminLayout />} />

      {/* RTL */}
      <Route path="rtl/*" element={<RtlLayout />} />
    <Route path="user/*" element={<UserLayout />} />

    </Routes>
  );
};

export default App;
