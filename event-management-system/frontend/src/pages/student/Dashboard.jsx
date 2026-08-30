import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  User,
  Compass,
  PlusCircle,
  FolderKanban,
  FileBadge2,
  Loader2,
  Activity,
  Mail,
  Building,
  Sparkles
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [userName, setUserName] = useState("");

  // System clock hook
  useEffect(() => {
    const updateSystemClock = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'short', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', hour12: true 
      }));
    };
    updateSystemClock();
    const intervalId = setInterval(updateSystemClock, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch user profile to get the name — FIXED endpoint
  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setUserName("Student");
        return;
      }
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setUserName(result.data?.name || "Student");
        } else {
          setUserName("Student");
        }
      } catch {
        setUserName("Student");
      }
    };
    fetchUser();
  }, []);

  // Fetch student records from back-end server
  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
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
          setSubmissions(result.data || []);
        } else {
          setError(result.message || "Failed to load dashboard data.");
        }
      } catch (err) {
        setError("Unable to connect to the server. Please check your network connection.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardTelemetry();
  }, []);

  // Stats Counters
  const stats = [
    { title: "Total Submissions", value: submissions.length, icon: Calendar, color: "text-slate-700 bg-slate-50 border-slate-100" },
    { title: "Approved Submissions", value: submissions.filter(i => i.status === "Approved").length, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50/50 border-emerald-100" },
    { title: "Under Review", value: submissions.filter(i => i.status === "Pending Approval" || i.status === "Pending").length, icon: Clock, color: "text-amber-600 bg-amber-50/50 border-amber-100" },
    { title: "Needs Revision", value: submissions.filter(i => i.status === "Rejected").length, icon: AlertTriangle, color: "text-rose-600 bg-rose-50/50 border-rose-100" },
  ];

  // Extract primary current mentor details from submissions if available
  const activeMentor = submissions.find(s => s.departmentMentor?.name)?.departmentMentor || null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-600 font-sans antialiased py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 selection:bg-slate-200">
      
      {/* Premium Dashboard Header with Welcome Name */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md"><Sparkles size={14} /></span>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Student</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {userName || "Student"} 👋
          </h1>
          <p className="text-sm text-slate-500 font-normal">Track your submission status, monitor event schedules, and view event details.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-sm tracking-wide font-mono">
            {currentDateTime || "SYNCING CLOCK..."}
          </span>
        </div>
      </div>

      {isLoading ? (
        /* Loading Frame */
        <div className="py-32 text-center bg-white border border-slate-200/60 rounded-2xl space-y-3 shadow-sm">
          <Loader2 size={26} className="animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Assembling Workspace...</p>
        </div>
      ) : error ? (
        /* Error Box */
        <div className="border-2 border-rose-100 bg-rose-50/40 p-5 rounded-2xl text-center text-sm font-medium text-rose-800 shadow-sm max-w-md mx-auto">
          ⚠️ {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* LEFT / CENTER CONTENT AREA (3 columns out of 4) */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* Grid Metric Counters */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center justify-between transition-all hover:translate-y-[-1px] hover:shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.title}</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight font-mono">{item.value}</h2>
                      </div>
                      <div className={`p-3 border rounded-xl ${item.color}`}>
                        <Icon size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Hub with Navigation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Browse Events", icon: Compass, path: "/student/events" },
                  { label: "New Submission", icon: PlusCircle, highlight: true, path: "/student/events" },
                  { label: "My Applications", icon: FolderKanban, path: "/student/applications" },
                  { label: "Verify Status", icon: FileBadge2, path: "/student/status" }
                ].map((btn, bIdx) => (
                  <button 
                    key={bIdx} 
                    onClick={() => navigate(btn.path)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-bold shadow-sm transition-all text-left group border
                      ${btn.highlight 
                        ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 hover:shadow-md" 
                        : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-400 hover:text-slate-900"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <btn.icon size={14} className={btn.highlight ? "text-indigo-200" : "text-slate-400 group-hover:text-slate-700"} />
                      <span>{btn.label}</span>
                    </div>
                    <ChevronRight size={12} className={btn.highlight ? "text-indigo-200" : "text-slate-300 group-hover:text-slate-600"} />
                  </button>
                ))}
              </div>

              {/* Active Submissions Management Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900">Your Project Submissions</h2>
                  <p className="text-xs text-slate-400 font-normal">Tracking the status of your application.</p>
                </div>

                <div className="overflow-x-auto">
                  {submissions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-xs italic text-slate-400 font-medium font-mono">No submissions found..!</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-1 font-bold">Application Info</th>
                          <th className="pb-3 font-bold">Assigned SPOc</th>
                          <th className="pb-3 text-right font-bold pr-1">Approval Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submissions.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-50/40 transition-colors group">
                            <td className="py-3.5 pl-1">
                              <span className="block font-bold text-slate-800 text-sm truncate max-w-[240px] group-hover:text-indigo-600 transition-colors">{item.projectTitle || "Untitled Framework"}</span>
                              <span className="text-[10px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">Team: {item.teamName || "General"}</span>
                            </td>
                            <td className="py-3.5 text-slate-600 font-semibold text-sm">
                              <span className="inline-flex items-center gap-2">
                                <span className="p-1 bg-slate-100 border border-slate-200/40 text-slate-400 rounded-lg"><User size={12} /></span>
                                {item.departmentMentor?.name || "Assigning SPOc..."}
                              </span>
                            </td>
                            <td className="py-3.5 text-right pr-1">
                              <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] uppercase border tracking-wide shadow-2xs ${
                                item.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
                                item.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200/60" :
                                "bg-amber-50 text-amber-700 border-amber-200/60 animate-pulse"
                              }`}>
                                {item.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE PANEL AREA (1 column out of 4) */}
            <div className="space-y-6">
              
              {/* Mentorship Information Profile Component Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50/50 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <div className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg"><User size={14} /></div>
                  <h2 className="text-sm font-black tracking-tight text-slate-900">Your Department SPOC</h2>
                </div>

                {activeMentor ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base tracking-tight">{activeMentor.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Building size={12} className="text-slate-300" />
                        <span>Department SPOC</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <a 
                        href={`mailto:${activeMentor.email || "review-board@institution.edu"}`}
                        className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all text-left"
                      >
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{activeMentor.email || "board@institution.edu"}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs font-medium text-slate-400 px-4">No SPOc assigned yet.</p>
                  </div>
                )}
              </div>

              {/* History Event Notifications Log */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Activity size={13} className="text-slate-900" />
                  <h2 className="text-sm font-black tracking-tight text-slate-900">Activity History</h2>
                </div>

                {submissions.length === 0 ? (
                  <p className="text-xs italic text-slate-400 text-center py-6 font-mono">No logs are found..!</p>
                ) : (
                  <ul className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {submissions.slice(0, 3).map((item) => (
                      <li key={item._id} className="p-3 bg-slate-50/60 border border-slate-200/60 rounded-xl flex flex-col gap-1 transition-colors hover:bg-slate-50">
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          Update for <strong className="font-bold text-slate-800">{item.projectTitle || "Untitled"}</strong> marked as <span className="font-bold text-indigo-600">{item.status || "Pending"}</span>.
                        </p>
                        <span className="text-[9px] text-slate-400 font-semibold font-mono align-baseline self-end mt-1">
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;