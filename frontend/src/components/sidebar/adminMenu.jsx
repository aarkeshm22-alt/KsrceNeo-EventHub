import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaBriefcase
} from "react-icons/fa";

export const adminMenu = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: FaHome,
  },
  {
    name: "Events",
    path: "/admin/events",
    icon: FaCalendarAlt,
  },
  {
    name: "Students",
    path: "/admin/students",
    icon: FaUsers,
  },
  {
    name: "Mentors",
    path: "/admin/mentors",
    icon: FaUsers,
  },
  {
    name: "Spoc",
    path: "/admin/spoc",
    icon: FaUsers
  },
  {
    name: "Submissions",
    path: "/admin/submissions",
    icon: FaBriefcase
  }
];