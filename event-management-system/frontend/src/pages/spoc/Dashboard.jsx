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
  PieChart as ChartIcon,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  CalendarDays,
} from "lucide-react";

// ================================================================
// SKELETON COMPONENTS
// ================================================================

const SkeletonStat = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between animate-pulse"
  >
    <div className="space-y-2 w-full">
      <div className="h-3 w-20 bg-slate-200 rounded"></div>
      <div className="h-7 w-12 bg-slate-200 rounded"></div>
    </div>
    <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
  </motion.div>
);

const SkeletonButton = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between animate-pulse"
  >
    <div className="h-4 w-32 bg-slate-200 rounded"></div>
    <div className="h-4 w-4 bg-slate-200 rounded"></div>
  </motion.div>
);

const SkeletonFeed = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg flex gap-3 items-start">
        <div className="h-8 w-8 bg-slate-200 rounded-md shrink-0"></div>
        <div className="space-y-2 w-full">
          <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

const SkeletonChart = () => (
  <div className="space-y-6 animate-pulse">
    <div className="relative w-36 h-36 mx-auto bg-slate-200 rounded-full"></div>
    <div className="space-y-2.5">
      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-slate-300 rounded-sm"></div>
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="h-4 w-8 bg-slate-200 rounded"></div>
      </div>
      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-slate-300 rounded-sm"></div>
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="h-4 w-8 bg-slate-200 rounded"></div>
      </div>
    </div>
  </div>
);

// ================================================================
// MAIN COMPONENT
// ================================================================

const SpocDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ----------------------------------------------------------------
  // GET SPOC DEPARTMENT & USER FROM LOCAL STORAGE
  // ----------------------------------------------------------------
  const getSpocDepartment = () => {
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

  const spocDepartment = getSpocDepartment();

  // ----------------------------------------------------------------
  // GET USER FROM LOCAL STORAGE (NO API CALL)
  // ----------------------------------------------------------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }
  }, []);

  // ----------------------------------------------------------------
  // LIVE CLOCK
  // ----------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ----------------------------------------------------------------
  // FETCH DATA WITH MINIMUM 2‑SECOND LOADING
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      const startTime = Date.now();
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token") || "";
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const encodedDept = encodeURIComponent(spocDepartment);

        const [usersRes, regsRes, eventsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", { method: "GET", headers }),
          fetch(
            `http://localhost:5000/api/registrations/department-requests?department=${encodedDept}`,
            { method: "GET", headers }
          ).catch(() => null),
          fetch("http://localhost:5000/api/events", { method: "GET", headers }).catch(() => null),
        ]);

        if (!usersRes.ok) {
          throw new Error("Could not sync profile metrics from the master user list.");
        }

        const userList = await usersRes.json();

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

        setStudents(userList.data || userList);
        setRegistrations(regData);
        setEvents(eventData);
      } catch (err) {
        setError(err.message);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2000 - elapsed);
        setTimeout(() => {
          setIsLoading(false);
        }, remaining);
      }
    };

    fetchAllDashboardData();
  }, [spocDepartment]);

  // ----------------------------------------------------------------
  // FILTER & ENRICH – IMPROVED LIVE FEED (WITH EVENT TITLE RESOLUTION)
  // ----------------------------------------------------------------
  const departmentalStudents = students.filter(
    (u) =>
      u.role === "student" &&
      u.department?.toUpperCase() === spocDepartment.toUpperCase()
  );

  const enrichedUpdates = registrations.map((reg, index) => {
    // ---- Student name ----
    let studentName = "Assigned Student";
    if (reg.createdBy) {
      if (typeof reg.createdBy === "object" && reg.createdBy.name) {
        studentName = reg.createdBy.name;
      } else if (typeof reg.createdBy === "string") {
        const found = students.find((s) => s._id === reg.createdBy);
        if (found) studentName = found.name || found.firstName + " " + found.lastName;
      }
    } else if (reg.leadName) {
      studentName = reg.leadName;
    } else if (reg.studentName) {
      studentName = reg.studentName;
    }

    // ---- Event name ----
    let eventName = "Unknown Event";
    if (reg.eventId) {
      if (typeof reg.eventId === "object" && (reg.eventId.title || reg.eventId.eventName)) {
        eventName = reg.eventId.title || reg.eventId.eventName;
      } else if (typeof reg.eventId === "string") {
        // Search by MongoDB _id OR custom eventId
        const found = events.find(
          (e) => e._id === reg.eventId || e.eventId === reg.eventId
        );
        if (found) {
          eventName = found.title || found.name || found.eventName || "Unnamed Event";
        }
      }
    } else if (reg.eventName) {
      eventName = reg.eventName;
    }

    const rawStatus = reg.status || reg.approvalStatus || "Pending";
    const isApproved = rawStatus.toLowerCase() === "approved" || reg.isApproved === true;

    return {
      _id: reg._id || index,
      studentName,
      eventName,
      status: isApproved ? "Approved" : "Pending",
      hasRegistration: true,
    };
  });

  // Keep only the 5 most recent ones (reverse so newest first)
  const liveStreamUpdates = enrichedUpdates.reverse().slice(0, 5);

  // ----------------------------------------------------------------
  // STATS
  // ----------------------------------------------------------------
  const totalAssigned = departmentalStudents.length > 0 ? departmentalStudents.length : registrations.length;
  const approvedCount = registrations.filter(
    (r) => (r.status || r.approvalStatus || "").toLowerCase() === "approved"
  ).length;
  const pendingCount = registrations.filter(
    (r) => (r.status || r.approvalStatus || "").toLowerCase() === "pending"
  ).length;
  const activeEventsCount = [...new Set(registrations.map((r) => r.eventName || r.eventId))].filter(Boolean)
    .length;

  const stats = [
    {
      title: "Department Students",
      value: totalAssigned,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50/50",
    },
    {
      title: "Pending Approvals",
      value: pendingCount,
      icon: ClipboardCheck,
      color: "text-amber-600",
      bgColor: "bg-amber-50/50",
    },
    {
      title: "Approved Students",
      value: approvedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/50",
    },
    {
      title: "Active Events",
      value: activeEventsCount,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50/50",
    },
  ];

  const totalChartItems = approvedCount + pendingCount;
  const approvedPercentage = totalChartItems > 0 ? (approvedCount / totalChartItems) * 100 : 0;

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  const displayName = user?.name || user?.firstName
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name
    : "SPOC";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* HEADER HERO */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
          <div className="space-y-2 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-5 w-28 bg-slate-200 rounded"></div>
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
            </div>
            <div className="h-6 w-48 bg-slate-200 rounded"></div>
            <div className="h-4 w-64 bg-slate-200 rounded"></div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg w-full md:w-auto shrink-0">
            <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
            <div className="space-y-1 w-32">
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-900 text-white rounded">
                SPOC Dashboard
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Department: <strong className="text-slate-800">{spocDepartment}</strong>
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              Reviewing live statistics, registration requests, and student engagement for your department.
            </p>
          </div>

          {/* LIVE CLOCK */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg w-full md:w-auto shrink-0 font-mono">
            <Clock size={16} className="text-slate-400 animate-pulse shrink-0" />
            <div className="text-left w-full">
              <p className="text-xs font-bold text-slate-800 leading-none">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-2.5 text-xs font-medium">
          <AlertCircle size={15} className="shrink-0" />
          <span>Sync Error: {error}. Check if your backend server endpoints are active.</span>
        </div>
      )}

      {/* STATS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonStat key={i} delay={i * 0.05} />
          ))}
        </div>
      ) : (
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
                    {item.value}
                  </h2>
                </div>
                <div className={`p-2.5 ${item.bgColor} ${item.color} rounded-lg border shrink-0`}>
                  <Icon size={16} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ACTION BUTTONS */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonButton key={i} delay={i * 0.04 + 0.2} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/spoc/events")}
            className="flex items-center justify-between gap-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 p-3.5 rounded-lg text-xs font-bold shadow-2xs transition-colors text-left group cursor-pointer w-full"
          >
            <span>View Events</span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </button>
          <button
            onClick={() => navigate("/spoc/students")}
            className="flex items-center justify-between gap-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 p-3.5 rounded-lg text-xs font-bold shadow-2xs transition-colors text-left group cursor-pointer w-full"
          >
            <span>View Students</span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </button>
          <button
            onClick={() => navigate("/spoc/registrations")}
            className="flex items-center justify-between gap-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 p-3.5 rounded-lg text-xs font-bold shadow-2xs transition-colors text-left group cursor-pointer w-full"
          >
            <span>View Registrations</span>
            <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      )}

      {/* DUAL PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIVE FEED */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col justify-between lg:col-span-2 min-h-[350px]">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Bell className="text-blue-500 shrink-0" size={16} />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Live Feed</h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Real-time requests from students in your department.
                </p>
              </div>
            </div>

            {isLoading ? (
              <SkeletonFeed />
            ) : liveStreamUpdates.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {liveStreamUpdates.map((update) => (
                  <motion.div
                    key={update._id}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg flex gap-3 items-start hover:bg-slate-100/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-md mt-0.5 shrink-0 border ${
                      update.status === "Approved"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {update.status === "Approved" ? <CheckCircle size={14} /> : <User size={14} />}
                    </div>

                    <div className="space-y-1 min-w-0 text-xs">
                      <p className="text-slate-600 leading-normal">
                        Student <strong className="text-slate-900 font-bold">{update.studentName}</strong> submitted a registration for:
                      </p>
                      <div className="items-center gap-1 text-slate-700 font-semibold bg-white border border-slate-100 px-2 py-1 rounded inline-flex max-w-full">
                        <Lightbulb size={12} className="text-amber-400 shrink-0" />
                        <span className="truncate">{update.eventName}</span>
                      </div>
                      <div className="pt-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border uppercase tracking-wider ${
                          update.status === "Approved"
                            ? "bg-emerald-100/70 text-emerald-800 border-emerald-200"
                            : "bg-amber-100/70 text-amber-800 border-amber-200"
                        }`}>
                          Status: {update.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                No active registration requests for your department.
              </div>
            )}
          </div>
          <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 font-bold flex justify-between items-center">
            <span>Registration Stream • Dynamic</span>
          </div>
        </div>

        {/* CHART PANEL */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <ChartIcon className="text-indigo-500 shrink-0" size={16} />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Approval Metrics</h2>
                <p className="text-[11px] text-slate-400 font-medium">Visualizing application states.</p>
              </div>
            </div>

            {isLoading ? (
              <SkeletonChart />
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
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Requests</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/40 border border-emerald-100/50">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                      <span className="text-slate-600 font-medium">Approved</span>
                    </div>
                    <span className="font-bold text-emerald-700 text-xs">{approvedCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/40 border border-amber-100/50">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                      <span className="text-slate-600 font-medium">Pending</span>
                    </div>
                    <span className="font-bold text-amber-700 text-xs">{pendingCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 italic">
                No data to display yet.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-mono font-medium pt-3 border-t border-slate-100 text-right">
            Approval Rate: {approvedPercentage.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpocDashboard;