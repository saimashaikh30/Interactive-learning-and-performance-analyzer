import React from "react";
import UserDashboard from "views/user/Dashboard";
import {
  MdHome,
  MdMenuBook,
  MdFavorite,
  MdLogout,
} from "react-icons/md";

const userRoutes = [
  {
    name: "Dashboard",
    layout: "/user",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <UserDashboard />,
  },
  {
    name: "Subjects",
    layout: "/user",
    path: "subjects",
    icon: <MdMenuBook className="h-6 w-6" />,
  },
  {
    name: "Favorites",
    layout: "/user",
    path: "favorites",
    icon: <MdFavorite className="h-6 w-6" />,
  },
  {
    name: "Logout",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLogout className="h-6 w-6" />,
  },
];

export default userRoutes;
