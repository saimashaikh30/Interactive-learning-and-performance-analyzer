import React from "react";

// Pages
import UserDashboard from "views/user/UserDashboard";
import UserDomains from "views/user/UserDomains";
import UserSubjects from "views/user/UserSubjects";
import UserTopics from "views/user/UserTopics";

// Icons (same meaning as sidebar)
import { FaHome, FaBook, FaUserPlus, FaLaptopCode, FaListAlt } from "react-icons/fa";

const userRoutes = [
  {
    name: "Home",
    layout: "/user",
    path: "",
    icon: <FaHome className="h-5 w-5" />,
    component: <UserDashboard/>,
    roles: ["user"],
  },
  {
    name: "Domains",
    layout: "/user",
    path: "domains",
    icon: <FaLaptopCode className="h-5 w-5" />,
    component: <UserDomains/>,
    roles: ["user"],
  },
  {
    name: "Subjects",
    layout: "/user",
    path: "subjects",
    icon: <FaBook className="h-5 w-5" />,
    component: <UserSubjects/>,
    roles: ["user"],
  },
  {
    name: "Topics",
    layout: "/user",
    path: "topics",
    icon: <FaListAlt className="h-5 w-5" />,
    component: <UserTopics/>,
    roles: ["user"],
  },
  {
    name: "Contributor Request",
    layout: "/user",
    path: "contributor-request",
    icon: <FaUserPlus className="h-5 w-5" />,
    component: () => <div>Contributor Request Page</div>,
    roles: ["user"],
  },
];

export default userRoutes;