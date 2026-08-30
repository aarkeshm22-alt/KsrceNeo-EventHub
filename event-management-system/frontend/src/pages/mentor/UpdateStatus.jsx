import { useState } from "react";
import { motion } from "framer-motion";
import { FaCloudUploadAlt, FaHistory, FaCommentAlt, FaTasks } from "react-icons/fa";

const UpdateStatus = () => {
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    // Simple validation block before processing submission state logs
    if (!status) {
      setFormError("Please select a valid stage checkpoint milestone status.");
      return;
    }

    if (!remarks.trim()) {
      setFormError("Please provide brief remarks or evaluation summary details.");
      return;
    }

    console.log({ status, remarks });
    alert("Project Evaluation Status Updated Successfully!");
    
    // Clear inputs after successful mock action log complete
    setStatus("");
    setRemarks("");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Dynamic Descriptive Section Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Update Hackathon Status
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log active milestone progress markers, evaluation notes, and milestone tracking updates
          </p>
        </div>

        {/* Core Settings Form Component */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Display validation warning alert pill banner when triggered */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
                {formError}
              </div>
            )}

            {/* Selection Checkpoint Status Label Fields */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <FaTasks size={12} className="text-slate-400" />
                <span>Current Stage Milestone</span>
              </label>
              
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setFormError("");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-800 outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="">Select current project track milestone status</option>
                  <option value="Registered">Registered & Active</option>
                  <option value="Under Review">Under Review // Mentorship Evaluation</option>
                  <option value="Shortlisted">Shortlisted for Internal Selection</option>
                  <option value="Final Round">Grand Finale Round Nominated</option>
                  <option value="Winner">Winner Podium Finish</option>
                </select>
                {/* Custom layout caret arrow dropdown design modifier indicator */}
                <div className="absolute right-4 top-4 pointer-events-none text-xs text-slate-400">▼</div>
              </div>
            </div>

            {/* Descriptive Summary Section Remarks Fields */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <FaCommentAlt size={11} className="text-slate-400" />
                <span>Review Assessment Remarks</span>
              </label>
              
              <textarea
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  setFormError("");
                }}
                placeholder="Provide internal review logs, project correction metrics, or upcoming interview instructions for the team..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 leading-relaxed resize-none"
                rows="5"
              />
            </div>

            {/* Submission Interactive Button row layout triggers */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-400 font-medium max-w-xs leading-normal">
                Submitting this logs updates immediately on the team panel portal view history summary stream block.
              </p>
              
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                <FaCloudUploadAlt size={14} />
                <span>Publish Milestone Update</span>
              </button>
            </div>

          </form>
        </motion.div>

        {/* Informative Audit Log Card Footer */}
        <div className="bg-slate-100/60 rounded-xl border border-slate-200 p-4 flex items-start gap-3 text-slate-500">
          <FaHistory size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <div className="text-xs space-y-1 leading-normal">
            <span className="font-semibold text-slate-700 block">Audit Log Compliance Notice</span>
            <p>Every status transition generates a historical timeline footprint. Double-check selected milestones before pushing live validation logs.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpdateStatus;