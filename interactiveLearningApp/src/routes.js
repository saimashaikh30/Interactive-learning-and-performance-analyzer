import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import Profile from "views/admin/profile";
import DataTables from "views/admin/tables";
import RTLDefault from "views/rtl/default";
import UserDashboard from "views/user/Dashboard";



// Auth Imports
import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";

// Icon Imports
import {
  MdHome,
  MdSettings,
  MdMenuBook,
  MdHelpOutline,
  MdBarChart,
  MdPerson,
  MdLock,
} from "react-icons/md";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },

  {
    name: "Users",
    layout: "/admin",
    path: "nft-marketplace",
    icon: <MdPerson className="h-6 w-6" />,
    //component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: "Subjects",
    layout: "/admin",
    icon: <MdMenuBook className="h-6 w-6" />,
    path: "data-tables",
    //component: <DataTables />,
  },
  {
    name: "Question Requests",
    layout: "/admin",
    path: "profile",
    icon: <MdHelpOutline className="h-6 w-6" />,
    //component: <Profile />,
  },
  
  {
    name: "Reports",
    layout: "/admin",
    path: "sign-up",
    icon: <MdBarChart className="h-6 w-6" />,
    //component: <SignUp />,
  },
  {
    name: "Settings",
    layout: "/admin",
    path: "reports",
    icon: <MdSettings className="h-6 w-6" />,
    //component: <RTLDefault />,
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    component: <SignIn />,
  },
  {
    name: "Sign Up",
    layout: "/auth",
    path: "sign-up",
    component: <SignUp />,
  },
];
export default routes;
