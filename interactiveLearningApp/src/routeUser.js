import React from "react";

// User Imports (FOLDER-BASED ✔)
import UserDashboard from "views/user/dashboard/index";

// Icon Imports
import {
  MdHome,
  MdMenuBook,
  MdBarChart,
  MdPerson,
} from "react-icons/md";

const userRoutes = [
  {
    name: "Dashboard",
    layout: "/user",
    path: "dashboard",
    icon: <MdHome className="h-6 w-6" />,
    component: <UserDashboard />,
    roles: ["user"],
  },
  {
    name: "Subjects",
    layout: "/user",
    path: "subjects",
    icon: <MdMenuBook className="h-6 w-6" />,
    component: <div>Subjects Page</div>,
    roles: ["user"],
  },
  {
    name: "Progress",
    layout: "/user",
    path: "progress",
    icon: <MdBarChart className="h-6 w-6" />,
    component: <div>Progress Page</div>,
    roles: ["user"],
  },
  {
    name: "Profile",
    layout: "/user",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <div>User Profile</div>,
    roles: ["user"],
  },
];

export default userRoutes;