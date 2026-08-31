import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

/* Landing Page */
import LandingPage from "../pages/public/LandingPage";

/* Auth Pages */
import Login from "../pages/auth/Login";
import StudentRegister from "../pages/auth/StudentRegister";
import MentorRegister from "../pages/auth/MentorRegister";

/* Layouts */
import AdminLayout from "../layouts/AdminLayout";
import MentorLayout from "../layouts/MentorLayout";
import StudentLayout from "../layouts/StudentLayout";
import SpocLayout from "../layouts/SpocLayout"; // NEW

/* Protected Route */
import ProtectedRoute from "./ProtectedRoute";

/* Common Pages */
import Unauthorized from "../pages/common/Unauthorized";
import NotFound from "../pages/common/NotFound";

/* Admin Pages */
import AdminDashboard from "../pages/admin/Dashboard";
import EventManagement from "../pages/admin/EventManagement";
import EventDetails from "../pages/admin/EventDetails";
import StudentManagement from "../pages/admin/StudentManagement";
import MentorManagement from "../pages/admin/MentorManagement";
import StatusTracking from "../pages/admin/StatusTracking";
import ViewSubmissions from "../pages/admin/ViewSubmissions";
import SpocManagement from "../pages/admin/SpocManagement";

/* Mentor Pages */
import MentorDashboard from "../pages/mentor/Dashboard";
import EventList from "../pages/mentor/EventList";
import ApprovalRequests from "../pages/mentor/ApprovalRequests";
import AssignedStudents from "../pages/mentor/AssignedStudents";

/* Student Pages */
import StudentDashboard from "../pages/student/Dashboard";
import StudentEventList from "../pages/student/EventList";
import RegisterHackathon from "../pages/student/RegisterHackathon";
import MyApplications from "../pages/student/MyApplications";
import MentorStatus from "../pages/student/MentorStatus";

/* SPOC Pages */
import SpocDashboard from "../pages/spoc/Dashboard"; // NEW
import SpocEventList from "../pages/spoc/EventList"; // NEW
import SpocStudentDetails from "../pages/spoc/StudentDetails"; // NEW
import SpocRegistrationApproval from "../pages/spoc/SpocRegistrationApproval"; // NEW

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/mentor-register" element={<MentorRegister />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ============================================================ */}
        {/* ADMIN + CO-ADMIN */}
        {/* ============================================================ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "coadmin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="events/manage" element={<EventDetails />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="mentors" element={<MentorManagement />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="status" element={<StatusTracking />} />
          <Route path="submissions" element={<ViewSubmissions />} />
          <Route path="spoc" element={<SpocManagement />} />
        </Route>

        {/* ============================================================ */}
        {/* MENTOR */}
        {/* ============================================================ */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="events" element={<EventList />} />
          <Route path="approvals" element={<ApprovalRequests />} />
          <Route path="students" element={<AssignedStudents />} />
        </Route>

        {/* ============================================================ */}
        {/* STUDENT */}
        {/* ============================================================ */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="events" element={<StudentEventList />} />
          <Route path="register" element={<RegisterHackathon />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="status" element={<MentorStatus />} />
        </Route>

        {/* ============================================================ */}
        {/* SPOC - NEW */}
        {/* ============================================================ */}
        <Route
          path="/spoc"
          element={
            <ProtectedRoute allowedRoles={["spoc"]}>
              <SpocLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SpocDashboard />} />
          <Route path="events" element={<SpocEventList />} />\
          <Route path="students" element={<SpocStudentDetails />} />
          <Route path="registrations" element={<SpocRegistrationApproval />} />
          {/* Add more SPOC-specific routes here in the future */}
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;