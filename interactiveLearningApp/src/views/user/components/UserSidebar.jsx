import { useState } from "react";
import { Link } from "react-router-dom";
import userRoutes from "routeUser";

import logo from "assets/img/landing/ilps3small.png";
import logoFull from "assets/img/landing/ilps3.png";

export default function UserSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`${
        open ? "w-48" : "w-20"
      } bg-white min-h-screen shadow flex flex-col py-6 transition-all duration-300`}
    >

      {/* LOGO */}
      <div
        className="flex items-center justify-center cursor-pointer mb-10"
        onClick={() => setOpen(!open)}
      >
        <img
          src={open ? logoFull : logo}
          alt="ILPS Logo"
          className={`${open ? "h-14" : "h-10"} object-contain`}
        />
      </div>

      {/* MENU */}
      <div className="flex flex-col space-y-8 px-4">

        {userRoutes.map((route, index) => (
          <Link
            key={index}
            to={`${route.layout}/${route.path}`}
            className={`flex items-center ${
              open ? "gap-4" : "justify-center"
            } text-gray-500 hover:text-indigo-600 cursor-pointer`}
            onClick={() => setOpen(true)}
          >
            {route.icon}

            {open && (
              <span className="text-sm font-medium">
                {route.name}
              </span>
            )}
          </Link>
        ))}

      </div>

    </div>
  );
}