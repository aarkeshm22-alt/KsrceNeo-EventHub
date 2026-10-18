import { motion } from "framer-motion";
import { FaInbox, FaPlus } from "react-icons/fa";

const EmptyState = ({ title, description, actionText, onActionClick }) => {
  return (
    <div className="relative overflow-hidden bg-white border border-dashed border-slate-200 rounded-3xl p-12 lg:p-20 text-center max-w-xl mx-auto my-8">
      
      {/* Decorative Radial Backdrop Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent opacity-70 pointer-events-none" />

      {/* Abstract Animated Core Housing */}
      <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
        {/* Outer Silver & Gold Metallic Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-slate-200 border-t-amber-400"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-dashed border-slate-100 border-b-blue-300"
        />
        
        {/* Central Core Icon Ring */}
        <div className="absolute inset-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner text-slate-400 flex items-center justify-center">
          <FaInbox size={26} className="text-slate-300 transform -rotate-6" />
        </div>
      </div>

      {/* Content Meta Text */}
      <div className="relative z-10 max-w-sm mx-auto space-y-2">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {title || "No data pipelines initialized"}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed font-normal">
          {description || "The requested sector is currently vacant. Initialize a new event structure to populate this dashboard pipeline."}
        </p>
      </div>

      {/* Optional Primary Quick-Action Component */}
      {actionText && onActionClick && (
        <motion.div 
          className="mt-8 relative z-10 inline-block"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={onActionClick}
            className="group inline-flex items-center gap-2 bg-slate-950 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <FaPlus className="text-[10px] transform group-hover:rotate-90 transition-transform duration-200" />
            {actionText}
          </button>
        </motion.div>
      )}

    </div>
  );
};

export default EmptyState;