import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaEye,
  FaTimes,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaClock,
  FaWpforms,
  FaPencilAlt,
  FaTrashAlt,
  FaHashtag,
  FaCalendarCheck,
  FaExpand,
  FaDownload,
  FaExclamationTriangle,
  FaUsers,
  FaFileExcel,
  FaFilePdf,
  FaLayerGroup,
  FaClipboardList,
  FaLightbulb,
  FaRocket,
  FaCheckCircle,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ================================================================
// HELPERS
// ================================================================

const getUserRole = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.role || user?.user?.role || null;
    }
    return null;
  } catch {
    return null;
  }
};

const getUserDepartment = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.department || user?.user?.department || null;
    }
    return null;
  } catch {
    return null;
  }
};

// ================================================================
// SKELETON LOADER
// ================================================================

const EventCardSkeleton = () => (
  <div className="group relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
    <div className="h-44 w-full bg-slate-200" />
    <div className="p-6 flex-1 space-y-4">
      <div className="h-6 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="mt-6 pt-4 border-t border-slate-200 flex gap-2">
        <div className="h-10 bg-slate-200 rounded-xl flex-1" />
        <div className="h-10 bg-slate-200 rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

// ================================================================
// PROFESSIONAL LEVEL TIMELINE (redesigned)
// ================================================================
const levelIcons = [
  FaClipboardList, // Registration
  FaUsers,         // Team Formation
  FaLightbulb,     // Idea Submission
  FaRocket,        // Final Pitch
];

const LevelTimeline = ({ levels }) => {
  if (!levels || levels.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
        Event Levels
      </p>
      <div className="relative">
        {/* Vertical solid line */}
        <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-blue-200" />
        <div className="space-y-5">
          {levels.map((level, idx) => {
            const Icon = levelIcons[idx % levelIcons.length] || FaCheckCircle;
            return (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-blue-500 text-blue-600 shadow-sm shrink-0">
                  <Icon size={16} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-sm font-medium text-slate-800">
                    {level}
                  </div>
                  {idx < levels.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-8 bg-blue-200 -translate-x-0.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// MAIN EVENT CARD
// ================================================================

const EventCard = ({
  event,
  onRefresh,
  isAdminRoute = false,
  onEdit,
  onDelete,
  loading = false,
  registrations = [],
}) => {
  const navigate = useNavigate();

  const [showInspector, setShowInspector] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageSrc, setFullImageSrc] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const userRole = getUserRole();
  const isStudent = userRole === "student";
  const isAdmin = userRole === "admin" || userRole === "coadmin";
  const isSpoc = userRole === "spoc";
  const spocDepartment = getUserDepartment();

  const [imgSrc, setImgSrc] = useState(
    event?.image ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
  );

  if (loading || !event) {
    return <EventCardSkeleton />;
  }

  const isClosed = event.status?.toLowerCase() === "closed";
  const isFilling = event.status?.toLowerCase() === "filling fast";

  // ================================================================
  // DYNAMIC EVENT STATUS (based on eventDate)
  // ================================================================
  const getEventStatus = () => {
    const explicitStatus = event.status?.toLowerCase();
    if (explicitStatus && explicitStatus !== "active") {
      const colorMap = {
        'closed': 'bg-slate-900/70 text-slate-200 border-slate-700',
        'completed': 'bg-slate-900/70 text-slate-200 border-slate-700',
        'filling fast': 'bg-amber-500/80 text-slate-950 border-amber-400',
        'in progress': 'bg-amber-500/80 text-slate-950 border-amber-400',
      };
      const dotMap = {
        'closed': 'bg-slate-400',
        'completed': 'bg-slate-400',
        'filling fast': 'bg-amber-400 animate-pulse',
        'in progress': 'bg-amber-400 animate-pulse',
      };
      const label = explicitStatus.charAt(0).toUpperCase() + explicitStatus.slice(1);
      return {
        label,
        color: colorMap[explicitStatus] || 'bg-blue-600/80 text-white border-blue-500',
        dot: dotMap[explicitStatus] || 'bg-amber-400 animate-pulse',
      };
    }

    const now = new Date();
    const eventDate = event.eventDate ? new Date(event.eventDate) : null;
    if (!eventDate) {
      return {
        label: "Active",
        color: "bg-blue-600/80 text-white border-blue-500",
        dot: "bg-amber-400 animate-pulse",
      };
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    if (eventDay < today) {
      return {
        label: "Completed",
        color: "bg-slate-900/70 text-slate-200 border-slate-700",
        dot: "bg-slate-400",
      };
    }
    if (eventDay.getTime() === today.getTime()) {
      return {
        label: "In Progress",
        color: "bg-amber-500/80 text-slate-950 border-amber-400",
        dot: "bg-amber-400 animate-pulse",
      };
    }
    return {
      label: "Upcoming",
      color: "bg-blue-600/80 text-white border-blue-500",
      dot: "bg-amber-400 animate-pulse",
    };
  };

  const { label: statusLabel, color: statusColor, dot: statusDot } = getEventStatus();

  // ================================================================
  // 📊 REGISTRATION COUNTS – FIXED (always returns eventRegs)
  // ================================================================

  const getRegistrationCounts = () => {
    if (!registrations || registrations.length === 0 || !event) {
      return { total: 0, byDepartment: {}, eventRegs: [] };
    }

    const eventIdStr = event._id?.toString() || "";
    const customEventIdStr = event.eventId?.toString() || "";

    const eventRegs = registrations.filter((r) => {
      const regEventId = r.eventId?._id || r.eventId;
      if (!regEventId) return false;
      const regEventIdStr = regEventId.toString();
      return regEventIdStr === eventIdStr || regEventIdStr === customEventIdStr;
    });

    const total = eventRegs.length;
    const byDepartment = {};

    eventRegs.forEach((r) => {
      let dept =
        r.department ||
        r.createdBy?.department ||
        r.student?.department ||
        r.user?.department ||
        r.leadDepartment ||
        r.teamDepartment ||
        null;

      if (!dept) dept = "Unknown";
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    });

    return { total, byDepartment, eventRegs };
  };

  const { total, byDepartment, eventRegs } = getRegistrationCounts();

  let displayCount = null;
  let displayCountLabel = "";

  if (isAdmin) {
    displayCount = total;
    displayCountLabel = "Total Teams";
  } else if (isSpoc && spocDepartment) {
    const deptCount = byDepartment[spocDepartment] || 0;
    displayCount = deptCount;
    displayCountLabel = `${spocDepartment} Teams`;
  }

  const showBreakdown = isAdmin || (isSpoc && spocDepartment);

  // ================================================================
  // EXPORT FUNCTIONS (unchanged)
  // ================================================================

  const exportEventToExcel = () => {
    if (eventRegs.length === 0) {
      alert("No registrations to export for this event.");
      return;
    }

    const rows = eventRegs.map((r, idx) => ({
      "S.No": idx + 1,
      "Department": r.department || r.createdBy?.department || "Unknown",
      "Team Name": r.teamName || "Unnamed Team",
      "Project Title": r.projectTitle || "N/A",
      "Lead Name": r.leadName || "N/A",
      "Lead Email": r.leadEmail || "N/A",
      "Lead Phone": r.leadPhone || "N/A",
      "Year": r.year || "N/A",
      "Section": r.section || "N/A",
      "Members": Array.isArray(r.members) ? r.members.map(m => m.name).join(", ") : "None",
      "Status": r.status || "Pending",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    XLSX.writeFile(workbook, `Event_${event.title}_Registrations.xlsx`);
  };

  const exportEventToPDF = () => {
    if (eventRegs.length === 0) {
      alert("No registrations to export for this event.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Event: ${event.title}`, 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formatCardDate(event.eventDate || event.date)}`, 14, 22);
    doc.text(`Location: ${event.location || "N/A"}`, 14, 28);

    const tableHeaders = [
      ["S.No", "Department", "Team", "Project", "Lead", "Email", "Phone", "Year/Sec", "Members", "Status"]
    ];

    const tableRows = eventRegs.map((r, idx) => [
      idx + 1,
      r.department || r.createdBy?.department || "Unknown",
      r.teamName || "Unnamed Team",
      r.projectTitle || "N/A",
      r.leadName || "N/A",
      r.leadEmail || "N/A",
      r.leadPhone || "N/A",
      `${r.year || "N/A"} - Sec ${r.section || "N/A"}`,
      Array.isArray(r.members) ? r.members.map(m => m.name).join(", ") : "None",
      r.status || "Pending",
    ]);

    autoTable(doc, {
      startY: 35,
      head: tableHeaders,
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 18 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 35 },
        6: { cellWidth: 25 },
        7: { cellWidth: 22 },
        8: { cellWidth: 35 },
        9: { cellWidth: 20 },
      },
    });

    doc.save(`Event_${event.title}_Registrations.pdf`);
  };

  // ================================================================
  // DATE HELPERS
  // ================================================================

  const formatCardDate = (dateString) => {
    if (!dateString) return "TBA";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRegistrationMessages = () => {
    const messages = [];
    const now = new Date();

    if (event.registrationOpenDate) {
      const daysUntilOpen = getDaysRemaining(event.registrationOpenDate);
      if (daysUntilOpen !== null && daysUntilOpen > 0) {
        messages.push({
          label: "Applications open",
          days: daysUntilOpen,
          isWarning: daysUntilOpen <= 3,
        });
      }
    }

    if (event.registrationCloseDate) {
      const openDate = event.registrationOpenDate
        ? new Date(event.registrationOpenDate)
        : null;
      const daysUntilClose = getDaysRemaining(event.registrationCloseDate);
      if (daysUntilClose !== null && daysUntilClose > 0) {
        if (!openDate || now >= openDate) {
          messages.push({
            label: "Applications close",
            days: daysUntilClose,
            isWarning: daysUntilClose <= 3,
          });
        }
      }
    }
    return messages;
  };

  const getEventDateMessage = () => {
    const daysUntilEvent = getDaysRemaining(event.eventDate || event.date);
    if (daysUntilEvent === null) return null;
    if (daysUntilEvent < 0) return { label: "Event passed", days: null, isWarning: false };
    if (daysUntilEvent === 0) return { label: "Event today!", days: 0, isWarning: true };
    return {
      label: "Event in",
      days: daysUntilEvent,
      isWarning: daysUntilEvent <= 3,
    };
  };

  const registrationMessages = getRegistrationMessages();
  const eventMessage = getEventDateMessage();

  // ================================================================
  // ACTIONS
  // ================================================================

  const handleFormRedirection = () => {
    navigate("https://ksrceneo-eventhub.onrender.com/student/register", { state: { event } });
  };

  const handleEditAction = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    } else {
      navigate(`https://ksrceneo-eventhub.onrender.com/admin/edit-event/${event._id || event.id}`, { state: { event } });
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    const targetId = event._id || event.id;
    setPendingDeleteId(targetId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const id = pendingDeleteId;
    if (!id) return;
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
    if (onDelete) {
      onDelete(id);
      return;
    }
    try {
      const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/events/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        alert("Success: Event deleted from MongoDB records!");
        setShowInspector(false);
        if (onRefresh) onRefresh();
      } else {
        alert(`Server Error: ${data.message || "Failed to execute database delete action."}`);
      }
    } catch (err) {
      console.error("Database deletion sync network failure:", err);
      alert("Network Error: Could not connect to the backend server.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
  };

  const handleImageClick = () => {
    setFullImageSrc(imgSrc);
    setShowFullImage(true);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = fullImageSrc;
    link.download = `${event.title || "event"}-banner.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <>
      {/* ============================================================ */}
      {/* EVENT CARD */}
      {/* ============================================================ */}
      <div className="group relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full text-left">
        {/* Banner Area */}
        <div className="relative h-44 w-full overflow-hidden shrink-0 bg-slate-950">
          <img
            src={imgSrc}
            alt={event.title}
            onError={() =>
              setImgSrc(
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop"
              )
            }
            className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out brightness-[90%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

          {/* ✅ DYNAMIC STATUS BADGE */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`inline-flex items-center backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-xl border tracking-wide shadow-xs ${statusColor}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusDot}`} />
              {statusLabel}
            </span>
          </div>

          {isAdminRoute && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={handleEditAction}
                title="Modify Content Specs"
                className="p-2 bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm backdrop-blur-md rounded-xl transition-all active:scale-95"
              >
                <FaPencilAlt size={12} />
              </button>
              <button
                onClick={handleDeleteClick}
                title="Purge Record From DB"
                className="p-2 bg-red-50 hover:bg-red-600 text-red-600 shadow-sm rounded-xl transition-all active:scale-95"
              >
                <FaTrashAlt size={12} />
              </button>
            </div>
          )}

          <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5 text-white text-[11px] font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <FaCalendarAlt size={10} className="text-amber-400" />
            <span>{formatCardDate(event.eventDate || event.date)}</span>
          </div>
        </div>

        {/* Info Layout */}
        <div className="p-6 flex flex-col flex-grow justify-between bg-white">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {event.title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
              {event.description || "No description overview registered for this technical track."}
            </p>

            {/* ============================================================
                PROFESSIONAL EVENT LEVELS – TIMELINE
                ============================================================ */}
            <div className="space-y-1 text-xs font-medium">
              {registrationMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 ${
                    msg.isWarning ? "text-rose-600" : "text-slate-500"
                  }`}
                >
                  <FaCalendarCheck size={11} className="shrink-0" />
                  <span>
                    {msg.label} {msg.days !== null ? `in ${msg.days} day${msg.days !== 1 ? "s" : ""}` : ""}
                  </span>
                </div>
              ))}

              {eventMessage && (
                <div
                  className={`flex items-center gap-1.5 ${
                    eventMessage.isWarning ? "text-rose-600" : "text-slate-500"
                  }`}
                >
                  <FaClock size={11} className="shrink-0" />
                  <span>
                    {eventMessage.label}
                    {eventMessage.days !== null
                      ? ` ${eventMessage.days} day${eventMessage.days !== 1 ? "s" : ""}`
                      : ""}
                  </span>
                </div>
              )}

              {registrationMessages.length === 0 && !eventMessage && (
                <div className="text-slate-400 text-[10px] italic">
                  No upcoming dates available.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-x-4 gap-y-2 pt-1 text-xs text-slate-500 font-bold uppercase tracking-wide">
              <div className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-rose-500 shrink-0" size={12} />
                <span className="truncate max-w-[180px]">
                  {event.location || event.place || "Coimbatore"}
                </span>
              </div>
              {event.createdAt && (
                <span className="flex items-center gap-1.5 normal-case text-[11px] font-medium text-slate-400">
                  <FaClock size={11} className="text-slate-300 shrink-0" />
                  <span>Posted {formatCardDate(event.createdAt)}</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            {displayCount !== null && (
              <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FaUsers className="text-blue-500" size={13} />
                  {displayCountLabel}
                </span>
                <span className="text-lg font-black text-blue-600">{displayCount}</span>
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowInspector(true)}
                className={`${
                  isAdminRoute || isStudent ? "flex-1" : "w-full"
                } text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all`}
              >
                <FaEye />
                <span>View Details</span>
              </button>

              {isAdminRoute && (
                <div className="flex-1 text-xs font-black text-blue-900 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center justify-center gap-1.5 select-none tracking-wider">
                  <FaHashtag className="text-blue-500" size={11} />
                  <span>Event ID: {event.eventId || "EV_00"}</span>
                </div>
              )}

              {isStudent && (
                <button
                  onClick={handleFormRedirection}
                  className="flex-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <FaWpforms />
                  <span>Submit Form</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* INSPECTOR MODAL – with dynamic status and professional timeline */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showInspector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInspector(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Clickable Image */}
              <div
                className="relative w-full h-56 sm:h-72 md:h-80 bg-slate-900 cursor-pointer group overflow-hidden shrink-0"
                onClick={handleImageClick}
              >
                <img
                  src={imgSrc}
                  alt={event.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold">
                    <FaExpand size={14} />
                    <span>Click to view full image</span>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                  <FaExpand size={10} />
                  <span>Expand</span>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 text-xs text-slate-600 no-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Event ID: {event.eventId || "N/A"}
                  </span>
                  <button
                    onClick={() => setShowInspector(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 shadow-xs rounded-lg"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FaInfoCircle size={11} /> Description
                  </h4>
                  <p className="bg-slate-50 border border-slate-200/50 p-3 md:p-4 rounded-xl font-medium text-sm text-slate-700 whitespace-pre-line">
                    {event.description || "No description provided."}
                  </p>
                </div>

                {/* ============================================================
                    PROFESSIONAL EVENT LEVELS – TIMELINE in modal
                    ============================================================ */}
                {event.levels && event.levels.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaLayerGroup size={11} /> Event Levels
                    </h4>
                    <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4">
                      <LevelTimeline levels={event.levels} />
                    </div>
                  </div>
                )}

                {/* Important Dates */}
                {(registrationMessages.length > 0 || eventMessage) && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaCalendarCheck size={11} /> Important Dates
                    </h4>
                    <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 md:p-4 space-y-1.5">
                      {registrationMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-sm font-medium ${
                            msg.isWarning ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          <span>
                            {msg.label}{" "}
                            {msg.days !== null
                              ? `in ${msg.days} day${msg.days !== 1 ? "s" : ""}`
                              : ""}
                          </span>
                        </div>
                      ))}
                      {eventMessage && (
                        <div
                          className={`flex items-center gap-2 text-sm font-medium ${
                            eventMessage.isWarning ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          <span>
                            {eventMessage.label}
                            {eventMessage.days !== null
                              ? ` ${eventMessage.days} day${eventMessage.days !== 1 ? "s" : ""}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                      <FaCalendarAlt size={12} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Event Date</p>
                      <p className="text-slate-800 font-bold mt-0.5">
                        {formatCardDate(event.eventDate || event.date)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <FaMapMarkerAlt size={12} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Venue</p>
                      <p className="text-slate-800 font-bold mt-0.5 truncate max-w-[140px]">
                        {event.location || event.place || "Coimbatore"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <FaClock size={12} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Posted</p>
                      <p className="text-slate-800 font-bold mt-0.5">
                        {event.createdAt ? formatCardDate(event.createdAt) : "Just Now"}
                      </p>
                    </div>
                  </div>

                  {event.registrationOpenDate && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                        <FaCalendarCheck size={12} />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Registration Opens</p>
                        <p className="text-slate-800 font-bold mt-0.5">
                          {formatCardDate(event.registrationOpenDate)}
                          {getDaysRemaining(event.registrationOpenDate) !== null && (
                            <span
                              className={`ml-2 text-[10px] font-bold ${
                                getDaysRemaining(event.registrationOpenDate) <= 3
                                  ? "text-rose-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {getDaysRemaining(event.registrationOpenDate) > 0
                                ? `(in ${getDaysRemaining(event.registrationOpenDate)} days)`
                                : getDaysRemaining(event.registrationOpenDate) === 0
                                ? "(today!)"
                                : "(passed)"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.registrationCloseDate && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                        <FaClock size={12} />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Registration Closes</p>
                        <p className="text-slate-800 font-bold mt-0.5">
                          {formatCardDate(event.registrationCloseDate)}
                          {getDaysRemaining(event.registrationCloseDate) !== null && (
                            <span
                              className={`ml-2 text-[10px] font-bold ${
                                getDaysRemaining(event.registrationCloseDate) <= 3
                                  ? "text-rose-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {getDaysRemaining(event.registrationCloseDate) > 0
                                ? `(in ${getDaysRemaining(event.registrationCloseDate)} days)`
                                : getDaysRemaining(event.registrationCloseDate) === 0
                                ? "(today!)"
                                : "(passed)"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Registrations Breakdown */}
                {showBreakdown && total > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-4 mt-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FaUsers className="text-blue-500" size={12} /> Team Registrations
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
                      {isAdmin ? (
                        Object.entries(byDepartment)
                          .sort((a, b) => b[1] - a[1])
                          .map(([dept, count]) => (
                            <div
                              key={dept}
                              className="flex items-center justify-between text-sm font-medium text-slate-700"
                            >
                              <span>{dept}</span>
                              <span className="font-bold text-blue-600">{count}</span>
                            </div>
                          ))
                      ) : isSpoc && spocDepartment ? (
                        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                          <span>{spocDepartment}</span>
                          <span className="font-bold text-blue-600">
                            {byDepartment[spocDepartment] || 0}
                          </span>
                        </div>
                      ) : null}
                      <div className="border-t border-slate-100 pt-1.5 mt-1.5 flex items-center justify-between text-sm font-bold text-slate-800">
                        <span>Total</span>
                        <span className="text-blue-700">{total}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========== DYNAMIC STATUS IN MODAL ========== */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FaClock size={11} /> Current Status
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Registration Link */}
                {isAdminRoute ? (
                  event.registrationLink ? (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold uppercase text-blue-900 bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-300 py-3.5 rounded-xl transition-all shadow-xs"
                    >
                      <FaExternalLinkAlt size={11} className="text-blue-600" />
                      <span>Navigate for Registration</span>
                    </a>
                  ) : (
                    <div className="w-full inline-flex items-center justify-center text-xs font-bold uppercase text-slate-400 bg-slate-100 border py-3.5 rounded-xl cursor-not-allowed">
                      No Registration link configured
                    </div>
                  )
                ) : isStudent ? (
                  event.registrationLink || event.link ? (
                    <a
                      href={event.registrationLink || event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold uppercase text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl transition-all shadow-sm"
                    >
                      <FaExternalLinkAlt size={11} />
                      <span>Navigate for Registration</span>
                    </a>
                  ) : (
                    <div className="w-full inline-flex items-center justify-center text-xs font-bold uppercase text-slate-400 bg-slate-100 border py-3.5 rounded-xl cursor-not-allowed">
                      No external link configured
                    </div>
                  )
                ) : (
                  <div className="hidden" />
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-3 md:p-4 px-4 md:px-6 flex justify-between items-center shrink-0 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {isAdminRoute ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleEditAction}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 border text-slate-700 text-[10px] font-bold uppercase rounded-xl shadow-2xs transition-all flex items-center gap-1"
                      >
                        <FaPencilAlt className="text-blue-500" size={9} /> Edit
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[10px] font-bold uppercase rounded-xl transition-all flex items-center gap-1"
                      >
                        <FaTrashAlt size={9} /> Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider select-none bg-slate-200/50 px-2.5 py-1.5 rounded-lg border">
                      {isStudent ? "Student View" : "Read-Only"}
                    </span>
                  )}

                  {eventRegs.length > 0 && (
                    <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-2">
                      <button
                        onClick={exportEventToExcel}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200 transition-all flex items-center gap-1"
                        title="Export to Excel"
                      >
                        <FaFileExcel size={12} />
                        <span>Excel</span>
                      </button>
                      <button
                        onClick={exportEventToPDF}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 transition-all flex items-center gap-1"
                        title="Export to PDF"
                      >
                        <FaFilePdf size={12} />
                        <span>PDF</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowInspector(false)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold uppercase rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelDelete}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                  <FaExclamationTriangle className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete Event</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to permanently delete <br />
                  <span className="font-bold text-slate-800">"{event.title}"</span> from the database?
                </p>
                <p className="text-xs text-red-500 font-medium">
                  This action cannot be undone!
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* FULL-SCREEN IMAGE VIEWER */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showFullImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full h-full flex flex-col items-center justify-center"
            >
              <img
                src={fullImageSrc}
                alt="Event Banner"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={downloadImage}
                  className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-colors"
                  title="Download image"
                >
                  <FaDownload size={20} />
                </button>
                <button
                  onClick={() => setShowFullImage(false)}
                  className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EventCard;