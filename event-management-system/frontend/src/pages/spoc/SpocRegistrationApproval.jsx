import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner,
  FaCircleCheck,
  FaCircleXmark,
  FaCircleDot,
  FaMagnifyingGlass,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaUserTie,
  FaUsers,
  FaHashtag,
  FaArrowLeft,
  FaArrowsRotate,
  FaXmark
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const SpocApproval = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [updatingRemarks, setUpdatingRemarks] = useState({});
  const debounceTimeout = useRef(null);

  // ===== NEW: Cache for event levels =====
  const [eventsMap, setEventsMap] = useState({}); // key: eventId (custom), value: levels array

  // Default options – used ONLY if the event has no levels
  const DEFAULT_OPTIONS = ["Registered", "In Progress", "Idea Submitted", "Presentation Completed"];

  // ----------------------------------------------------------------
  // GET SPOC DEPARTMENT
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
  // FETCH ALL EVENTS (to get levels)
  // ----------------------------------------------------------------
  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/events", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        const eventsArray = Array.isArray(result) ? result : result.data || [];
        const map = {};
        eventsArray.forEach(ev => {
          // Use the custom eventId as the key
          const key = ev.eventId || ev._id;
          map[key] = ev.levels || [];
        });
        setEventsMap(map);
      } else {
        console.warn("Failed to fetch events for levels:", result.message);
      }
    } catch (err) {
      console.warn("Could not fetch events:", err);
    }
  };

  // ----------------------------------------------------------------
  // FETCH REGISTRATIONS
  // ----------------------------------------------------------------
  const fetchRegistrations = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let url = `https://ksrceneo-eventhub.onrender.com/api/registrations/department-requests?department=${encodeURIComponent(spocDepartment)}`;
      if (statusFilter !== "All") {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();

      if (response.ok) {
        const data = result.data || result;
        if (Array.isArray(data)) {
          setRegistrations(data);
        } else {
          setRegistrations([]);
          setError("Unexpected data format from server.");
        }
      } else if (response.status === 403) {
        setError("Access forbidden. You are not authorized to view these registrations.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.message || "Failed to fetch registrations.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  };

  // ----------------------------------------------------------------
  // EFFECT: fetch events and registrations on mount/filter changes
  // ----------------------------------------------------------------
  useEffect(() => {
    fetchAllEvents();
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  // ----------------------------------------------------------------
  // RESET FILTERS
  // ----------------------------------------------------------------
  const resetFilters = () => {
    setStatusFilter("All");
    setSearchQuery("");
  };

  // ----------------------------------------------------------------
  // STATUS UPDATE
  // ----------------------------------------------------------------
  const handleStatusUpdate = async (regId, newStatus) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/registrations/${regId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (response.ok && (result.success || result.message)) {
        alert(`Registration ${newStatus.toLowerCase()} successfully!`);
        fetchRegistrations();
      } else {
        alert(result.message || "Update failed.");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------------
  // REMARKS UPDATE (debounced)
  // ----------------------------------------------------------------
  const updateRemarks = (regId, remarks) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(async () => {
      try {
        setUpdatingRemarks((prev) => ({ ...prev, [regId]: true }));
        const token = localStorage.getItem("token");
        const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/registrations/${regId}/remarks`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ remarks })
        });
        const result = await response.json();
        if (!response.ok) {
          console.error("Failed to update remarks:", result.message);
        }
      } catch (err) {
        console.error("Error updating remarks:", err);
      } finally {
        setUpdatingRemarks((prev) => ({ ...prev, [regId]: false }));
      }
    }, 500);
  };

  const handleRemarksChange = (regId, value) => {
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg._id === regId ? { ...reg, remarks: value } : reg
      )
    );
    updateRemarks(regId, value);
  };

  // ----------------------------------------------------------------
  // TOGGLE EXPANDED ROW
  // ----------------------------------------------------------------
  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ----------------------------------------------------------------
  // HELPER: FORMAT DATE
  // ----------------------------------------------------------------
  const formatDateTime = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // ----------------------------------------------------------------
  // ✅ GET EVENT LEVELS FROM CACHE
  // ----------------------------------------------------------------
  const getEventLevels = (reg) => {
    // Registration's eventId is stored as a string (custom eventId) in the schema.
    // But it might also be an object if populated.
    let eventKey = reg.eventId;
    if (reg.eventId && typeof reg.eventId === 'object') {
      // If populated, try to get the custom eventId
      eventKey = reg.eventId.eventId || reg.eventId._id;
    }
    // Fallback to the eventId string
    const levels = eventsMap[eventKey] || [];
    // If no levels defined, we return an empty array – the dropdown will show a placeholder.
    return levels;
  };

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  const totalCount = registrations.length;

  return (
    <div className="space-y-6 sm:space-y-8 relative p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/spoc/dashboard')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200/60"
            title="Back to Dashboard"
          >
            <FaArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Registration Approvals
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Review and manage student submissions for <strong className="text-slate-700">{spocDepartment}</strong> department.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center flex-1 sm:flex-initial min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registrations</p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {loading ? "..." : totalCount}
            </p>
          </div>
          <button
            onClick={() => { fetchAllEvents(); fetchRegistrations(); }}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all shadow-sm"
            title="Refresh Data"
          >
            <FaArrowsRotate className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} size={14} />
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 border border-slate-200/60 p-3 sm:p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by team, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-xs cursor-pointer appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Pending Approval">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={resetFilters}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <FaXmark size={12} />
            <span className="hidden sm:inline">Clear Filters</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 text-center w-12">#</th>
                <th className="py-4 px-4">Event & Project</th>
                <th className="py-4 px-4 hidden md:table-cell">Team Lead</th>
                <th className="py-4 px-4 hidden sm:table-cell">Members</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
                <th className="py-4 px-4 min-w-[180px]">Remarks</th>
                <th className="py-4 px-4 text-center w-12">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan="8" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaArrowsRotate className="animate-spin text-blue-600 text-3xl" />
                        <p className="text-sm font-bold text-slate-500">Fetching registrations...</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : error ? (
                  <motion.tr key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan="8" className="py-12 text-center text-red-500 font-bold text-xs bg-red-50/30">
                      ⚠️ {error}
                    </td>
                  </motion.tr>
                ) : registrations.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan="8" className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-extrabold uppercase tracking-wider text-[11px]">No registrations found for your department</p>
                        <p className="text-xs font-medium">Try adjusting your filters or search term.</p>
                        {(statusFilter !== "All" || searchQuery) && (
                          <button
                            onClick={resetFilters}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-bold underline"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  registrations.flatMap((reg, idx) => {
                    const isExpanded = expandedRows[reg._id] || false;
                    const eventName = reg.eventDetails?.title 
                      || reg.eventId?.eventName 
                      || reg.eventId?.title 
                      || (typeof reg.eventId === 'string' ? reg.eventId : 'Unknown Event');
                    const eventId = reg.eventDetails?.customEventId || reg.eventId?.code || reg.eventId || "N/A";

                    // ===== Get levels from the cache =====
                    const levelOptions = getEventLevels(reg);
                    const currentRemarks = reg.remarks || "";

                    // If the event has no levels, show a message and disable the dropdown
                    const hasLevels = levelOptions.length > 0;

                    // For the dropdown, we show the levels directly (no "Others" unless we want to allow custom remarks)
                    // To allow custom remarks, we can add an "Others" option.
                    // I'll add an "Others" option so SPOCs can still enter free text.
                    const optionsWithOthers = [...levelOptions, "Others (custom)"];
                    const selectedOption = levelOptions.includes(currentRemarks)
                      ? currentRemarks
                      : "Others (custom)";
                    const customText = levelOptions.includes(currentRemarks) ? "" : currentRemarks;

                    const isUpdating = updatingRemarks[reg._id] || false;

                    const rows = [
                      <motion.tr
                        key={reg._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50/50 group transition-colors"
                      >
                        <td className="py-4 px-4 text-center font-mono text-slate-400 w-12">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800">{eventName}</p>
                            <div className="flex flex-col gap-0.5 text-[11px] text-slate-400">
                              <span className="font-medium text-slate-500">{reg.projectTitle}</span>
                              <span>ID: {eventId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">{reg.leadName}</p>
                            <p className="text-[11px] text-slate-400">{reg.leadEmail}</p>
                            <p className="text-[11px] text-slate-400">{reg.year} - Sec {reg.section}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <FaUsers size={12} className="text-slate-400" />
                            <span className="text-xs">{reg.members?.length || 0} members</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            reg.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : reg.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {reg.status === "Approved" ? (
                              <FaCircleCheck size={11} className="text-emerald-500" />
                            ) : reg.status === "Rejected" ? (
                              <FaCircleXmark size={11} className="text-rose-500" />
                            ) : (
                              <FaCircleDot size={10} className="text-amber-500 animate-pulse" />
                            )}
                            <span>{reg.status === "Pending Approval" ? "Pending" : reg.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {reg.status === "Pending Approval" ? (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              <button
                                onClick={() => handleStatusUpdate(reg._id, "Approved")}
                                disabled={submitting}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(reg._id, "Rejected")}
                                disabled={submitting}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Done</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            {hasLevels ? (
                              <>
                                <select
                                  value={selectedOption}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "Others (custom)") {
                                      handleRemarksChange(reg._id, "");
                                    } else {
                                      handleRemarksChange(reg._id, val);
                                    }
                                  }}
                                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                  disabled={reg.status === "Rejected" || isUpdating}
                                >
                                  {optionsWithOthers.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                {selectedOption === "Others (custom)" && (
                                  <input
                                    type="text"
                                    placeholder="Custom..."
                                    value={customText}
                                    onChange={(e) => handleRemarksChange(reg._id, e.target.value)}
                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 w-24 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                    disabled={reg.status === "Rejected" || isUpdating}
                                  />
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No levels defined</span>
                            )}
                            {isUpdating && (
                              <FaSpinner className="animate-spin text-blue-500 text-xs ml-1" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggleRow(reg._id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-blue-600"
                          >
                            {isExpanded ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </td>
                      </motion.tr>
                    ];

                    if (isExpanded) {
                      rows.push(
                        <motion.tr
                          key={`${reg._id}-expanded`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-slate-50/70"
                        >
                          <td colSpan="8" className="p-0">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                              <div className="space-y-3">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-1">
                                  <FaHashtag className="text-blue-500" /> Event & Project
                                </h4>
                                <div className="space-y-1.5">
                                  <p><span className="font-semibold text-slate-500">Event:</span> {eventName}</p>
                                  <p><span className="font-semibold text-slate-500">ID:</span> {eventId}</p>
                                  <p><span className="font-semibold text-slate-500">Description:</span> {reg.eventDetails?.description || reg.eventId?.description || "N/A"}</p>
                                  <p><span className="font-semibold text-slate-500">Domain:</span> {reg.projectDomain}</p>
                                  <p><span className="font-semibold text-slate-500">Team:</span> {reg.teamName}</p>
                                  <p><span className="font-semibold text-slate-500">Personal Mentor:</span> {reg.personalMentor}</p>
                                  <p><span className="font-semibold text-slate-500">Submitted:</span> {formatDateTime(reg.createdAt)}</p>
                                </div>

                                <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-1 mt-2">
                                  <FaUserTie className="text-blue-500" /> Team Lead
                                </h4>
                                <div className="space-y-1.5">
                                  <p><span className="font-semibold text-slate-500">Name:</span> {reg.leadName}</p>
                                  <p><span className="font-semibold text-slate-500">Email:</span> {reg.leadEmail}</p>
                                  <p><span className="font-semibold text-slate-500">Phone:</span> {reg.leadPhone}</p>
                                  <p><span className="font-semibold text-slate-500">Year:</span> {reg.year}</p>
                                  <p><span className="font-semibold text-slate-500">Section:</span> {reg.section}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-1">
                                  <FaUsers className="text-blue-500" /> Team Members
                                </h4>
                                {reg.members && reg.members.length > 0 ? (
                                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {reg.members.map((member, idx) => (
                                      <div key={idx} className="bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
                                        <p className="font-semibold text-slate-800">{member.name}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
                                          <span>Reg No: {member.regNo}</span>
                                          <span>Dept: {member.department}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-slate-400 italic">No additional members.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }

                    return rows;
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpocApproval;