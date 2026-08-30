import { motion } from "framer-motion";
import { FaGraduationCap, FaCalendarAlt, FaUserTie, FaCheckCircle, FaClock, FaSlidersH } from "react-icons/fa";

const Registrations = () => {
  const registrations = [
    {
      id: 1,
      student: "Arun Kumar",
      event: "Smart India Hackathon",
      mentor: "Dr. Kumar",
      status: "Approved",
      badgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: FaCheckCircle,
    },
    {
      id: 2,
      student: "Priya",
      event: "AI Innovation Challenge",
      mentor: "Dr. Priya",
      status: "Pending",
      badgeStyle: "text-amber-700 bg-amber-50 border-amber-200",
      icon: FaClock,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* SECTION 1: INTERFACE SYSTEM HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Pipeline Registries
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Registrations
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Audit team applications, verify advisor alignments, and adjust approval states.
          </p>
        </div>

        {/* System Filters Utility Shortcut */}
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95">
          <FaSlidersH className="text-slate-400" size={13} />
          <span>Filter Registry</span>
        </button>
      </div>

      {/* SECTION 2: DESKTOP MATRIX WORKSPACE (Hidden on Mobile screens) */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="py-4 px-6">Student Node</th>
              <th className="py-4 px-6">Target Track</th>
              <th className="py-4 px-6">Assigned Evaluator</th>
              <th className="py-4 px-6 text-right">Validation Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {registrations.map((item) => {
              const StatusIcon = item.icon;
              return (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center border border-slate-200/50 transition-colors">
                        <FaGraduationCap size={14} />
                      </div>
                      <span className="font-bold text-slate-900">{item.student}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-500 font-semibold">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-slate-300" size={12} />
                      <span>{item.event}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-500">
                    <div className="flex items-center gap-2">
                      <FaUserTie className="text-slate-300" size={12} />
                      <span>{item.mentor}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-md ${item.badgeStyle}`}>
                      <StatusIcon size={10} className="opacity-90" />
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SECTION 3: MOBILE BENTO CARD RESPONSIVE STACK (Hidden on Desktop screens) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {registrations.map((item) => {
          const StatusIcon = item.icon;
          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.99 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              {/* Card Header: Identity & Status Indicator */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                    <FaGraduationCap size={14} />
                  </div>
                  <span className="font-black text-slate-900 text-sm">{item.student}</span>
                </div>

                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md ${item.badgeStyle}`}>
                  <StatusIcon size={9} />
                  {item.status}
                </span>
              </div>

              {/* Card Meta Content Block */}
              <div className="space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2.5">
                  <FaCalendarAlt className="text-slate-300 w-4 text-center" />
                  <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px] w-12">Event:</span>
                  <span className="text-slate-800 font-bold">{item.event}</span>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <FaUserTie className="text-slate-300 w-4 text-center" />
                  <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px] w-12">Mentor:</span>
                  <span className="text-slate-700">{item.mentor}</span>
                </div>
              </div>

              {/* Mobile Quick Utility Actions row wrapper */}
              <div className="pt-2 border-t border-slate-50 flex gap-2">
                <button className="flex-1 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors">
                  Inspect File
                </button>
                {item.status === "Pending" && (
                  <button className="flex-1 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-blue-600 rounded-xl transition-colors shadow-sm">
                    Approve Card
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};

export default Registrations;