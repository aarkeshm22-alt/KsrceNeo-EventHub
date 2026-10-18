import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaArrowLeft } from "react-icons/fa";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        
        {/* Animated Security Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          className="inline-flex p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 mb-6 shadow-sm"
        >
          <FaLock size={36} />
        </motion.div>

        {/* Access Warning Header */}
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-2xl font-bold text-slate-900 tracking-tight"
        >
          Access Denied
        </motion.h1>

        {/* Helpful Explanation Context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed"
        >
          You do not have permission to view this page. Please log in with a different account or head back to safety.
        </motion.p>

        {/* Practical Escape Action Link */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-8"
        >
          <button
            onClick={() => navigate(-1)} // Takes them back to their previous page safely
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <FaArrowLeft size={12} />
            <span>Go Back</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Unauthorized;