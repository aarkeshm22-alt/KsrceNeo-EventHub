import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaCircle,
  FaFileExcel,
  FaFilePdf,
  FaArrowLeft,
  FaSync,
  FaEye,
  FaTimes,
  FaUserTie,
  FaUsers,
  FaHashtag,
  FaCalendar,
  FaCommentDots
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ViewSubmissions = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [remarksFilter, setRemarksFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // All distinct levels from events
  const [allLevels, setAllLevels] = useState(["All"]);

  // Drawer state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ---------- FETCH DISTINCT LEVELS (from events) ----------
  const fetchDistinctLevels = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/events/distinct-levels", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const levels = data.levels || data || [];
        setAllLevels(["All", ...levels]);
      } else {
        setAllLevels(["All"]);
      }
    } catch (err) {
      console.error("Error fetching distinct levels:", err);
      setAllLevels(["All"]);
    }
  };

  // ---------- FETCH DATA ----------
  const fetchData = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        year: yearFilter,
        remarks: remarksFilter
      }).toString();

      const token = localStorage.getItem("token");
      const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/registrations/view-submissions?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setEventData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      setTimeout(() => setLoading(false), remaining);
    }
  };

  useEffect(() => {
    fetchDistinctLevels();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 350);
    return () => clearTimeout(delay);
  }, [searchTerm, statusFilter, yearFilter, remarksFilter]);

  // ========================================================
  // EXPORT FUNCTIONS (Excel & PDF)
  // ========================================================
  const exportToExcel = () => {
    if (eventData.length === 0) {
      alert("No data to export.");
      return;
    }
    const flattenedRows = eventData.map((item, index) => ({
      "S.No": index + 1,
      "Department": item.department || item.createdBy?.department || "CSE",
      "Event ID": item.eventId?.customEventId || item.eventId?.code || "N/A",
      "Event Name": item.eventId?.eventName || item.eventId?.title || "Unknown Event",
      "Team Name": item.teamName || "Unnamed Team",
      "Project Title": item.projectTitle || "N/A",
      "Project Domain": item.projectDomain || "N/A",
      "Project Description": item.eventId?.description || "No description.",
      "Lead Name": item.leadName || "N/A",
      "Lead Email": item.leadEmail || "N/A",
      "Lead Phone": item.leadPhone || "N/A",
      "Year": item.year || "N/A",
      "Section": item.section || "A",
      "Team Members": Array.isArray(item.members) ? item.members.join(", ") : "None",
      "Assigned SPOC": item.departmentMentor?.name || "Allocation Pending",
      "Personal Mentor": item.personalMentor || "Not Specified",
      "Status": item.status || "Pending",
      "Current Level": item.review || item.remarks || "No level",
      "Submission Date": item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"
    }));
    const worksheet = XLSX.utils.json_to_sheet(flattenedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    XLSX.writeFile(workbook, `Submissions_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    if (eventData.length === 0) {
      alert("No data to export.");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SUBMISSIONS REPORT", 14, 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()} | Filter - Status: ${statusFilter}, Year: ${yearFilter}, Level: ${remarksFilter}`, 14, 21);

    const tableHeaders = [
      ["S.No", "Dept", "Event", "Project", "Lead", "Team", "Mentors", "Status", "Level"]
    ];
    const tableRows = eventData.map((item, index) => {
      const dept = item.department || item.createdBy?.department || "CSE";
      const eventName = item.eventId?.eventName || item.eventId?.title || "Unknown";
      const reviewRemarks = item.review || item.remarks || "No level";
      return [
        index + 1,
        dept,
        `ID: ${item.eventId?.customEventId || "N/A"}\nName: ${eventName}`,
        `Title: ${item.projectTitle || "N/A"}\nDomain: ${item.projectDomain || "N/A"}`,
        `Lead: ${item.leadName || "N/A"}\nEmail: ${item.leadEmail || "N/A"}`,
        `Team: ${item.teamName || "Unnamed Team"}\nYear: ${item.year || "N/A"}\nMembers: ${Array.isArray(item.members) ? item.members.join(", ") : "None"}`,
        `SPOC: ${item.departmentMentor?.name || "Pending"}\nPersonal: ${item.personalMentor || "Not Specified"}`,
        item.status || "Pending",
        reviewRemarks
      ];
    });
    autoTable(doc, {
      startY: 26,
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 15 },
        2: { cellWidth: 35 },
        3: { cellWidth: 45 },
        4: { cellWidth: 40 },
        5: { cellWidth: 45 },
        6: { cellWidth: 35 },
        7: { cellWidth: 20 },
        8: { cellWidth: 25 }
      }
    });
    doc.save(`Submissions_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Open/close drawer
  const openDrawer = (submission) => {
    setSelectedSubmission(submission);
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedSubmission(null);
  };

  // Helpers
  const formatDate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setYearFilter("All");
    setRemarksFilter("All");
    setShowFilterDropdown(false);
  };

  const isFilterActive = statusFilter !== "All" || yearFilter !== "All" || remarksFilter !== "All";

  // Handlers that close the dropdown after selection
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setShowFilterDropdown(false);
  };

  const handleYearChange = (value) => {
    setYearFilter(value);
    setShowFilterDropdown(false);
  };

  const handleRemarksChange = (value) => {
    setRemarksFilter(value);
    setShowFilterDropdown(false);
  };

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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Event Submissions
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              View, filter, and export event submissions from all departments.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center flex-1 sm:flex-initial min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered / Total</p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {loading ? "..." : eventData.length}{' '}
              <span className="text-slate-300 text-xs font-normal">
                / {loading ? "..." : eventData.length}
              </span>
            </p>
          </div>
          <button
            onClick={() => { fetchData(); fetchDistinctLevels(); }}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all shadow-sm"
            title="Refresh Data"
          >
            <FaSync className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} size={14} />
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-50 border border-slate-200/60 p-3 sm:p-4 rounded-2xl">
        <div className="relative w-full lg:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by ID, event, team or lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Export buttons */}
          <div className="flex gap-1">
            <button
              onClick={exportToExcel}
              disabled={loading || eventData.length === 0}
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFileExcel size={12} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              disabled={loading || eventData.length === 0}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFilePdf size={12} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-xs text-xs font-bold gap-2
                ${showFilterDropdown || isFilterActive ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"}`}
            >
              <FaFilter size={11} />
              <span className="max-sm:hidden">Filters</span>
              {isFilterActive && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`
                    absolute top-full mt-2.5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-3.5
                    left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm
                    sm:left-auto sm:right-0 sm:translate-x-0 sm:w-72
                    max-h-[80vh] overflow-y-auto
                  `}
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Year</label>
                    <select
                      value={yearFilter}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      <option value="All">All Batches</option>
                      <option value="I">I Year</option>
                      <option value="II">II Year</option>
                      <option value="III">III Year</option>
                      <option value="IV">IV Year</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Remarks</label>
                    <select
                      value={remarksFilter}
                      onChange={(e) => handleRemarksChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      {allLevels.map((level) => (
                        <option key={level} value={level}>
                          {level === "All" ? "All Levels" : level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 text-left"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 w-12 text-center">s.no</th>
                <th className="py-4 px-4">Dept</th>
                <th className="py-4 px-4">Event ID</th>
                <th className="py-4 px-4 hidden sm:table-cell">Event Name</th>
                <th className="py-4 px-4">Team</th>
                <th className="py-4 px-4">Lead</th>
                <th className="py-4 px-4 hidden md:table-cell">Year / Sec</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 min-w-[120px]">Level</th>
                <th className="py-4 px-4 text-center w-12">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaSync className="animate-spin text-blue-600 text-3xl" />
                        <p className="text-sm font-bold text-slate-500">Fetching submissions...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-red-500 font-bold text-xs bg-red-50/30">
                      ⚠️ {error}
                    </td>
                  </tr>
                ) : eventData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-20 text-center text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                      No entries found matching active filtering query parameters.
                    </td>
                  </tr>
                ) : (
                  eventData.map((item, index) => {
                    const displayEventId = item.eventId?.customEventId || item.eventId?.code || "N/A";
                    const displayEventName = item.eventId?.eventName || item.eventId?.title || "Unknown Event";
                    const currentStatus = item.status || "Pending Approval";
                    const isPending = currentStatus.includes("Pending");
                    const level = item.review || item.remarks || "No level";

                    return (
                      <motion.tr
                        key={item._id || index}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50/50 group transition-colors"
                      >
                        <td className="py-4 px-4 text-center font-bold text-slate-300 w-12">
                          {index + 1}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-blue-600 tracking-wider">
                            {item.department || item.createdBy?.department || "CSE"}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono bg-slate-100/80 border border-slate-200/50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 tracking-wide block max-w-[120px] truncate" title={displayEventId}>
                            {displayEventId}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900 max-w-[150px] truncate hidden sm:table-cell" title={displayEventName}>
                          {displayEventName}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-slate-900 font-bold">
                            {item.teamName || "Unnamed Team"}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-slate-600">
                            {item.leadName || item.teamLead || "Not Specified"}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap hidden md:table-cell">
                          <span className="text-slate-600">
                            {item.year ? `${item.year} Year` : "N/A"} {item.section ? `(Sec ${item.section})` : ""}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                            ${currentStatus === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              isPending ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-rose-50 text-rose-600 border-rose-100"}`}>
                            <FaCircle size={4} className={isPending ? "animate-pulse" : ""} />
                            {currentStatus}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-600 max-w-[180px] truncate" title={level}>
                          {level}
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

      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedSubmission && (
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
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Submission Details</h3>
                  <p className="text-xs text-slate-400 font-medium">Complete submission information</p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-5 py-6">
                {/* Event & Project */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaHashtag className="text-blue-500" /> Event & Project
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Event Name</p>
                      <p className="font-bold text-slate-900">{selectedSubmission.eventId?.eventName || selectedSubmission.eventId?.title || "Unknown"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Event ID</p>
                      <p className="font-mono font-bold text-slate-700">{selectedSubmission.eventId?.customEventId || selectedSubmission.eventId?.code || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Description</p>
                      <p className="text-slate-700 text-sm">{selectedSubmission.eventId?.description || "No description."}</p>
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
                      <p className="font-bold text-slate-900">{selectedSubmission.projectTitle || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Domain</p>
                      <p className="font-bold text-slate-700">{selectedSubmission.projectDomain || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Team Name</p>
                      <p className="font-bold text-slate-900">{selectedSubmission.teamName || "Unnamed Team"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Personal Mentor</p>
                      <p className="font-bold text-slate-700">{selectedSubmission.personalMentor || "Not Specified"}</p>
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
                      <p className="font-bold text-slate-900">{selectedSubmission.leadName || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                      <p className="font-mono text-xs text-slate-700 truncate">{selectedSubmission.leadEmail || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                      <p className="font-bold text-slate-700">{selectedSubmission.leadPhone || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Year</p>
                      <p className="font-bold text-slate-700">{selectedSubmission.year || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Section</p>
                      <p className="font-bold text-slate-700">{selectedSubmission.section || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUsers className="text-blue-500" /> Team Members
                  </h4>
                  {selectedSubmission.members && selectedSubmission.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedSubmission.members.map((member, idx) => (
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

                {/* Mentor / SPOC */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaUserTie className="text-blue-500" /> Assigned Mentors & SPOC
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Department SPOC</p>
                      <p className="font-bold text-slate-900">{selectedSubmission.departmentMentor?.name || "Allocation Pending"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Personal Mentor</p>
                      <p className="font-bold text-slate-900">{selectedSubmission.personalMentor || "Not Specified"}</p>
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
                        ${selectedSubmission.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          selectedSubmission.status?.includes("Pending") ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-rose-50 text-rose-600 border-rose-100"}`}>
                        <FaCircle size={4} className={selectedSubmission.status?.includes("Pending") ? "animate-pulse" : ""} />
                        {selectedSubmission.status || "Pending Approval"}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted</p>
                      <p className="font-bold text-slate-700">{formatDate(selectedSubmission.createdAt)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Last Updated</p>
                      <p className="font-bold text-slate-700">{formatDate(selectedSubmission.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Current Level */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaCommentDots className="text-blue-500" /> Current Level
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700">{selectedSubmission.review || selectedSubmission.remarks || "No level set."}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
                Submission ID: {selectedSubmission._id || selectedSubmission.id || "N/A"}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewSubmissions;