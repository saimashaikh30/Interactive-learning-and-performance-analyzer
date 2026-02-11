import React from "react";
import { Outlet } from "react-router-dom";

const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md">
        <h1 className="text-2xl font-bold text-indigo-600">
          Interactive Learning
        </h1>

        <div className="space-x-6">
          <a href="#features" className="hover:text-indigo-600">Features</a>
          <a href="#about" className="hover:text-indigo-600">About</a>
          <a href="/auth/sign-in" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Login
          </a>
        </div>
      </nav>

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 mt-10">
        © {new Date().getFullYear()} Interactive Learning & Performance System
      </footer>

    </div>
  );
};

export default LandingLayout;
