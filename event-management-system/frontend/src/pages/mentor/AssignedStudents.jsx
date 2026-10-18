import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IdCard, 
  FolderOpen, 
  CalendarCheck, 
  Search, 
  GraduationCap,
  X,
  Mail,
  Phone,
  Clock,
  User,
  Loader2,
  AlertCircle,
  Sliders
} from "lucide-react";

const AssignedStudents = () => {
  // Application Data States
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ========================================================
  // 🏢 DYNAMIC DEPARTMENT RESOLUTION ENGINE
  // ========================================================
  const getMentorDepartment = () => {
    // 1. Check common raw string keys
    const rawDept = 
      localStorage.getItem("department") || 
      localStorage.getItem("userDepartment") || 
      localStorage.getItem("dept");
    
    if (rawDept) return rawDept.toUpperCase();

    // 2. Check if it's nested inside an object string (e.g., localStorage.getItem("user"))
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const nestedDept = parsedUser.department || parsedUser.dept;
        if (nestedDept) return nestedDept.toUpperCase();
      }
    } catch (e) {
      console.error("Failed to parse nested user object from localStorage", e);
    }

    // 3. Ultimate safe fallback
    return "CSE";
  };

  const mentorDepartment = getMentorDepartment();

  // Fetch student lists from the server on page load
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Could not fetch student data from the server.");
        }
        
        const data = await response.json();
        setStudents(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter logic: Only show students who match the mentor's department and search text
  const filteredStudents = students.filter((student) => {
    const isStudent = student.role === "student";
    
    // Safety Check: Student department must match mentor department
    const matchesDepartment = student.department?.toUpperCase() === mentorDepartment.toUpperCase();
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      student.name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.regNo?.toLowerCase().includes(query);

    return isStudent && matchesDepartment && matchesSearch;
  });

  // Simple helper to get name initials for profile icons
  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header Section */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-900 text-white rounded">
              Verified Mentor View
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Department: {mentorDepartment}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Assigned Students
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            View student profiles, contact information, and academic details for your department.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-center shrink-0 w-full sm:w-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">
            {isLoading ? "..." : filteredStudents.length}
          </p>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="flex gap-3 items-center bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search students by name, registration number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 text-xs font-medium focus:border-slate-400 focus:outline-hidden transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 shrink-0">
          <Sliders size={12} />
          <span className="hidden sm:inline">Viewing:</span>
          <span className="text-slate-800 bg-white px-1.5 py-0.5 border border-slate-200 rounded">{mentorDepartment}</span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Student Information</th>
                <th className="py-3 px-5">Registration No</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Academic Year</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={18} className="animate-spin text-slate-600" />
                        <span className="font-medium text-xs">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-rose-700 bg-rose-50/30">
                      <div className="flex items-center justify-center gap-2 max-w-md mx-auto text-xs font-medium">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Error: {error}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <motion.tr
                      key={student._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Avatar and Name */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px] shrink-0">
                            {getInitials(student.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{student.name}</p>
                            <p className="text-[11px] text-slate-400 font-normal truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Reg Number */}
                      <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-700 uppercase">
                        <div className="flex items-center gap-1.5">
                          <IdCard size={12} className="text-slate-300" />
                          <span>{student.regNo || "Not assigned"}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          {student.department || "N/A"}
                        </span>
                      </td>

                      {/* Year & Section */}
                      <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <CalendarCheck size={12} className="text-slate-300" />
                          <span>Year {student.year || "—"} {student.section ? `• Sec ${student.section}` : ""}</span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase border border-slate-200 bg-white hover:border-slate-400 text-slate-700 px-2.5 py-1 rounded transition-colors"
                        >
                          <FolderOpen size={11} className="text-slate-400" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr layout>
                    <td colSpan="5" className="py-24 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-xs mx-auto">
                        <GraduationCap size={24} className="text-slate-300" />
                        <h4 className="text-xs font-bold text-slate-700">No Students Found</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          There are no registered students listed under the department "{mentorDepartment}".
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail Pop-up Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark Background Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Profile Card Container */}
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden relative z-10 flex flex-col text-xs"
            >
              {/* Modal Header */}
              <div className="bg-[#f8fafc] border-b border-slate-200 p-5 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(selectedStudent.name)}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{selectedStudent.name}</h3>
                    <span className="inline-block text-[9px] font-medium bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                      ID: {selectedStudent._id?.slice(-8)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Modal Body Info */}
              <div className="p-5 space-y-4">
                
                {/* Academic Fields */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <GraduationCap size={12} /> <span>Academic Details</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 bg-[#f8fafc] border border-slate-200/60 p-3 rounded-lg font-medium text-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Registration ID</p>
                      <p className="text-slate-900 font-bold mt-0.5">{selectedStudent.regNo || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Department</p>
                      <p className="text-slate-900 font-bold mt-0.5">{selectedStudent.department || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Academic Year</p>
                      <p className="text-slate-800 mt-0.5">Year {selectedStudent.year || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Section</p>
                      <p className="text-slate-800 mt-0.5">Section {selectedStudent.section || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User size={12} /> <span>Contact Information</span>
                  </h4>
                  <div className="space-y-1.5 font-medium">
                    <div className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg">
                      <Mail className="text-slate-300 shrink-0" size={13} />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase font-bold leading-none">Email Address</p>
                        <p className="text-slate-800 truncate mt-1">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg">
                      <Phone className="text-slate-300 shrink-0" size={13} />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold leading-none">Mobile Number</p>
                        <p className="text-slate-800 mt-1">{selectedStudent.mobile || "Not linked"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Meta Dates */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} />
                    <span>Joined: {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "System Record"}</span>
                  </div>
                  <span className="bg-slate-50 border border-slate-200 px-1 py-0.5 rounded text-[9px]">Account: Student</span>
                </div>

              </div>

              {/* Close Button */}
              <div className="bg-[#f8fafc] border-t border-slate-200 p-3 flex justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase rounded text-[10px] transition-colors"
                >
                  Close Profile
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AssignedStudents;