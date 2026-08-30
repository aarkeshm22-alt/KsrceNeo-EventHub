import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaUserCircle, 
  FaIdCard, 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap, 
  FaTrophy, 
  FaCheckCircle, 
  FaEdit 
} from "react-icons/fa";

const Profile = () => {
  // Mock data setup mirroring our registration schema
  const [studentData] = useState({
    name: "Alex Kumar",
    regNo: "711421104001",
    department: "Computer Science & Engineering",
    year: "3rd Year (III)",
    section: "A",
    email: "alexkumar@ksrce.ac.in",
    mobile: "+91 9876543210",
    hackathonsJoined: 4,
    attendanceRate: "94%",
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Identity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="relative text-blue-600 bg-blue-50 p-1.5 rounded-full border border-blue-100">
            <FaUserCircle size={80} />
          </div>
          
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-2xl font-bold text-slate-900">{studentData.name}</h2>
              <span className="inline-flex self-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active Student
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{studentData.department}</p>
            <p className="text-xs text-slate-400">Reg No: {studentData.regNo}</p>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm">
            <FaEdit size={12} />
            <span>Edit Avatar</span>
          </button>
        </motion.div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center"
          >
            <FaTrophy className="mx-auto text-amber-500 mb-2" size={20} />
            <div className="text-2xl font-bold text-slate-800">{studentData.hackathonsJoined}</div>
            <div className="text-xs text-slate-500 font-medium">Hackathons Entered</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center"
          >
            <FaCheckCircle className="mx-auto text-blue-500 mb-2" size={20} />
            <div className="text-2xl font-bold text-slate-800">{studentData.attendanceRate}</div>
            <div className="text-xs text-slate-500 font-medium">Overall Attendance</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center col-span-2 sm:col-span-1"
          >
            <FaGraduationCap className="mx-auto text-indigo-500 mb-2" size={20} />
            <div className="text-2xl font-bold text-slate-800">{studentData.year}</div>
            <div className="text-xs text-slate-500 font-medium">Section {studentData.section}</div>
          </motion.div>
        </div>

        {/* Comprehensive Details Block */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="border-b border-slate-100 p-5 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Academic & Contact Summary</h3>
          </div>
          
          <div className="divide-y divide-slate-100 px-6 text-sm">
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold text-slate-500 flex items-center gap-2"><FaIdCard size={14} /> Register Number</span>
              <span className="text-slate-800 font-mono">{studentData.regNo}</span>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold text-slate-500 flex items-center gap-2"><FaBuilding size={14} /> Department / Branch</span>
              <span className="text-slate-800">{studentData.department}</span>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold text-slate-500 flex items-center gap-2"><FaGraduationCap size={14} /> Year / Batch Section</span>
              <span className="text-slate-800">{studentData.year} — Sec {studentData.section}</span>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold text-slate-500 flex items-center gap-2"><FaEnvelope size={14} /> College Mail ID</span>
              <span className="text-slate-800 hover:underline cursor-pointer">{studentData.email}</span>
            </div>
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold text-slate-500 flex items-center gap-2"><FaPhone size={14} /> Mobile Contact</span>
              <span className="text-slate-800">{studentData.mobile}</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;