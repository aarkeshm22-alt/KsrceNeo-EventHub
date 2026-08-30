import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaTimes,
  FaUser,
  FaUsers,
  FaLightbulb,
  FaClock,
  FaInbox,
  FaSpinner,
  FaEye,
  FaTimes as FaXmark,
  FaUserTie,
  FaHashtag,
  FaCalendar,
  FaCommentDots,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ApprovalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drawer state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ----------------------------------------------------------------
  // Get logged‑in mentor's full name
  // ----------------------------------------------------------------
  const getMentorFullName = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.firstName || user.lastName) {
          return `${user.firstName || ""} ${user.lastName || ""}`.trim();
        }
        if (user.name) return user.name.trim();
      } catch (e) {
        // ignore
      }
    }
    const rawName =
      localStorage.getItem("mentorName") ||
      localStorage.getItem("name") ||
      localStorage.getItem("userName");
    if (rawName) return rawName.trim();
    return "";
  };

  const mentorName = getMentorFullName();
  const token = localStorage.getItem("token") || "";

  // ----------------------------------------------------------------
  // Fetch requests
  // ----------------------------------------------------------------
  const fetchRequests = async () => {
    if (!mentorName) {
      setError("Your mentor name could not be resolved. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://ksrceneo-eventhub.onrender.com/api/registrations/personal-mentor-requests?mentorName=${encodeURIComponent(mentorName)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setRequests(result.data || []);
      } else {
        setError(result.message || "Failed to fetch your assigned student submissions.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error: Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [mentorName]);

  // ----------------------------------------------------------------
  // Update status
  // ----------------------------------------------------------------
  const updateStatus = async (id, finalStatus) => {
    try {
      const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/registrations/update-status/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: finalStatus }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRequests((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: finalStatus } : item))
        );
      } else {
        alert(result.message || "Could not update status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Network error while updating status.");
    }
  };

  // ----------------------------------------------------------------
  // Drawer handlers
  // ----------------------------------------------------------------
  const openDrawer = (request) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRequest(null);
  };

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 space-y-6">
      {/* HEADER – removed pending reviews badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Mentee Requests
            </h1>
            {mentorName && (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-blue-200">
                {mentorName}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review submissions from students who have listed you as their personal mentor.
          </p>
        </div>
        {/* No pending count badge anymore */}
      </div>

      {/* MAIN TABLE */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <FaSpinner size={24} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fetching your mentees' submissions...</p>
        </div>
      ) : error ? (
        <div className="border border-red-200 bg-red-50/50 p-6 rounded-2xl text-center text-xs font-medium text-red-700">
          {error}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                {/* ✅ FIX: all <th> on one line to avoid whitespace text nodes */}
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th className="py-4 px-4">Student</th>
                  <th className="py-4 px-4">Event / Project</th>
                  <th className="py-4 px-4">Team</th>
                  <th className="py-4 px-4 hidden md:table-cell">Dept SPOC</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                  <th className="py-4 px-4 text-center w-12">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                <AnimatePresence mode="popLayout">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FaInbox size={32} className="text-slate-300" />
                          <p className="text-sm font-bold text-slate-700">No submissions from your mentees</p>
                          <p className="text-xs text-slate-400 max-w-xs">
                            Students have not yet submitted any registrations with you as their personal mentor.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requests.map((item, idx) => {
                      const studentName = item.leadName || item.createdBy?.name || "Unknown";
                      const eventName = item.eventId?.eventName || "Unknown Event";
                      const projectTitle = item.projectTitle || "Untitled";
                      const teamName = item.teamName || "Unnamed";
                      const isPending = item.status === "Pending Approval" || item.status === "Pending";
                      const spocName = item.departmentMentor?.name || "Not Assigned";

                      return (
                        <motion.tr
                          key={item._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-slate-50/50 group transition-colors"
                        >
                          <td className="py-4 px-4 text-center font-bold text-slate-300 w-12">
                            {idx + 1}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                                <FaUser size={12} />
                              </div>
                              <span className="font-semibold text-slate-800">{studentName}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{eventName}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <FaLightbulb size={10} className="text-slate-400" />
                                {projectTitle}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <FaUsers size={12} className="text-slate-400" />
                              <span className="text-slate-700">{teamName}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 hidden md:table-cell">
                            <span className="text-slate-600 text-xs">{spocName}</span>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                                item.status
                              )}`}
                            >
                              {item.status || "Pending Approval"}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center">
                            {isPending ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => updateStatus(item._id, "Rejected")}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                  title="Reject"
                                >
                                  <FaTimes size={14} />
                                </button>
                                <button
                                  onClick={() => updateStatus(item._id, "Approved")}
                                  className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                                  title="Approve"
                                >
                                  <FaCheck size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Done</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => openDrawer(item)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-blue-600 group"
                              title="View full details"
                            >
                              <FaEye size={16} className="transition-transform group-hover:scale-110" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DETAIL DRAWER */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isDrawerOpen && selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 cursor-pointer"
            />

            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 160 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Request Details</h3>
                  <p className="text-xs text-slate-400 font-medium">Complete submission information</p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <FaXmark size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-5 py-6">
                {/* Event & Project */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaHashtag className="text-blue-500" /> Event & Project
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Event Name</p>
                      <p className="font-bold text-slate-900">{selectedRequest.eventId?.eventName || "Unknown Event"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Event ID</p>
                      <p className="font-mono font-bold text-slate-700">{selectedRequest.eventId?.customEventId || selectedRequest.eventId?.code || selectedRequest.eventId || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Description</p>
                      <p className="text-slate-700 text-sm">{selectedRequest.eventId?.description || "No description provided."}</p>
                    </div>
                  </div>
                </div>

                {/* Project & Team */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUserTie className="text-blue-500" /> Project & Team
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Project Title</p>
                      <p className="font-bold text-slate-900">{selectedRequest.projectTitle || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Domain</p>
                      <p className="font-bold text-slate-700">{selectedRequest.projectDomain || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Team Name</p>
                      <p className="font-bold text-slate-900">{selectedRequest.teamName || "Unnamed Team"}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Mentors (NEW) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUserTie className="text-blue-500" /> Assigned Mentors
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Department SPOC</p>
                      <p className="font-bold text-slate-900">{selectedRequest.departmentMentor?.name || "Not Assigned"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Personal Mentor</p>
                      <p className="font-bold text-slate-900">{selectedRequest.personalMentor || "Not Specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Team Lead */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUserTie className="text-blue-500" /> Team Lead
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Name</p>
                      <p className="font-bold text-slate-900">{selectedRequest.leadName || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                      <p className="font-mono text-xs text-slate-700 truncate">{selectedRequest.leadEmail || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                      <p className="font-bold text-slate-700">{selectedRequest.leadPhone || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Year</p>
                      <p className="font-bold text-slate-700">{selectedRequest.year || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Section</p>
                      <p className="font-bold text-slate-700">{selectedRequest.section || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUsers className="text-blue-500" /> Team Members
                  </h4>
                  {selectedRequest.members && selectedRequest.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedRequest.members.map((member, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                          <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                            <span>Reg: {member.regNo}</span>
                            <span>Dept: {member.department}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No members listed.</p>
                  )}
                </div>

                {/* Status & Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaCalendar className="text-blue-500" /> Status & Timeline
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        selectedRequest.status
                      )}`}>
                        {selectedRequest.status || "Pending Approval"}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted</p>
                      <p className="font-bold text-slate-700">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Last Updated</p>
                      <p className="font-bold text-slate-700">{formatDate(selectedRequest.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaCommentDots className="text-blue-500" /> Remarks
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700">{selectedRequest.review || selectedRequest.remarks || "No remarks."}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
                Request ID: {selectedRequest._id || "N/A"}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApprovalRequests;