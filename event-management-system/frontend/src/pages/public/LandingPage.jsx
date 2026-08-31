import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaChevronRight,
  FaChevronLeft,
  FaLightbulb,
  FaRocket,
  FaLaptopCode,
  FaShieldAlt,
  FaCalendarAlt,
  FaUserTie,
  FaLayerGroup,
  FaExternalLinkAlt,
  FaSpinner,
  FaMapMarkerAlt,
  FaClock,
  FaLock,
  FaInstagram,
  FaLinkedin
} from "react-icons/fa";

// 🖼️ Logo & Images Import
import ksrceneoLogo from "../../assets/KSRCE NEO logo.jpg";
import hero1 from "../../assets/hero1.jpeg";
import hero2 from "../../assets/hero2.jpeg";
import hero3 from "../../assets/hero3.jpeg";
import hero4 from "../../assets/hero4.jpeg";
import hero5 from "../../assets/hero5.jpeg";

// Core offerings (unchanged)
const coreOfferings = [
  {
    title: "Pre-Incubation Program",
    icon: FaLightbulb,
    description:
      "Nurturing early-stage concepts through validation, structured mentorship, and early exposure to the regional startup ecosystem.",
  },
  {
    title: "Incubation Program",
    icon: FaRocket,
    description:
      "Supporting high-potential startups with physical infrastructure, expert guidance, and market linkages to accelerate commercial growth.",
  },
  {
    title: "Mentorship & Guidance",
    icon: FaUserTie,
    description:
      "Direct connection with experienced industry mentors who help student builders refine ideas, build products, and scale successfully.",
  },
  {
    title: "Zoho Enterprise Perks",
    icon: FaLaptopCode,
    description:
      "Exclusive partnership granting ₹1.86 Lakhs in Zoho Wallet Credits (360 days validity) for full access to CRM, finance, and marketing suites.",
  },
  {
    title: "Proof of Concept (POC) Scaling",
    icon: FaLayerGroup,
    description:
      "Hands-on assistance in transforming raw academic concepts into validated POCs ready for government and institutional grants.",
  },
  {
    title: "StartupTN Alignment",
    icon: FaShieldAlt,
    description:
      "Direct connection with Tamil Nadu's official startup ecosystem, expanding visibility for regional grants, policies, and investor panels.",
  },
];

const whyChooseUsFeatures = [
  {
    title: "Centralized Event Postings",
    desc: "Admins and Co-Admins publish real-time hackathons, ideathons, workshops, and innovation challenges directly to one clean portal.",
  },
  {
    title: "Direct Student Registration",
    desc: "Students can browse live event calendars, inspect official specifications, and register seamlessly without messy forms.",
  },
  {
    title: "Verified Ecosystem Access",
    desc: "Backed by KSRCE Council for Innovation & Incubation (Section 8 Co.) with government support from StartupTN.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel state for events
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // ===== IMAGE CAROUSEL STATE =====
  const heroImages = [hero1, hero2, hero3, hero4, hero5];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 📡 FETCH EVENTS – SORTED ASCENDING BY EVENT DATE
  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://ksrceneo-eventhub.onrender.com/api/events");
        const fetchedData = response.data.events || response.data;
        const eventsArray = Array.isArray(fetchedData) ? fetchedData : [];

        const sortedEvents = eventsArray.sort((a, b) => {
          const dateA = a.eventDate ? new Date(a.eventDate) : new Date(8640000000000000);
          const dateB = b.eventDate ? new Date(b.eventDate) : new Date(8640000000000000);
          return dateA - dateB;
        });

        setEvents(sortedEvents);
      } catch (err) {
        console.error("Failed to fetch events from database:", err);
        setError("Could not load active events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvents();
  }, []);

  // 📱 RESPONSIVE ITEMS PER PAGE
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerPage(1);
      else if (width < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Reset page when events or itemsPerPage change
  useEffect(() => {
    setCurrentPage(0);
  }, [events, itemsPerPage]);

  // ===== AUTO-ROTATE IMAGES EVERY 5 SECONDS =====
  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Carousel helpers for events
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIdx = currentPage * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentEvents = events.slice(startIdx, endIdx);

  const goToNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const goToPrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper: determine event status based on eventDate (today or future => In Progress, past => Ended)
  const getEventStatus = (eventDate) => {
    if (!eventDate) return "Ended";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);
    return eventDateObj >= today ? "In Progress" : "Ended";
  };

  const handleViewDetails = (event) => {
    navigate("/login", {
      state: {
        message: `Please log in to view complete details and register for ${event.title}.`,
      },
    });
  };

  return (
    <div className="bg-white text-slate-800 min-h-screen font-sans w-full max-w-full overflow-x-hidden relative selection:bg-amber-400 selection:text-slate-900">
      
      {/* 🧭 NAVIGATION BAR (unchanged) */}
      <nav className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center w-full">
          <div className="flex items-center gap-3 max-w-[75%] sm:max-w-full">
            <img
              src={ksrceneoLogo}
              alt="KSRCE NEO Logo"
              className="h-9 sm:h-10 lg:h-11 w-auto object-contain rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm flex-shrink-0"
            />
            <div className="flex flex-col leading-tight overflow-hidden">
              <h1 className="text-[13px] sm:text-base lg:text-lg font-black tracking-tight text-slate-900 uppercase truncate">
                KSRCE <span className="text-amber-500">NEO</span> <span className="hidden sm:inline">Event Hub</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-500 uppercase truncate">
                Innovation & Incubation Council
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link
              to="/login"
              className="hidden xs:inline-block text-[11px] sm:text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors px-1 sm:px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex-shrink-0"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== EVENTS SECTION WITH CAROUSEL ========== */}
      <section className="pt-24 md:pt-28 pb-6 md:pb-10 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-14 gap-3 text-center md:text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block">
                Events Directory
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Active Events
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-xs mx-auto md:mx-0">
              {loading ? "Syncing..." : `${events.length} events found`}
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <FaSpinner className="animate-spin text-amber-500 text-3xl" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Loading events from database...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 text-xs font-bold">
              {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
              <p className="text-slate-800 font-black text-base">No active events posted yet.</p>
              <p className="text-slate-500 text-xs font-medium">Check back soon! Admin and Co-Admin are constantly adding new events.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 transition-all duration-300">
                {currentEvents.map((event, index) => {
                  const status = getEventStatus(event.eventDate);
                  const isInProgress = status === "In Progress";
                  return (
                    <div
                      key={event._id || `event-${index}`}
                      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 lg:p-7 hover:shadow-lg hover:border-amber-400 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[50%]">
                            {event.eventId || "EVENT"}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isInProgress
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {status}
                            </span>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                              {formatDate(event.eventDate)}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight line-clamp-2 mb-2 min-h-[2.5rem]">
                          {event.title}
                        </h3>

                        <div className="space-y-1.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-amber-500 flex-shrink-0" size={12} />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-amber-500 flex-shrink-0" size={12} />
                            <span className="truncate">Open: <strong>{formatDate(event.registrationOpenDate)}</strong></span>
                          </div>
                        </div>

                        <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] sm:text-[11px] font-semibold flex items-center gap-2">
                          <FaLock className="text-amber-600 flex-shrink-0" size={12} />
                          <span className="truncate">Login required to access full details and register.</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewDetails(event)}
                        className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        View Details & Register <FaChevronRight className="text-[10px]" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 md:mt-10">
                  <button
                    onClick={goToPrev}
                    disabled={currentPage === 0}
                    className={`p-2.5 rounded-xl border transition-all ${
                      currentPage === 0
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-slate-300 text-slate-600 hover:bg-slate-900 hover:text-amber-400 hover:border-slate-900"
                    }`}
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === currentPage
                            ? "bg-slate-900 w-6"
                            : "bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages - 1}
                    className={`p-2.5 rounded-xl border transition-all ${
                      currentPage === totalPages - 1
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-slate-300 text-slate-600 hover:bg-slate-900 hover:text-amber-400 hover:border-slate-900"
                    }`}
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ========== 2. WHAT IS KSRCE NEO? – WITH AUTO-ROTATING IMAGE CAROUSEL ========== */}
      <section className="pt-6 md:pt-12 pb-16 md:pb-24 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          <div className="md:col-span-1 lg:col-span-7 space-y-4 md:space-y-5 text-center lg:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
              Nurturing Emerging Opportunities
            </span>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              What is <span className="text-amber-500">KSRCE NEO</span>?
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              <strong className="text-slate-900">KSRCE Council for Innovation and Incubation</strong> is a Section 8 Non-Profit Organization affiliated with K.S.R. College of Engineering, Tiruchengode, and officially supported by <strong className="text-slate-900">StartupTN</strong>.
            </p>

            <blockquote className="border-l-4 border-amber-500 pl-4 py-1 italic text-slate-700 text-xs sm:text-sm md:text-base font-semibold bg-amber-50/50 rounded-r-lg">
              “Where Ideas Hatch and Startups Launch.”
            </blockquote>

            <p className="text-slate-600 text-[11px] sm:text-xs md:text-sm lg:text-base font-medium leading-relaxed">
              NEO serves as a regional ecosystem designed to bridge academic technology research and real-world commercial entrepreneurship—validating student ideas, building proof of concepts (POCs), and launching viable technology startups.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="https://www.ksrceneo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md group w-full sm:w-auto justify-center"
              >
                Visit our Official Website (ksrceneo.com)
                <FaExternalLinkAlt className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <div className="pt-2 sm:pt-4 flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              <div className="bg-white border border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-2xs flex-1 sm:flex-none min-w-[80px]">
                <span className="block text-lg sm:text-xl font-black text-slate-900">14+</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 uppercase tracking-wider">Startups Onboarded</span>
              </div>
              <div className="bg-white border border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-2xs flex-1 sm:flex-none min-w-[80px]">
                <span className="block text-lg sm:text-xl font-black text-slate-900">50+</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 uppercase tracking-wider">Ideas Validated</span>
              </div>
              <div className="bg-white border border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-2xs flex-1 sm:flex-none min-w-[80px]">
                <span className="block text-lg sm:text-xl font-black text-slate-900">10+</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 uppercase tracking-wider">POCs Developed</span>
              </div>
            </div>
          </div>

          {/* === IMAGE CAROUSEL === */}
          <div className="md:col-span-1 lg:col-span-5 relative mt-6 md:mt-0">
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
                {heroImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`KSRCE NEO Innovation ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                      idx === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-3">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-amber-500 w-6"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md border border-white/20 pointer-events-none">
                Campus Events
              </div>

              <div className="p-3 bg-slate-900 rounded-lg mt-2 text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Campus Hackathons & Ideathons
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate">
                    Students pitching live prototypes to jury
                  </p>
                </div>
                <FaCalendarAlt className="text-amber-400 text-base sm:text-lg flex-shrink-0 ml-2" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3️⃣ WHAT WE ARE PROVIDING (unchanged) */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-3">
            <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full tracking-wider">
              Official Offerings & Programs
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              What We Are Providing
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
              Direct support programs and startup infrastructure backed by KSRCE NEO, StartupTN, and corporate partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            {coreOfferings.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`offering-${idx}`}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm md:text-[15px] font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4️⃣ WHY THIS SITE? (unchanged) */}
      <section className="py-16 md:py-20 px-4 sm:px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="md:col-span-1 lg:col-span-5 space-y-4 text-center lg:text-left">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400 block">
              Purpose & Platform Scope
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Why This Site?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
              This platform serves as the single official event portal for KSRCE NEO. Admins and Co-Admins post upcoming hackathons, ideathons, and innovation challenges so student builders can easily explore, review specs, and register in one central place.
            </p>
          </div>

          <div className="md:col-span-1 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {whyChooseUsFeatures.map((feat, idx) => (
              <div
                key={`why-${idx}`}
                className="bg-slate-800/80 border border-slate-700/80 p-4 sm:p-5 rounded-2xl space-y-2 text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-400/20">
                  0{idx + 1}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏢 FOOTER – with Instagram & LinkedIn */}
      <footer className="bg-slate-900 text-slate-400 py-6 sm:py-8 px-4 sm:px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
              KSRCE <span className="text-amber-400">NEO</span> Event Hub
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              KSRCE Council for Innovation & Incubation &bull; K.S.R. College of Engineering
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/ksrceneo?igsi=MWh2NGdrcTI1aHBlbQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 transition-colors duration-200"
              aria-label="Instagram"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href="https://www.linkedin.com/company/ksrce-neo/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={18} />
            </a>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} KSRCE NEO. All Rights Reserved.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;