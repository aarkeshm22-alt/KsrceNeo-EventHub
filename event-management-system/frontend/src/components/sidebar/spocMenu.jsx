// src/components/sidebar/spocMenu.js
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa";

export const spocMenu = [
  {
    name: "Dashboard",
    path: "/spoc/dashboard",
    icon: FaHome,
  },
  {
    name: "Events",
    path: "/spoc/events",
    icon: FaCalendarAlt,
  },
  {
    name: "Students",
    path: "/spoc/students",
    icon: FaUsers,
  },
  {
    name: "Registrations",
    path: "/spoc/registrations",
    icon: FaClipboardList,
  },
];