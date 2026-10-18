import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaCalendarDays,
  FaUsers,
  FaUserTie,
  FaClipboardCheck,
  FaCirclePlus,
  FaGraduationCap,
  FaChalkboardUser,
  FaChartLine,
  FaChevronRight,
  FaChartPie,
  FaClock,
  FaUserShield
} from "react-icons/fa6";
import { Handshake } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [liveStats, setLiveStats] = useState({
    totalEvents: 0,
    totalStudents: 0,
    totalMentors: 0,
    registrations: 0,
    pendingReviews: 0,
    totalSpocs: 0,
  });

  const [recentEvents, setRecentEvents] = useState([]);
  const [trackDistribution, setTrackDistribution] = useState([]);
  const [conicGradientString, setConicGradientString] = useState("");

  const fetchDashboardData = async () => {
    try {
      const [eventsResult, usersResult, regsResult, spocsResult] = await Promise.allSettled([
        axios.get("https://ksrceneo-eventhub.onrender.com/api/events"),
        axios.get("https://ksrceneo-eventhub.onrender.com/api/users"),
        axios.get("https://ksrceneo-eventhub.onrender.com/api/registrations"),
        axios.get("https://ksrceneo-eventhub.onrender.com/api/admin/spoc", {
          headers: { "x-user-role": "admin" },
        }),
      ]);

      const eventsData = eventsResult.status === "fulfilled" ? eventsResult.value.data || [] : [];
      const usersData = usersResult.status === "fulfilled" ? usersResult.value.data || [] : [];
      const regsData = regsResult.status === "fulfilled" ? regsResult.value.data || [] : [];
      const spocsData = spocsResult.status === "fulfilled" ? spocsResult.value.data || [] : [];

      const studentCount = usersData.filter(user => user.role?.toLowerCase() === "student").length;
      const mentorCount = usersData.filter(user => user.role?.toLowerCase() === "mentor").length;
      const pendingCount = regsData.filter(r => r.status?.toLowerCase() === "pending").length;

      setLiveStats({
        totalEvents: eventsData.length,
        totalStudents: studentCount,
        totalMentors: mentorCount,
        registrations: regsData.length,
        pendingReviews: pendingCount,
        totalSpocs: spocsData.length,
      });

      if (eventsData.length > 0) {
        // ✅ IMPROVED MATCHING: count registrations per event by ID
        const mappedEvents = eventsData.map((e) => {
          const eventIdStr = e._id?.toString() || "";
          const eventCustomIdStr = e.eventId?.toString() || "";

          const matchingTeams = regsData.filter((r) => {
            const regEventId = r.eventId?.toString() || "";
            return regEventId === eventIdStr || regEventId === eventCustomIdStr;
          }).length;

          return {
            id: eventIdStr,
            title: e.title || "Unnamed Hackathon Event",
            track: e.track || e.category || "General",
            teams: matchingTeams,
            status: e.status || "Active",
            badgeStyle: e.status === "Active" ? "text-amber-800 bg-amber-50 border-amber-200" : "text-blue-900 bg-blue-50 border-blue-200"
          };
        });

        setRecentEvents(mappedEvents);

        // Pie chart distribution
        const counts = {};
        mappedEvents.forEach(e => {
          counts[e.track] = (counts[e.track] || 0) + (e.teams > 0 ? e.teams : 1);
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const distribution = Object.keys(counts).map(trackName => ({
          name: trackName,
          count: counts[trackName],
          percentage: Math.round((counts[trackName] / total) * 100)
        })).sort((a, b) => b.count - a.count);

        setTrackDistribution(distribution);

        const colors = ["#1e3a8a", "#f59e0b", "#94a3b8", "#10b981", "#6366f1"];
        let currentAngle = 0;
        const gradientParts = distribution.map((item, idx) => {
          const color = colors[idx % colors.length];
          const startAngle = currentAngle;
          currentAngle += item.percentage;
          return `${color} ${startAngle}% ${currentAngle}%`;
        });

        setConicGradientString(`conic-gradient(${gradientParts.join(", ")})`);
      } else {
        setRecentEvents([]);
        setTrackDistribution([]);
        setConicGradientString("");
      }
    } catch (error) {
      console.error("Critical error inside parsing loops:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const clockTicker = setInterval(() => setCurrentDateTime(new Date()), 1000);
    const dataPoller = setInterval(() => fetchDashboardData(), 30000);

    return () => {
      clearInterval(clockTicker);
      clearInterval(dataPoller);
    };
  }, []);

  const formattedDay = currentDateTime.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = currentDateTime.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const formattedTime = currentDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const totalTrackTeams = recentEvents.reduce((acc, curr) => acc + curr.teams, 0) || liveStats.registrations;

  if (loading) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Sorting Users & Roles...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 overflow-x-hidden select-none">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* HERO CONTAINER */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xs overflow-hidden border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
              Admin Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 text-white flex items-center gap-2">
              <span>Welcome Back, Admin</span>
              <Handshake className="text-amber-400 inline-block rotate-12" size={28} />
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Real-time records synced successfully...
            </p>
          </div>
          <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-4 min-w-[240px] shadow-inner backdrop-blur-md flex items-center gap-3.5 self-start md:self-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FaClock className="animate-spin" size={15} style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-white mt-1 font-mono">{formattedTime}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">{formattedDay}, {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* METRIC GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{liveStats.totalEvents}</h2>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50/80 text-amber-600 border border-amber-100 flex items-center justify-center"><FaCalendarDays size={16} /></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{liveStats.totalStudents}</h2>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 border border-slate-200/60 flex items-center justify-center"><FaUsers size={16} /></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mentors</p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{liveStats.totalMentors}</h2>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50/80 text-blue-600 border border-blue-100/60 flex items-center justify-center"><FaUserTie size={16} /></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrations</p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{liveStats.registrations}</h2>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center"><FaClipboardCheck size={16} /></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total SPOC's</p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{liveStats.totalSpocs}</h2>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50/80 text-indigo-600 border border-indigo-100/60 flex items-center justify-center">
                <FaUserShield size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* GRAPHICS & ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* PIE CHART */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaChartPie className="text-blue-600" size={13} />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Track Allocation Map</h3>
              </div>
              <p className="text-base font-bold text-slate-900 mb-4">Event Types Breakdown</p>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              {trackDistribution.length === 0 ? (
                <p className="text-xs text-slate-400 py-8">No track metadata compiled yet.</p>
              ) : (
                <>
                  <div
                    style={{ background: conicGradientString || '#f1f5f9' }}
                    className="w-36 h-36 rounded-full border border-slate-100 flex items-center justify-center relative shadow-xs transition-all duration-500"
                  >
                    <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                      <span className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                        {liveStats.totalEvents}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-6 w-full">
                    {trackDistribution.slice(0, 4).map((item, idx) => {
                      const borderColors = ["border-l-blue-500", "border-l-amber-500", "border-l-indigo-500", "border-l-emerald-500"];
                      const bgDotColors = ["bg-blue-500", "bg-amber-500", "bg-indigo-500", "bg-emerald-500"];

                      return (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between p-2 bg-slate-50 border border-slate-100 border-l-2 ${borderColors[idx % borderColors.length]} rounded-xl`}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <span className={`w-1 h-1 rounded-full shrink-0 ${bgDotColors[idx % bgDotColors.length]}`} />
                            <span className="font-bold text-slate-600 truncate text-[10px]">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-right shrink-0 ml-1 text-[10px]">
                            <span className="font-extrabold text-slate-900 block">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between lg:col-span-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Engagement Metrics By Track</p>
              <p className="text-base font-bold text-slate-900 mb-4">Widescreen Registration Ratios</p>
            </div>
            <div className="space-y-4 py-1 flex-1 flex flex-col justify-center">
              {recentEvents.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No active teams registered yet across available events.</p>
              ) : (
                recentEvents.slice(0, 4).map((event) => {
                  const displayTeams = event.teams > 0 ? event.teams : (liveStats.registrations > 0 ? liveStats.registrations : 0);
                  const baseTotal = totalTrackTeams > 0 ? totalTrackTeams : (displayTeams > 0 ? displayTeams : 1);
                  const percentage = Math.min(100, Math.round((displayTeams / baseTotal) * 100));

                  return (
                    <div key={event.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span className="truncate max-w-[65%]">{event.title}</span>
                        <span className="text-slate-500 font-semibold shrink-0">
                          {displayTeams} {displayTeams === 1 ? 'Team' : 'Teams'} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-blue-600"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <button onClick={() => navigate("/admin/events")} className="flex items-center justify-center gap-2.5 bg-blue-900 hover:bg-blue-950 text-white p-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all border border-blue-950 group cursor-pointer"><FaCirclePlus className="text-amber-400" size={13} /><span>Create Event</span></button>
          <button onClick={() => navigate("/admin/students")} className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer"><FaGraduationCap className="text-slate-400" size={13} /><span>View Students</span></button>
          <button onClick={() => navigate("/admin/mentors")} className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer"><FaChalkboardUser className="text-slate-400" size={13} /><span>View Mentors</span></button>
          <button onClick={() => navigate("/admin/status")} className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider cursor-pointer"><FaChartLine className="text-slate-400" size={13} /><span>Track Status</span></button>
        </div>

        {/* EVENTS LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Event Portals</h3>
              <span onClick={() => navigate("/admin/events")} className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">View All</span>
            </div>
            <div className="p-5 divide-y divide-slate-100">
              {recentEvents.length === 0 ? (
                <p className="text-xs p-2 text-slate-400 font-medium">No live hackathon records returned from storage paths.</p>
              ) : (
                recentEvents.slice(0, 5).map((event) => (
                  <div key={event.id} onClick={() => navigate("/admin/status")} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 group cursor-pointer">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-blue-900 block truncate">{event.title}</span>
                      <p className="text-[11px] font-medium text-slate-400">{event.track} • {event.teams} Active Teams</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md ${event.badgeStyle}`}>{event.status}</span>
                      <FaChevronRight className="text-slate-400 text-xs" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;