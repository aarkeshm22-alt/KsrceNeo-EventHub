import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  User, 
  MessageSquare, 
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox
} from "lucide-react";

const MentorStatus = () => {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentNotificationStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const currentUserId = localStorage.getItem("userId") || "6a27f5ff1b3ae178a3954aba";
        const token = localStorage.getItem("token") || "";

        const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/registrations/my-submissions?userId=${currentUserId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (response.ok && result.success) {
          // Sort timeline by newest updates first
          const sortedData = (result.data || []).sort((a, b) => 
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
          );
          setUpdates(sortedData);
        } else {
          setError(result.message || "Could not load your history updates.");
        }
      } catch (err) {
        setError("Connection error. Please check your internet and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentNotificationStream();
  }, []);

  const getDynamicNotificationMeta = (status, mentor) => {
    const mentorName = mentor?.name || "Review Board";
    switch (status) {
      case "Approved":
        return {
          title: "Application Approved",
          message: `Great news! Your application has been successfully reviewed and approved by ${mentorName}.`,
          iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
          icon: <CheckCircle2 size={16} />
        };
      case "Rejected":
        return {
          title: "Changes Needed",
          message: `Your application was not accepted by ${mentorName}. Please check your details and resubmit.`,
          iconBg: "bg-rose-50 border-rose-200 text-rose-600",
          icon: <XCircle size={16} />
        };
      case "Pending Approval":
      default:
        return {
          title: "Waiting for Review",
          message: `Your application has been sent successfully and is now in line to be reviewed by ${mentorName}.`,
          iconBg: "bg-amber-50 border-amber-200 text-amber-600",
          icon: <Clock size={16} className="animate-pulse" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Simple Header */}
        <div className="pb-4 border-b border-slate-200/60 space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Application Approval Timeline</h1>
          <p className="text-xs text-slate-500">
            Track the status of your applications.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-32 text-center bg-white border border-slate-200 rounded-xl space-y-2.5">
            <Loader2 size={20} className="animate-spin text-slate-500 mx-auto" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Checking for updates...</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="border border-rose-200 bg-rose-50/30 p-4 rounded-xl text-center text-xs font-mono font-semibold text-rose-800">
            {error}
          </div>
        ) : updates.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center space-y-2">
            <Inbox className="mx-auto text-slate-300" size={32} />
            <h3 className="text-sm font-semibold text-slate-700">No Submissions Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Submit a new project application form to see your timeline here.</p>
          </div>
        ) : (
          /* Timeline Design */
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[15px] sm:before:left-[19px] before:w-0.5 before:bg-slate-200">
            {updates.map((item, index) => {
              const meta = getDynamicNotificationMeta(item.status, item.departmentMentor);
              const formattedDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline Circle */}
                  <div className={`absolute -left-[29px] sm:-left-[33px] top-1.5 w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 bg-white flex items-center justify-center z-10 transition-colors shadow-sm ${meta.iconBg}`}>
                    {meta.icon}
                  </div>

                  {/* Content Box */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-slate-300/80 transition-all duration-200">
                    
                    {/* Top Row: Title & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 tracking-tight mt-0.5">
                          {item.projectTitle || "Untitled Project"} • <span className="text-slate-500 font-medium text-xs">{item.teamName}</span>
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono sm:self-start sm:mt-1">
                        <Calendar size={11} />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Status Message Box */}
                    <div className="bg-[#f8fafc] border border-slate-200/50 rounded-lg p-3.5 mt-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        <MessageSquare size={12} />
                        <span>{meta.title}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {meta.message}
                      </p>
                    </div>

                    {/* Footer Row: Mentor Info */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3.5 pt-1">
                      <User size={12} className="text-slate-300" />
                      <span>Assigned SPOC: <strong className="font-semibold text-slate-600">{item.departmentMentor?.name || "Review Board"}</strong></span>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorStatus;