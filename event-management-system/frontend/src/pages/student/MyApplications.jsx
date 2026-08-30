import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaRegFolderOpen,
  FaCircleCheck,
  FaCircleDot,
  FaCircleXmark,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaHashtag,
  FaChalkboardUser,
  FaEye,
  FaEyeSlash,
  FaXmark,
  FaCalendar,
  FaCircle,
  FaCommentDots,
} from "react-icons/fa6";

const MyApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Open drawer with selected application
  const openDrawer = (app) => {
    setSelectedApplication(app);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedApplication(null);
  };

  useEffect(() => {
    const fetchStudentRegistrations = async () => {
      try {
        setIsLoading(true);
        const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

        const currentUserId = localStorage.getItem("userId") || "6a27f5ff1b3ae178a3954aba";
        const fetchPromise = fetch(
          `https://ksrceneo-eventhub.onrender.com/api/registrations/my-submissions?userId=${currentUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        const [response] = await Promise.all([fetchPromise, minDelay]);

        const result = await response.json();
        if (response.ok && result.success) {
          setApplications(result.data || []);
        } else {
          setError(result.message || "Failed to load submission data nodes.");
        }
      } catch (err) {
        console.error("Pipeline synchronization drop error:", err);
        setError("Network Connection Refused: Verify backend server is alive.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentRegistrations();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ------------------------------------------------------------------
  // Skeleton Loader Component
  // ------------------------------------------------------------------
  const SkeletonRow = ({ index }) => (
    <tr className="animate-pulse">
      <td className="py-4 px-6 text-center">
        <div className="h-4 w-6 bg-slate-200 rounded mx-auto"></div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-200 rounded"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
          <div className="h-3 w-40 bg-slate-200 rounded"></div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-2">
          <div className="h-5 w-28 bg-slate-200 rounded"></div>
          <div className="h-4 w-36 bg-slate-200 rounded"></div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded"></div>
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
      </td>
      <td className="py-4 px-6 text-center">
        <div className="h-6 w-6 bg-slate-200 rounded-lg mx-auto"></div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and audit active submission tracks, reference identities, and team approvals
          </p>
        </div>
        {!isLoading && !error && (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 align-middle self-start sm:self-auto">
            COUNT: {applications.length} ACTIVE
          </span>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold text-center w-16">S.No</th>
                  <th className="py-4 px-6 font-semibold">Event</th>
                  <th className="py-4 px-6 font-semibold">Team</th>
                  <th className="py-4 px-6 font-semibold">SPOC</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-center w-12">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...Array(5)].map((_, idx) => (
                  <SkeletonRow key={idx} index={idx} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
            Loading your applications...
          </div>
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto border border-red-200 bg-red-50/50 p-6 rounded-2xl text-center text-xs font-medium text-red-700">
          {error}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold text-center w-16">S.No</th>
                  <th className="py-4 px-6 font-semibold">Event</th>
                  <th className="py-4 px-6 font-semibold">Team</th>
                  <th className="py-4 px-6 font-semibold">SPOC</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-center w-12">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {applications.map((item, index) => {
                  const eventName = item.eventDetails?.title || "Unknown Event";
                  const eventId = item.eventDetails?.customEventId || item.eventId || "N/A";

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="py-4 px-6 text-center font-mono font-medium text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {eventName}
                          </p>
                          <div className="flex flex-col gap-0.5 text-[11px] text-slate-400">
                            <span className="font-medium text-slate-500">{item.projectTitle}</span>
                            <div className="flex items-center gap-2">
                              <span>ID: {eventId}</span>
                              <span>•</span>
                              <span>Filed: {formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">{item.teamName}</p>
                          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                            <FaUserTie size={10} className="text-slate-400 shrink-0" />
                            <span className="text-slate-500 font-medium">Lead: {item.leadName}</span>
                            <span>({item.year} - Sec {item.section})</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs">
                          {item.departmentMentor && item.departmentMentor._id !== item.createdBy ? (
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-700">{item.departmentMentor.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{item.departmentMentor.email}</p>
                            </div>
                          ) : (
                            <span className="inline-block bg-slate-100 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200 border-dashed">
                              Assigned on Review
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            item.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : item.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {item.status === "Approved" ? (
                            <FaCircleCheck size={11} className="text-emerald-500" />
                          ) : item.status === "Rejected" ? (
                            <FaCircleXmark size={11} className="text-rose-500" />
                          ) : (
                            <FaCircleDot size={10} className="text-amber-500 animate-pulse" />
                          )}
                          <span>{item.status || "Pending Approval"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openDrawer(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-blue-600 group"
                          title="View full details"
                        >
                          <FaEye size={16} className="transition-transform group-hover:scale-110" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty State */}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 px-6 text-center space-y-2">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                        <FaRegFolderOpen size={16} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No submission histories found</p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        You are currently not enrolled in any current or upcoming events. Navigate to the{' '}
                        <span
                          onClick={() => navigate('/student/events')}
                          className="text-blue-500 hover:underline cursor-pointer font-medium"
                        >
                          Event Page
                        </span>{' '}
                        to explore the available events and submit your application.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* DETAIL DRAWER */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isDrawerOpen && selectedApplication && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 cursor-pointer"
            />

            {/* Drawer Panel */}
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
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Application Details</h3>
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
                      <p className="font-bold text-slate-900">{selectedApplication.eventDetails?.title || "Unknown Event"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Event ID</p>
                      <p className="font-mono font-bold text-slate-700">{selectedApplication.eventDetails?.customEventId || selectedApplication.eventId || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Description</p>
                      <p className="text-slate-700 text-sm">{selectedApplication.eventDetails?.description || "No description provided."}</p>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUserTie className="text-blue-500" /> Project & Team
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Project Title</p>
                      <p className="font-bold text-slate-900">{selectedApplication.projectTitle || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Domain</p>
                      <p className="font-bold text-slate-700">{selectedApplication.projectDomain || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Team Name</p>
                      <p className="font-bold text-slate-900">{selectedApplication.teamName || "Unnamed Team"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Personal Mentor</p>
                      <p className="font-bold text-slate-700">{selectedApplication.personalMentor || "Not Specified"}</p>
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
                      <p className="font-bold text-slate-900">{selectedApplication.leadName || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                      <p className="font-mono text-xs text-slate-700 truncate">{selectedApplication.leadEmail || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                      <p className="font-bold text-slate-700">{selectedApplication.leadPhone || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Year</p>
                      <p className="font-bold text-slate-700">{selectedApplication.year || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Section</p>
                      <p className="font-bold text-slate-700">{selectedApplication.section || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUsers className="text-blue-500" /> Team Members
                  </h4>
                  {selectedApplication.members && selectedApplication.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedApplication.members.map((member, idx) => (
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

                {/* Mentor */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaChalkboardUser className="text-blue-500" /> Assigned Mentors
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Department Mentor (SPOC)</p>
                      <p className="font-bold text-slate-900">{selectedApplication.departmentMentor?.name || "Not Assigned"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Personal Mentor</p>
                      <p className="font-bold text-slate-900">{selectedApplication.personalMentor || "Not Specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Timestamps */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaCalendar className="text-blue-500" /> Status & Timeline
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                        ${selectedApplication.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          selectedApplication.status?.includes("Pending") ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-rose-50 text-rose-600 border-rose-100"}`}>
                        <FaCircle size={4} className={selectedApplication.status?.includes("Pending") ? "animate-pulse" : ""} />
                        {selectedApplication.status || "Pending Approval"}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted</p>
                      <p className="font-bold text-slate-700">{formatDateTime(selectedApplication.createdAt)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Last Updated</p>
                      <p className="font-bold text-slate-700">{formatDateTime(selectedApplication.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Remarks (if any) */}
                {(selectedApplication.review || selectedApplication.remarks) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <FaCommentDots className="text-blue-500" /> Remarks
                    </h4>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-700">{selectedApplication.review || selectedApplication.remarks}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
                Application ID: {selectedApplication._id || "N/A"}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyApplications;