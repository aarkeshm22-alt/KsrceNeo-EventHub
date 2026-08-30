import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardCheck,
  CheckCircle,
  Calendar,
  Bell,
  User,
  Lightbulb,
  ArrowRight,
  Clock,
  Loader2,
  AlertCircle,
  PieChart as ChartIcon
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  // Live State Repositories
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState("Mentor");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Department Resolver
  const getMentorDepartment = () => {
    const rawDept =
      localStorage.getItem("department") ||
      localStorage.getItem("userDepartment") ||
      localStorage.getItem("dept");

    if (rawDept) return rawDept.toUpperCase();

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const nestedDept = parsedUser.department || parsedUser.dept;
        if (nestedDept) return nestedDept.toUpperCase();
      }
    } catch (e) {
      console.error("Failed to parse nested user object", e);
    }
    return "CSE";
  };

  const mentorDepartment = getMentorDepartment();

  // 1. Live Clock Trigger
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch logged-in user's name
  useEffect(() => {
    const fetchUserName = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setUserName("Mentor");
        return;
      }
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setUserName(result.data?.name || "Mentor");
        } else {
          setUserName("Mentor");
        }
      } catch {
        setUserName("Mentor");
      }
    };
    fetchUserName();
  }, []);

  // 3. Synchronized Backend Fetching Engine
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token") || "";
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const encodedDept = encodeURIComponent(mentorDepartment);

        const [usersRes, regsRes, eventsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", { method: "GET", headers }),
          fetch(`http://localhost:5000/api/registrations/department-requests?department=${encodedDept}`, { method: "GET", headers }).catch(() => null),
          fetch("http://localhost:5000/api/events", { method: "GET", headers }).catch(() => null)
        ]);

        if (!usersRes.ok) {
          throw new Error("Could not sync profile metrics from the master user list.");
        }

        const userData = await usersRes.json();

        let regData = [];
        if (regsRes && regsRes.ok) {
          const rawRegRes = await regsRes.json();
          regData = rawRegRes.data || rawRegRes;
        }

        let eventData = [];
        if (eventsRes && eventsRes.ok) {
          const rawEvtRes = await eventsRes.json();
          eventData = rawEvtRes.data || rawEvtRes;
        }

        setStudents(userData.data || userData);
        setRegistrations(regData);
        setEvents(eventData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [mentorDepartment]);

  // ========================================================
  // DATA FILTER PIPELINE — UPDATED to show TEAM NAME
  // ========================================================

  const departmentalStudents = students.filter(
    (u) => u.role === "student" && u.department?.toUpperCase() === mentorDepartment.toUpperCase()
  );

  const enrichedUpdates = registrations.map((reg, index) => {
    const linkedEvent = events.find((e) => e._id === reg.eventId || e.id === reg.eventId);
    const rawStatus = reg.status || reg.approvalStatus || "Pending";
    const isApproved = rawStatus.toLowerCase() === "approved" || reg.isApproved === true;
    return {
      _id: reg._id || index,        // ✅ ensure _id exists
      teamName: reg.teamName || "Unnamed Team",
      eventName: linkedEvent?.title || linkedEvent?.name || reg.eventName || "Hackathon Event",
      status: isApproved ? "Approved" : "Pending",
      hasRegistration: true
    };
  });

  const totalAssigned = departmentalStudents.length > 0 ? departmentalStudents.length : registrations.length;
  const approvedCount = registrations.filter(r => (r.status || r.approvalStatus || "").toLowerCase() === "approved").length;
  const pendingCount = registrations.filter(r => (r.status || r.approvalStatus || "").toLowerCase() === "pending approval").length;
  const activeEventsCount = [...new Set(registrations.map(r => r.eventName || r.eventId))].filter(Boolean).length;
  const liveStreamUpdates = [...enrichedUpdates].reverse();

  const stats = [
    { title: "Assigned Students", value: totalAssigned, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50/50" },
    { title: "Pending Approvals", value: pendingCount, icon: ClipboardCheck, color: "text-amber-600", bgColor: "bg-amber-50/50" },
    { title: "Approved Students", value: approvedCount, icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-50/50" },
    { title: "Active Events", value: activeEventsCount, icon: Calendar, color: "text-indigo-600", bgColor: "bg-indigo-50/50" },
  ];

  const totalChartItems = approvedCount + pendingCount;
  const approvedPercentage = totalChartItems > 0 ? (approvedCount / totalChartItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">

      {/* HEADER HERO (unchanged) */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-900 text-white rounded">
              Secure Dashboard
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Active Control Node: <strong className="text-slate-800">{mentorDepartment}</strong>
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Welcome back, {userName || "Mentor"} 👋
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Reviewing live statistics, cross-collection logs, and real-time student registration requests.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg w-full md:w-auto shrink-0 font-mono">
          <Clock size={16} className="text-slate-400 animate-pulse shrink-0" />
          <div className="text-left w-full">
            <p className="text-xs font-bold text-slate-800 leading-none">
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">
              {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-2.5 text-xs font-medium">
          <AlertCircle size={15} className="shrink-0" />
          <span>Sync Error: {error}. Check if your backend server endpoints are active.</span>
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {item.title}
                </p>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">
                  {isLoading ? "..." : item.value}
                </h2>
              </div>
              <div className={`p-2.5 ${item.bgColor} ${item.color} rounded-lg border shrink-0`}>
                <Icon size={16} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Manage Request", path: "/mentor/approvals" },
          { label: "View Your Students", path: "/mentor/students" },
          { label: "Events", path: "/mentor/events" }
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="flex items-center justify-between gap-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 p-3.5 rounded-lg text-xs font-bold shadow-2xs transition-colors text-left group cursor-pointer w-full"
          >
            <span>{action.label}</span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      {/* DUAL CONTAINER GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LIVE DATA STREAM FEED */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col justify-between lg:col-span-2 min-h-[350px]">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Bell className="text-blue-500 shrink-0" size={16} />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Live Updates Feed</h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Real-time overview of student submissions within your department.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 size={18} className="animate-spin text-slate-600" />
                <span>Parsing active database records...</span>
              </div>
            ) : liveStreamUpdates.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {liveStreamUpdates.map((update) => (
                  <motion.div
                    key={update._id || update.id} // ✅ fixed: use _id as key
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg flex gap-3 items-start hover:bg-slate-100/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-md mt-0.5 shrink-0 border ${update.status === "Approved"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                      {update.status === "Approved" ? <CheckCircle size={14} /> : <User size={14} />}
                    </div>

                    <div className="space-y-1 min-w-0 text-xs">
                      <p className="text-slate-600 leading-normal">
                        <strong className="text-slate-900 font-bold">Team {update.teamName}</strong> submitted a registration request for the event:
                      </p>
                      <div className="items-center gap-1 text-slate-700 font-semibold bg-white border border-slate-100 px-2 py-1 rounded inline-flex max-w-full">
                        <Lightbulb size={12} className="text-amber-400 shrink-0" />
                        <span className="truncate">{update.eventName}</span>
                      </div>
                      <div className="pt-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border uppercase tracking-wider ${update.status === "Approved"
                            ? "bg-emerald-100/70 text-emerald-800 border-emerald-200"
                            : "bg-amber-100/70 text-amber-800 border-amber-200"
                          }`}>
                          Current Status: {update.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                No active registration logs match your department filters.
              </div>
            )}
          </div>
          <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 font-bold flex justify-between items-center">
            <span>Registration Stream: Dynamic Linked Mode</span>
            <span>v2.5.0</span>
          </div>
        </div>

        {/* PIE CHART SIDE VIEW PANEL */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <ChartIcon className="text-indigo-500 shrink-0" size={16} />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Approval Metrics</h2>
                <p className="text-[11px] text-slate-400 font-medium">Visualizing application state share balances.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading charts...</div>
            ) : totalChartItems > 0 ? (
              <div className="space-y-6">
                <div className="relative w-36 h-36 mx-auto">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4.2" />
                    <circle
                      cx="18" cy="18" r="15.915" fill="none"
                      stroke="#10b981" strokeWidth="4.2"
                      strokeDasharray={`${approvedPercentage} ${100 - approvedPercentage}`}
                      strokeDashoffset="0"
                      className="transition-all duration-500 ease-out"
                    />
                    <circle
                      cx="18" cy="18" r="15.915" fill="none"
                      stroke="#f59e0b" strokeWidth="4.2"
                      strokeDasharray={`${100 - approvedPercentage} ${approvedPercentage}`}
                      strokeDashoffset={`-${approvedPercentage}`}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">{totalChartItems}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Forms</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/40 border border-emerald-100/50">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                      <span className="text-slate-600 font-medium">Approved Submissions</span>
                    </div>
                    <span className="font-bold text-emerald-700 text-xs">{approvedCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/40 border border-amber-100/50">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                      <span className="text-slate-600 font-medium">Pending Approvals</span>
                    </div>
                    <span className="font-bold text-amber-700 text-xs">{pendingCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 italic">
                No graphical charts to display yet.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-mono font-medium pt-3 border-t border-slate-100 text-right">
            Ratio: {approvedPercentage.toFixed(0)}% Clear
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;