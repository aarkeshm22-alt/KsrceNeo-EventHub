import {
  FaHome,
  FaClipboardList,
  FaCalendarAlt,
  FaUserCheck,
} from "react-icons/fa";

export const studentMenu = [
  {
    name: "Dashboard",
    path: "/student/dashboard",
    icon: FaHome,
  },
  {
  name: "Events",
  path: "/student/events",
  icon: FaCalendarAlt,
},
{
  name: "Applications",
  path: "/student/applications",
  icon: FaClipboardList,
},
{
  name: "SPOC Status",
  path: "/student/status",
  icon: FaUserCheck,
}
];