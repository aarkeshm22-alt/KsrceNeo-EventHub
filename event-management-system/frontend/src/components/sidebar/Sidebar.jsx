import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Sidebar = ({ menu = [], sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* MOBILE SCREEN BACKGROUND DIMMER */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR MAIN CONTAINER */}
      <motion.div
        layout
        className={`bg-white border-r border-slate-200/80 flex flex-col justify-between z-50 select-none
          fixed inset-y-0 left-0 h-screen lg:sticky lg:top-0 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
          ${
            /* MOBILE DISPLAY RULES */
            sidebarOpen
              ? "max-lg:translate-x-0 max-lg:w-64"
              : "max-lg:-translate-x-full max-lg:w-64 pointer-events-none lg:pointer-events-auto"
          }
          ${
            /* DESKTOP DISPLAY RULES */
            sidebarOpen ? "lg:w-64" : "lg:w-20"
          }
        `}
      >
        {/* HEADER / BRANDING SECTION */}
        <div className={`h-20 flex items-center shrink-0 border-b border-slate-100 relative ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-2'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {/* BRAND LOGO CONSOLE */}
            <div className="w-10 h-10 min-w-[40px] bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/10 tracking-wider">
              K
            </div>

            {/* SHOW BRAND TEXT ONLY WHEN EXPANDED */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col text-left whitespace-nowrap overflow-hidden"
              >
                <span className="font-extrabold text-slate-900 tracking-tight text-sm leading-tight">
                  Event<span className="text-blue-600">Hub</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                  KSRCE-NEO
                </span>
              </motion.div>
            )}
          </div>

          {/* TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              z-50 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center
              
              /* Desktop Layout: Hanging toggle button */
              lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:-right-3.5 lg:w-7 lg:h-7 lg:bg-white lg:hover:bg-slate-50 lg:border lg:border-slate-200 lg:shadow-xs lg:text-slate-400 lg:hover:text-slate-800
              
              /* Mobile Layout */
              max-lg:w-9 max-lg:h-9 max-lg:bg-slate-50 max-lg:hover:bg-slate-100 max-lg:border max-lg:border-slate-200/60 max-lg:text-slate-500 max-lg:hover:text-slate-800
            `}
          >
            {sidebarOpen ? (
              <>
                <FaTimes size={13} className="lg:hidden" />
                <FaChevronLeft size={9} className="max-lg:hidden" />
              </>
            ) : (
              <FaChevronRight size={9} />
            )}
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 scrollbar-none overscroll-contain">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={!sidebarOpen ? item.name : undefined} // Shows hover tooltip when collapsed
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={({ isActive }) => `
                  flex items-center rounded-xl text-xs font-bold transition-all duration-200 relative group/link cursor-pointer
                  ${
                    sidebarOpen
                      ? "px-4 py-3.5 gap-3.5 justify-start"
                      : "p-3.5 justify-center w-11 h-11 mx-auto"
                  }
                  ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* ACTIVE INDICATOR BACKGROUND */}
                    {isActive && (
                      <motion.div
                        layoutId="activeLightIndicator"
                        className="absolute inset-0 bg-blue-50/60 border border-blue-100/50 rounded-xl -z-10 shadow-3xs"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* ICON */}
                    <Icon
                      size={18}
                      className={`transition-all duration-200 shrink-0 ${
                        isActive
                          ? "text-blue-600 scale-105"
                          : "text-slate-400 group-hover/link:text-slate-700 group-hover/link:scale-105"
                      }`}
                    />

                    {/* TEXT LABEL - STRICTLY RENDERED ONLY WHEN OPEN */}
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="whitespace-nowrap font-bold tracking-wide truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* FOOTER SECTION */}
        <div
          className={`p-4 border-t border-slate-100 shrink-0 bg-slate-50/40 flex items-center ${
            sidebarOpen ? "px-5 py-4 justify-start" : "justify-center py-4"
          }`}
        >
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col text-left gap-0.5 overflow-hidden"
            >
              <span className="text-[10px] font-extrabold text-slate-700 tracking-wider truncate uppercase">
                K.S.R.
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-tight truncate">
                College of Engineering
              </span>
            </motion.div>
          ) : (
            <div
              className="text-[9px] font-black text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-1 rounded-md uppercase tracking-wider shadow-2xs"
              title="KSR College of Engineering"
            >
              KSR
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;