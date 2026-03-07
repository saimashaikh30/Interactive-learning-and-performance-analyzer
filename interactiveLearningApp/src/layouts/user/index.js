import React from "react";
import Dropdown from "components/dropdown";
import { MdPersonOutline } from "react-icons/md";
import { Outlet, Link, useLocation } from "react-router-dom";

const UserLayout = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "text-brand-500 border-brand-500"
      : "text-gray-600 border-transparent hover:text-gray-900";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            to="/user"
            className="text-lg font-semibold text-gray-900"
          >
            Interactive Learning
          </Link>

          {/* Nav Links */}
          <nav className="flex gap-6 text-sm font-medium">
            <Link
              to="/user"
              className={`border-b-2 pb-1 ${isActive("/user/dashboard")}`}
            >
              Home
            </Link>

            <Link
              to="/user/subjects"
              className={`border-b-2 pb-1 ${isActive("/user/subjects")}`}
            >
              Subjects
            </Link>

            <Link
              to="/user/practice"
              className={`border-b-2 pb-1 ${isActive("/user/practice")}`}
            >
              Practice
            </Link>

            <Link
              to="/user/progress"
              className={`border-b-2 pb-1 ${isActive("/user/progress")}`}
            >
              Progress
            </Link>
          </nav>

          

          {/* Profile & Dropdown */}
        <Dropdown
          button={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
              <MdPersonOutline className="h-6 w-6" />
            </div>
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    Adela
                  </p>{" "}
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="flex flex-col p-4">
                <a
                  href=" "
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </a>

                <a
                  href="/auth/sign-in"
                  className="mt-3 text-sm font-medium text-red-500 hover:text-red-500 transition duration-150 ease-out hover:ease-in"
                >
                  Log Out
                </a>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;