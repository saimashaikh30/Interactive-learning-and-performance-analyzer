import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "layouts/user";
import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";

import AuthLayout from "layouts/auth";
import Login from "views/auth/SignIn";
import Register from "views/auth/SignUp";
import ForgotPassword from "views/auth/ForgotPassword";

import GuestHome from "./views/landing/GuestHome";
import UserDashboard from "views/user/UserDashboard";
import UserDomains from "views/user/UserDomains";
import UserSubjects from "views/user/UserSubjects";
import UserTopics from "views/user/UserTopics";

import RequireAuth from "./middleware/RequireAuth";

const App = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<GuestHome />} />
      {/* AUTH ROUTES */}
      <Route path="auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="sign-in" element={<Login />} />
        <Route path="sign-up" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Admin Middleware */}
      <Route element={<RequireAuth allowedRoles={["admin", "superadmin"]} />}>
        <Route path="admin/*" element={<AdminLayout />} />
      </Route>

      {/* User Middleware */}
      <Route element={<RequireAuth allowedRoles={["user"]} />}>
        <Route path="user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="domains"index element={<UserDomains />} />
          <Route path="subjects"index element={<UserSubjects />} />
          <Route path="topics"index element={<UserTopics />} />
        </Route>
      </Route>

      {/* RTL (optional protected) */}
      <Route path="rtl/*" element={<RtlLayout />} />

    </Routes>
  );
};

export default App;
