import { useEffect, useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { MdPersonOutline } from "react-icons/md";
import Dropdown from "components/dropdown";
import { NavLink } from "react-router-dom";
import logo from "assets/img/landing/ilps3.png";

export default function UserNavbar() {
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("user_name") || "User"
  );
  // 🔥 Sync role from localStorage (important)
  useEffect(() => {
  const syncUser = () => {
    setUserRole(localStorage.getItem("role"));
    setDisplayName(localStorage.getItem("user_name") || "User");
  };

  syncUser();

  window.addEventListener("storage", syncUser);

  return () => {
    window.removeEventListener("storage", syncUser);
  };
}, []);

  return (
    <div className="flex items-center justify-between bg-white shadow-md px-6 py-1 sticky top-0 z-50">
      
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-6">
        <img src={logo} alt="ILPS" className="h-20 w-30 object-contain" />

        <div className="relative flex-1 max-w-xs">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        
        {/* Tabs */}
        <div className="flex gap-6">
          <NavLink
            to="/user/dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-1 font-semibold"
                : "text-gray-700 hover:text-blue-500 pb-1 font-medium"
            }
          >
            Home
          </NavLink>

          {/* ✅ Conditional tab */}
          {userRole === "contributor" && (
            <NavLink
              to="/user/contribute"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1 font-semibold"
                  : "text-gray-700 hover:text-blue-500 pb-1 font-medium"
              }
            >
              Contribute
            </NavLink>
          )}
        </div>

        {/* Notification */}
        <FaBell className="text-gray-500 hover:text-blue-500 cursor-pointer transition" />

        {/* Profile */}
        <Dropdown
          button={
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <MdPersonOutline className="h-6 w-6" />
              </div>
              <span className="font-medium">User</span>
            </div>
          }
          children={
            <div className="flex w-56 flex-col rounded-[20px] bg-white shadow-xl">
              <div className="p-4">
                <p className="text-sm font-bold text-gray-700">👋 Hey, {displayName}</p>
              </div>
              <div className="h-px w-full bg-gray-200" />
              <div className="flex flex-col p-4">
                <a
                  href="/user/profile"
                  className="text-sm text-gray-800 hover:text-blue-500"
                >
                  Profile Settings
                </a>
                <a
                  href="/auth/sign-in"
                  className="mt-3 text-sm font-medium text-red-500 hover:text-red-600 transition"
                >
                  Log Out
                </a>
              </div>
            </div>
          }
          classNames={"py-2 top-12 -left-[180px] w-max"}
        />
      </div>
    </div>
  );
}