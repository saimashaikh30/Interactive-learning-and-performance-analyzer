import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import Subjects from "views/admin/subjects";
import Topics from "views/admin/topics";
import Domains from "views/admin/domains";
import Companies from "views/admin/companies";
import Questions from "views/admin/questions";
import AdminManagement from "views/admin/adminManagement";
import AddQuestion from "views/admin/questions/AddQuestion";
import User from "views/admin/user";
import Profile from "views/user/Profile";
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
  MdBusiness,
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
    roles: ["admin", "superadmin"],
  },

  {
    name: "Users",
    layout: "/admin",
    path: "users",
    icon: <MdPeople className="h-6 w-6" />,
    component: <User />,
    roles: ["admin", "superadmin"],
  },

  {
    name: "Contributor Requests",
    layout: "/admin",
    path: "contributor-requests",
    icon: <MdAssignmentTurnedIn className="h-6 w-6" />,
    component: <ContributorRequests/>,
    roles: ["admin", "superadmin"],
  },

  {
    name: "Domains",
    layout: "/admin",
    path: "domains",
    icon: <MdLayers className="h-6 w-6" />,
    component: <Domains />,
    roles: ["admin", "superadmin"],
  },

  {
    name: "Subjects",
    layout: "/admin",
    path: "subjects",
    icon: <MdMenuBook className="h-6 w-6" />,
    component: <Subjects />,
    roles: ["admin", "superadmin"],
  },

  {
    name: "Topics",
    layout: "/admin",
    path: "topics",
    component: <Topics />,
    icon: <MdCategory className="h-6 w-6" />,
    roles: ["admin", "superadmin"],
  },

  {
    name: "Questions",
    layout: "/admin",
    path: "questions",
    component: <Questions />,
    icon: <MdQuiz className="h-6 w-6" />,
    roles: ["admin", "superadmin"],
  },
  {
    name: "Add Question",
    layout: "/admin",
    path: "questions/add",
    component: <AddQuestion />,
    icon: <MdQuiz className="h-6 w-6" />,
    roles: ["admin", "superadmin"],
    hidden: true
  },
  {
    name: "Edit Question",
    layout: "/admin",
    path: "questions/edit/:id",
    component: <AddQuestion />, // same component handles edit via id param
    icon: <MdQuiz className="h-6 w-6" />,
    roles: ["admin", "superadmin"],
    hidden:true
  },
  {
    name: "Companies",
    layout: "/admin",
    path: "companies",
    icon: <MdBusiness className="h-6 w-6" />,
    component: <Companies />,
    roles: ["admin", "superadmin"],
  },

{
  name: "Profile",
  layout: "/admin",
  path: "profile",
  component: <Profile />,
  roles: ["admin", "superadmin"],
  hidden: true,
},
  {
    name: "Admin Management",
    layout: "/admin",
    path: "manage_admin",
    component: <AdminManagement />,
    icon: <MdAdminPanelSettings className="h-6 w-6" />,
    roles: ["superadmin"],
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
