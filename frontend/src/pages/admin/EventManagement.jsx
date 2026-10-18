import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaPlusCircle, 
  FaSearch, 
  FaRegFolderOpen,
  FaArrowLeft,
  FaSync,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "../../components/cards/EventCard";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const EventManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemError, setSystemError] = useState("");
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const directRole = localStorage.getItem("role") || localStorage.getItem("userRole");
    if (directRole) setUserRole(directRole.toLowerCase().trim());
    else if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const detected = parsed?.role || parsed?.userRole || "student";
        setUserRole(detected.toLowerCase().trim());
      } catch (err) { console.error("Failed to parse user state:", err); }
    }
    fetchLiveEvents();
    fetchRegistrations();
  }, []);

  const isAuthorizedAdmin = userRole === "admin" || userRole === "co-admin" || userRole === "coadmin";

  const fetchLiveEvents = async () => {
    const startTime = Date.now();
    try {
      setIsLoading(true);
      setSystemError("");
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/events");
      const data = await response.json();
      if (response.ok) setEvents(data);
      else setSystemError("Failed to parse event database track segments.");
    } catch (err) {
      setSystemError("Cannot resolve connection framework uplink to server.");
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      setTimeout(() => setIsLoading(false), remaining);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/registrations", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        const regs = data.data || data || [];
        setRegistrations(regs);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
    }
  };

  // Helper: get department counts for a specific event
  const getEventDepartmentCounts = (event) => {
    const eventIdStr = event._id?.toString() || "";
    const customEventIdStr = event.eventId?.toString() || "";
    const eventRegs = registrations.filter((r) => {
      const regEventId = r.eventId?._id || r.eventId;
      if (!regEventId) return false;
      const regEventIdStr = regEventId.toString();
      return regEventIdStr === eventIdStr || regEventIdStr === customEventIdStr;
    });
    const counts = {};
    eventRegs.forEach((r) => {
      const dept = r.department || r.createdBy?.department || "Unknown";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  };

  // ---------- EXPORT: EXCEL (only Events Summary) ----------
  const exportAllEventsToExcel = () => {
    if (events.length === 0) { alert("No events to export."); return; }

    // Collect all unique departments from all registrations
    const allDepartments = [...new Set(
      registrations
        .map(r => r.department || r.createdBy?.department || "Unknown")
        .filter(Boolean)
    )];

    const summaryRows = events.map((e, idx) => {
      const base = {
        "S.No": idx + 1,
        "Event ID": e.eventId || "N/A",
        "Title": e.title || "N/A",
        "Date": e.eventDate ? new Date(e.eventDate).toLocaleDateString() : "TBA",
        "Location": e.location || "N/A",
        "Status": e.status || "Active",
        "Teams": registrations.filter(r => {
          const regEventId = r.eventId?._id || r.eventId;
          return regEventId && (regEventId.toString() === e._id?.toString() || regEventId.toString() === e.eventId?.toString());
        }).length,
      };
      const deptCounts = getEventDepartmentCounts(e);
      allDepartments.forEach(dept => {
        base[dept] = deptCounts[dept] || 0;
      });
      return base;
    });

    const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summaryWs, "Events Summary");
    XLSX.writeFile(workbook, `All_Events_Report.xlsx`);
  };

  // ---------- EXPORT: PDF (only Events Summary) ----------
  const exportAllEventsToPDF = () => {
    if (events.length === 0) { alert("No events to export."); return; }
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("All Events Report", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Events: ${events.length}`, 14, 34);

    // Collect all unique departments
    const allDepartments = [...new Set(
      registrations
        .map(r => r.department || r.createdBy?.department || "Unknown")
        .filter(Boolean)
    )];

    // Headers: fixed + department columns
    const fixedHeaders = ["S.No", "Event ID", "Title", "Date", "Location", "Status", "Teams"];
    const headers = [...fixedHeaders, ...allDepartments];

    // Rows
    const rows = events.map((e, idx) => {
      const deptCounts = getEventDepartmentCounts(e);
      const row = [
        idx + 1,
        e.eventId || "N/A",
        e.title || "N/A",
        e.eventDate ? new Date(e.eventDate).toLocaleDateString() : "TBA",
        e.location || "N/A",
        e.status || "Active",
        registrations.filter(r => {
          const regEventId = r.eventId?._id || r.eventId;
          return regEventId && (regEventId.toString() === e._id?.toString() || regEventId.toString() === e.eventId?.toString());
        }).length,
      ];
      allDepartments.forEach(dept => {
        row.push(deptCounts[dept] || 0);
      });
      return row;
    });

    // Column widths
    const columnStyles = {
      0: { cellWidth: 10 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 22 },
      4: { cellWidth: 25 },
      5: { cellWidth: 18 },
      6: { cellWidth: 15 },
    };
    const deptStartIdx = fixedHeaders.length;
    for (let i = 0; i < allDepartments.length; i++) {
      columnStyles[deptStartIdx + i] = { cellWidth: 18 };
    }

    autoTable(doc, {
      startY: 40,
      head: [headers],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: columnStyles,
      didDrawPage: (data) => {
        doc.setFontSize(7);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      },
    });

    doc.save(`All_Events_Report.pdf`);
  };

  // ---------- DELETE, EDIT, REFRESH ----------
  const handleDeleteEvent = async (id) => {
    if (!isAuthorizedAdmin) {
      alert("Access Denied: Admin role privileges are required to perform database removals.");
      return;
    }
    if (!window.confirm("Are you sure you want to completely terminate this event track from database permanently?")) return;
    try {
      const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/events/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
      });
      if (response.ok) {
        alert("Event successfully deleted from DB.");
        setEvents(prev => prev.filter(event => event._id !== id));
        fetchRegistrations();
      } else {
        const errorMsg = await response.json().catch(() => ({}));
        alert(`Server Refused Instruction: ${errorMsg.message || "Failed to drop database node object."}`);
      }
    } catch (err) {
      console.error("Deletion pathway failure trace:", err);
      alert("Network Error: Could not reach backend cluster api.");
    }
  };

  const handleEditRedirect = (eventData) => {
    if (!isAuthorizedAdmin) {
      alert("Access Denied: Admin credentials required.");
      return;
    }
    navigate("/admin/events/manage", { state: { editTargetData: eventData } });
  };

  const refreshAll = () => { fetchLiveEvents(); fetchRegistrations(); };

  const filteredEvents = events.filter(event => event.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 sm:space-y-8 relative p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200/60"
            title="Back to Dashboard"
          >
            <FaArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Event Management
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Create and manage events.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center flex-1 sm:flex-initial min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {isLoading ? "..." : events.length}
            </p>
          </div>
          <button
            onClick={refreshAll}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all shadow-sm"
            title="Refresh Data"
          >
            <FaSync className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} size={14} />
          </button>
          {/* ---- EXPORT BUTTONS ---- */}
          {!isLoading && events.length > 0 && (
            <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-2">
              <button
                onClick={exportAllEventsToExcel}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200 transition-all flex items-center gap-1"
                title="Export All Events to Excel"
              >
                <FaFileExcel size={12} />
                <span>All Excel</span>
              </button>
              <button
                onClick={exportAllEventsToPDF}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 transition-all flex items-center gap-1"
                title="Export All Events to PDF"
              >
                <FaFilePdf size={12} />
                <span>All PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH & ADD */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 border border-slate-200/60 p-3 sm:p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search events by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>
        {isAuthorizedAdmin && (
          <button
            onClick={() => navigate("/admin/events/manage")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm border border-blue-700"
          >
            <FaPlusCircle className="text-amber-400" size={14} />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* EVENT GRID */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FaSync className="animate-spin text-blue-600 text-3xl" />
            <p className="text-sm font-bold text-slate-500">Fetching events...</p>
          </div>
        ) : systemError ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-bold">
            {systemError}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full border border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <FaRegFolderOpen size={18} />
            </div>
            <p className="text-sm font-bold text-slate-900">No Events Found</p>
            <p className="text-xs text-slate-400 mt-1">Check your database or create a new event.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventCard
                    event={event}
                    isAdminRoute={isAuthorizedAdmin}
                    onEdit={() => handleEditRedirect(event)}
                    onDelete={() => handleDeleteEvent(event._id)}
                    registrations={registrations}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;