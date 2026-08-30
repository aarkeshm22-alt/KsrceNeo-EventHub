import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        
        {/* Playful animated icon container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          className="inline-flex p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 mb-6 shadow-sm"
        >
          <FaExclamationTriangle size={40} />
        </motion.div>

        {/* Huge Hero 404 text */}
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-8xl font-black text-slate-900 tracking-tight select-none"
        >
          404
        </motion.h1>

        {/* Clear messaging */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-4 space-y-2"
        >
          <h3 className="text-xl font-bold text-slate-800">
            Lost in Space?
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
          </p>
        </motion.div>

        {/* Navigation fallback CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            <FaHome size={14} />
            <span>Back to Home Page</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFound;