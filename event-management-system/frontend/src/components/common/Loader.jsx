import { motion } from "framer-motion";

const Loader = ({ message = "Compiling matrix parameters..." }) => {
  return (
    <div className="flex flex-col justify-center items-center h-[500px] w-full bg-white relative overflow-hidden">
      
      {/* Decorative center radial glow */}
      <div className="absolute w-72 h-72 bg-blue-50/30 rounded-full blur-3xl pointer-events-none" />

      {/* Kinetic Ring Ring Architecture */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        
        {/* Outer Silver Loop with Gold Accents */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-amber-400 border-r-amber-500/80 shadow-sm"
        />

        {/* Counter-Rotating Deep Blue Core Loop */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-[3px] border-transparent border-t-blue-600 border-b-blue-700"
        />

        {/* Static Inner Central Metal Pivot */}
        <div className="absolute inset-6 rounded-full bg-slate-50 border border-slate-200/60 shadow-inner flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
        </div>

      </div>

      {/* Synchronized Terminal Status Typography */}
      <div className="mt-8 text-center space-y-1.5 relative z-10">
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 bg-clip-text text-transparent"
        >
          {message}
        </motion.p>
        <p className="text-[10px] font-mono text-slate-400 tracking-wide">
          Please hold &bull; Synchronizing secure channels
        </p>
      </div>

    </div>
  );
};

export default Loader;