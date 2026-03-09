import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import Subjects from "views/admin/subjects";
import Topics from "views/admin/topics";
import Domains from "views/admin/domains";
import User from "views/admin/user";
import ContributorRequests from "views/admin/contributorRequests";
import RTLDefault from "views/rtl/default";




// Auth Imports
import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";
import ForgotPassword from "views/auth/ForgotPassword";

// Icon Imports
import {
  MdHome,
  MdPeople,
  MdAssignmentTurnedIn,
  MdMenuBook,
  MdCategory,
  MdQuiz,
  MdBarChart,
  MdSettings,
  MdLayers,
  MdAdminPanelSettings,
} from "react-icons/md";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
    roles: ["admin", "super_admin"],
  },

  {
    name: "Users",
    layout: "/admin",
    path: "users",
    icon: <MdPeople className="h-6 w-6" />,
    component: <User />,
    roles: ["admin", "super_admin"],
  },

  {
    name: "Contributor Requests",
    layout: "/admin",
    path: "contributor-requests",
    icon: <MdAssignmentTurnedIn className="h-6 w-6" />,
    component: <ContributorRequests/>,
    roles: ["admin", "super_admin"],
  },

  {
    name: "Domains",
    layout: "/admin",
    path: "domains",
    icon: <MdLayers className="h-6 w-6" />,
    component: <Domains />,
    roles: ["admin", "super_admin"],
  },

  {
    name: "Subjects",
    layout: "/admin",
    path: "subjects",
    icon: <MdMenuBook className="h-6 w-6" />,
    component: <Subjects />,
    roles: ["admin", "super_admin"],
  },

  {
    name: "Topics",
    layout: "/admin",
    path: "topics",
    component: <Topics />,
    icon: <MdCategory className="h-6 w-6" />,
    roles: ["admin", "super_admin"],
  },

  {
    name: "Questions",
    layout: "/admin",
    path: "questions",
    icon: <MdQuiz className="h-6 w-6" />,
    roles: ["admin", "super_admin"],
  },

  {
    name: "Admin Management",
    layout: "/admin",
    path: "manage_admin",
    icon: <MdAdminPanelSettings className="h-6 w-6" />,
    roles: ["super_admin"],
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
  {
    name: "Forgot Password",
    layout: "/auth",
    path: "forgot-password",
    component: <ForgotPassword />,
  }
];
export default routes;
