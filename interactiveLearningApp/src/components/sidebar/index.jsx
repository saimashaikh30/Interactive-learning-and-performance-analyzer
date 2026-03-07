/* eslint-disable */

import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import logo from "assets/img/landing/logo.png";
import routes from "routes.js";

const Sidebar = ({ open, onClose }) => {
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-black/10 transition-all dark:!bg-navy-800 dark:text-white
      ${open ? "translate-x-0" : "-translate-x-96"}`}
    >
      {/* Close Button */}
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden text-white"
        onClick={onClose}
      >
        <HiX />
      </span>

      {/* ===== LOGO SECTION (BLUE BACKGROUND) ===== */}
      <div className="bg-[#0F1E44] px-8 pt-10 pb-6">
        <div className="flex items-center justify-center">
          <img
            src={logo}
            alt="ILPS Logo"
            className="h-20 object-contain"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-blue-200 dark:bg-white/20" />

      {/* ===== MENU SECTION (WHITE BACKGROUND) ===== */}
      <ul className="mb-auto pt-6 px-4">
        <Links routes={routes} />
      </ul>

    </div>
  );
};

export default Sidebar;