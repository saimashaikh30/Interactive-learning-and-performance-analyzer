import { Outlet } from "react-router-dom";
import { useState } from "react";

import UserNavbar from "views/user/components/UserNavbar";
import UserSidebar from "views/user/components/UserSidebar";
import Footer from "views/user/components/Footer";

export default function UserLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#e0f2fe] to-[#60a5fa] overflow-hidden">

      {/* SIDEBAR */}
      <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* NAVBAR */}
        <UserNavbar />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ collapsed, setCollapsed }} />
        </main>

        <Footer />
      </div>
    </div>
  );
}