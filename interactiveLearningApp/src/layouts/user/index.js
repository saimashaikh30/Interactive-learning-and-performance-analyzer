import { Outlet } from "react-router-dom";
import UserSidebar from "views/user/components/UserSidebar";
import UserNavbar from "views/user/components/UserNavbar";
import Footer from "views/user/components/Footer";

export default function UserLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <UserSidebar />

      <div className="flex flex-col flex-1">
        <UserNavbar />

        <main className="flex-1 p-8">
          <Outlet />
        </main>

        <Footer />
      </div>

    </div>
  );
}