import {
  FaHome,
  FaUserCheck,
  FaUsers,
  FaClipboardCheck,
} from "react-icons/fa";

export const mentorMenu = [
  {
    name: "Dashboard",
    path: "/mentor/dashboard",
    icon: FaHome,
  },
  {
    name: "Events",
    path: "/mentor/events", 
    icon: FaClipboardCheck,
  },
  {
  name: "Submissions",
  path: "/mentor/approvals",
  icon: FaUserCheck,
},
{
  name: "Students",
  path: "/mentor/students",
  icon: FaUsers,
},
];