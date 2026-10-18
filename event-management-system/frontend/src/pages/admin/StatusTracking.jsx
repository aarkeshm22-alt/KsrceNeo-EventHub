import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaFlag,
  FaClipboardCheck,
  FaTimesCircle,
  FaCalendarAlt,
  FaUserAlt,
  FaExclamationCircle,
  FaArrowLeft
} from "react-icons/fa";

const StatusTracking = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dynamic timeline events from your backend database pool
  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      // Fetches registrations (using your global route or fallback route)
      const response = await axios.get("https://ksrceneo-eventhub.onrender.com/api/registrations");

      // Ensure data is array before updating pipeline nodes
      const data = Array.isArray(response.data) ? response.data : [];
      setRegistrations(data);
    } catch (err) {
      console.error("Error pulling database lifecycle matrices:", err);
      setError("Failed to load live pipeline tracking streams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  // 🛠️ HELPER OBJECT ENGINE: Maps dynamic status fields to visual theme sets
  const getStatusConfiguration = (statusStr) => {
    const status = statusStr?.toLowerCase() || "pending";

    switch (status) {
      case "approved":
      case "shortlisted":
        return {
          label: "Approved",
          icon: FaClipboardCheck,
          color: "bg-emerald-50 border-emerald-200 text-emerald-600",
          description: "Vetting complete. Institutional configurations and team credentials successfully authorized by review nodes."
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: FaTimesCircle,
          color: "bg-rose-50 border-rose-200 text-rose-600",
          description: "Application denied evaluation criteria requirements. Check institutional documentation guidelines."
        };
      case "pending":
      default:
        return {
          label: "Pending Review",
          icon: FaFlag,
          color: "bg-amber-50 border-amber-200 text-amber-600",
          description: "Initial pipeline validation complete. Awaiting administrative verification and mentor approval routing."
        };
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] w-full flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Querying Tracking Pipelines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[40vh] w-full flex flex-col items-center justify-center gap-2 text-rose-500 bg-rose-50/50 border border-rose-100 rounded-2xl p-6 max-w-xl mx-auto">
        <FaExclamationCircle size={24} />
        <p className="text-sm font-bold tracking-tight">{error}</p>
        <button onClick={fetchTrackingData} className="mt-2 text-xs font-bold bg-white text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-rose-50 cursor-pointer">Retry Stream Connection</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* SECTION 1: MASTER CONSOLE HEADER TIMELINE PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Telemetry Lifecycles
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Status Tracking
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Audit chronological milestones, vetting results, and lifecycle transitions.
          </p>
        </div>
        
        {/* BACK NAVIGATION BUTTON */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <FaArrowLeft className="text-slate-400 group-hover:-translate-x-0.5 group-hover:text-blue-600 transition-all" size={12} />
          Back to Dashboard
        </button>
      </div>

      {/* SECTION 2: VERTICAL PIPELINE PIPING FRAMEWORK */}
      <div className="relative max-w-3xl mx-auto pl-4 sm:pl-8 pr-2 py-4">

        {/* Core Timeline Vertical Structural Connecting Column */}
        {registrations.length > 0 && (
          <div className="absolute top-0 bottom-0 left-[34px] sm:left-[50px] w-0.5 bg-slate-200/80" />
        )}

        <div className="space-y-8 relative">
          {registrations.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <p className="text-sm text-slate-400 font-semibold">No live database registrations tracking updates found.</p>
            </div>
          ) : (
            registrations.map((item, idx) => {
              // Extract dynamic UI configuration tokens
              const config = getStatusConfiguration(item.status);
              const NodeIcon = config.icon;

              // Format date strings from MongoDB timestamps or fallbacks cleanly
              const eventTitle = item.eventId?.title
                || item.eventDetails?.title
                || item.projectTitle
                || "Smart India Hackathon 2026";

              // Extract event date or fallback to registration date
              const formattedDate = item.eventId?.date || item.eventDetails?.date || item.createdAt
                ? new Date(item.eventId?.date || item.eventDetails?.date || item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })
                : "Just now";

              // Safely look up nested relations if populating student or event structures
              const studentName = item.student?.name
                || item.leadName
                || (typeof item.student === "string" && item.student.length > 20 ? "Loading profile..." : item.student)
                || "Anonymous Participant";

              // Construct a dynamic description using the database domain and team details
              const displayDescription = item.projectDomain
                ? `Project Domain: ${item.projectDomain} • Submitted by Team "${item.teamName || 'Unknown Team'}" under the leadership of ${item.leadName || 'Team Lead'}.`
                : config.description;

              return (
                <motion.div
                  key={item._id || item.id || idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 1) }} // Prevents extreme lags on huge lists
                  className="flex items-start gap-4 sm:gap-6 relative group"
                >
                  {/* 1. TIMELINE INTERACTIVE NODE CHECKPOINT */}
                  <div className="relative z-10 shrink-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 shadow-sm transition-all duration-300 group-hover:scale-110 ${config.color}`}>
                      <NodeIcon size={14} className="sm:text-base" />
                    </div>

                    {/* Small check tag icon indicating complete or evaluated states */}
                    {item.status?.toLowerCase() === "approved" && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px]">
                        <FaCheck size={6} />
                      </div>
                    )}
                  </div>

                  {/* 2. CARD METRIC TEXT WINDOW CONTAINER */}
                  <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                    {/* Layout Title Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm sm:text-base">
                            {studentName}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md ${config.color}`}>
                            {config.label}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <FaUserAlt size={10} className="text-slate-300" />
                          <span>Target: <strong className="font-semibold text-slate-600">{eventTitle}</strong></span>
                        </div>
                      </div>

                      {/* Date Anchor Element */}
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 sm:self-start mt-1 sm:mt-0 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                        <FaCalendarAlt size={10} className="text-slate-300" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Operational Context Log Paragraph */}
                    <div className="mt-3 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      {displayDescription}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusTracking;