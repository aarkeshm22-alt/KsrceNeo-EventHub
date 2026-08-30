import { motion } from "framer-motion";

const StatsCard = ({ title, value, icon, trend }) => {
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group relative bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-shadow duration-300 overflow-hidden flex flex-col justify-between"
    >
      {/* Decorative Fluid Ring Backdrop Effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-tr from-blue-50 to-slate-100/40 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </h3>

          {/* Metric Value */}
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 to-blue-950 bg-clip-text">
            {value}
          </h2>
        </div>

        {/* Premium Metallic/Silver Icon Housing */}
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
          <Icon size={20} className="transform group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      {/* Optional contextual micro-details or live growth indices */}
      {trend ? (
        <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-semibold">{trend.value}</span> {trend.label}
          </span>
        </div>
      ) : (
        <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Platform Metrics</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;