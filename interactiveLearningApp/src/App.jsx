import React from "react";
import { Routes, Route } from "react-router-dom";

import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import LandingLayout from "layouts/landing";
import Home from "views/landing/Home";

const App = () => {
  return (
    <Routes>

      {/* Landing Page */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<Home />} />
      </Route>

      {/* Auth */}
      <Route path="auth/*" element={<AuthLayout />} />

      {/* Admin */}
      <Route path="admin/*" element={<AdminLayout />} />

      {/* RTL */}
      <Route path="rtl/*" element={<RtlLayout />} />

    </Routes>
  );
};

export default App;
