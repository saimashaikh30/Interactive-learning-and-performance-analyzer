import { Outlet, NavLink } from "react-router-dom";
import UserNavbar from "views/user/components/UserNavbar";
import Footer from "views/user/components/Footer";

export default function UserLayout() {
  const userRole = localStorage.getItem("role"); // assuming you store role like "user" or "contributor"

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      
      {/* Navbar */}
      <UserNavbar />

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}