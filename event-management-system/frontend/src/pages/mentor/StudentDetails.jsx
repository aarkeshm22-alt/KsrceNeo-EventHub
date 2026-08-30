import { motion } from "framer-motion";
import { 
  FaUserGraduation, 
  FaBuilding, 
  FaCalendarAlt, 
  FaLightbulb, 
  FaUsers, 
  FaEnvelope, 
  FaArrowLeft,
  FaCheck,
  FaTimes
} from "react-icons/fa";

const StudentDetails = () => {
  // Mock data representing the selected student info bundle
  const student = {
    name: "Arun Kumar",
    department: "CSE",
    year: "III Year",
    event: "Smart India Hackathon",
    teamName: "Tech Titans",
    email: "arunkumar@ksrce.ac.in",
    regNo: "711421104012",
    status: "Pending Approval"
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Action Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors shadow-sm">
              <FaArrowLeft size={12} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Inspection</h1>
              <p className="text-xs text-slate-500 mt-0.5">Reviewing core credentials and project validation requests</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
            student.status === "Approved" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : "bg-amber-50 text-amber-700 border-amber-100"
          }`}>
            {student.status}
          </span>
        </div>

        {/* Main Identity Profile Grid Info block */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Header Identity Row Banner */}
          <div className="p-6 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 shrink-0">
              <FaUserGraduation size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
              <p className="text-xs font-mono text-slate-400">REGISTRATION NUMBER: {student.regNo}</p>
            </div>
          </div>

          {/* Formatted Parameter Table Cells */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            
            {/* Academic Track Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Metadata</h3>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <FaBuilding className="text-slate-400 shrink-0" size={14} />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Department</p>
                  <p className="font-semibold text-slate-700">{student.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <FaCalendarAlt className="text-slate-400 shrink-0" size={14} />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Current Year</p>
                  <p className="font-semibold text-slate-700">{student.year}</p>
                </div>
              </div>
            </div>

            {/* Project Submission Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hackathon Submission</h3>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <FaLightbulb className="text-amber-500 shrink-0" size={14} />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Target Event</p>
                  <p className="font-semibold text-slate-700">{student.event}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <FaUsers className="text-blue-500 shrink-0" size={14} />
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Registered Team</p>
                  <p className="font-semibold text-slate-700">{student.teamName}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Actions Bottom Bar Control Panel */}
          <div className="bg-slate-50/50 border-t border-slate-100 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Quick Mail Anchor Trigger Link */}
            <a 
              href={`mailto:${student.email}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <FaEnvelope size={12} />
              <span>{student.email}</span>
            </a>

            {/* Operational Workflow Control Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                <FaTimes size={10} />
                <span>Reject</span>
              </button>
              
              <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
                <FaCheck size={10} />
                <span>Approve Team</span>
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default StudentDetails;