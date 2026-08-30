import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCloudUploadAlt, FaCalendarAlt, FaHeading, FaAlignLeft, FaTrash } from "react-icons/fa";

const EventModal = ({ open, onClose, onSave }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearPreview = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center items-center p-4 overflow-y-auto">
        
        {/* Glassmorphic Smooth Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal Window Terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-xl overflow-hidden z-10 flex flex-col"
        >
          {/* Header Bar */}
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Initialize Event Pipeline
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Deploy a new institutional challenge framework
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors active:scale-95"
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* Field: Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Event Title
              </label>
              <div className="relative">
                <FaHeading className="absolute left-4 top-3.5 text-slate-300 text-sm" />
                <input
                  type="text"
                  placeholder="e.g., Global AI Hackathon 2026"
                  className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Field: Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Description & Matrix Rules
              </label>
              <div className="relative">
                <FaAlignLeft className="absolute left-4 top-4 text-slate-300 text-sm" />
                <textarea
                  placeholder="Outline the core objective, tech tracks, submission mandates, and grading parameters..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Field: Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Launch Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-3.5 text-slate-300 text-sm pointer-events-none" />
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-600 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Field: Advanced Custom Media Dropzone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Event Banner Graphic
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImage}
                accept="image/*"
                className="hidden"
              />

              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 flex items-center justify-center shadow-sm transition-all mb-3">
                    <FaCloudUploadAlt size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Click to select digital assets
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, or WEBP up to 5MB &bull; Aspect ratio 16:9 recommended
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group aspect-[16/7]">
                  <img
                    src={preview}
                    alt="Preview graphic"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      onClick={clearPreview}
                      className="bg-white/90 hover:bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                      <FaTrash size={12} />
                      Remove Artwork
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Bar Sticky Base */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 bg-transparent rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-blue-600 rounded-xl shadow-md hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-200 active:scale-95"
            >
              Deploy Configuration
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventModal;