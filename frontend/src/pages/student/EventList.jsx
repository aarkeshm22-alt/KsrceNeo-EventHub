import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlusCircle, FaSearch, FaRegCalendarPlus, FaWifi } from "react-icons/fa";

import EventCard from "../../components/cards/EventCard";
import EventModal from "../../components/modals/EventModal";

// ------------------------------------------------------------------
// Skeleton Card Component (matches EventCard layout)
// ------------------------------------------------------------------
const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-2 w-full">
        {/* Title */}
        <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
        {/* Description */}
        <div className="h-4 w-full bg-slate-200 rounded"></div>
        <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
        {/* Meta info */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-3 w-16 bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch events from backend with a 2‑second minimum loading time
  const fetchEvents = async () => {
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/events");
      if (!response.ok) {
        throw new Error("Failed to pull metrics from global event registries.");
      }
      const data = await response.json();
      setEvents(data);
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

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter pipeline
  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 space-y-6">

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Filter event by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-hidden shadow-xs transition-all text-slate-800 font-semibold placeholder-slate-400"
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase sm:normal-case">
            Events
          </h2>
        </div>
        <p className="text-[11px] font-bold text-slate-400 self-end sm:self-auto uppercase tracking-wider">
          {isLoading ? "Syncing..." : ` ${filteredEvents.length} events found`}
        </p>
      </div>

      {/* Dynamic Content Renderer */}
      {isLoading ? (
        // ===== SKELETON GRID =====
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
          <div className="w-10 h-10 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center mx-auto shadow-xs">
            <FaWifi size={14} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-red-900">Database Connection Interruption</p>
            <p className="text-xs text-red-500/80 font-medium max-w-xs mx-auto">
              {error}. Verify that your backend cluster services are active.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id || event.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredEvents.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-16 text-center max-w-xl mx-auto space-y-3 mt-4">
              <div className="w-10 h-10 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                <FaRegCalendarPlus size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">No Events Found..!</p>
              </div>
            </div>
          )}
        </div>
      )}

      <EventModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchEvents(); // Re‑fetch after modal closes
        }}
      />

    </div>
  );
};

export default EventManagement;