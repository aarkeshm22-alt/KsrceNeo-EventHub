import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaIdCard, 
  FaFolderOpen, 
  FaCalendarCheck, 
  FaSearch, 
  FaFilter, 
  FaGraduationCap,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaUser,
  FaFilePdf,
  FaFileExcel,
  FaEye,
  FaSync,
  FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");

  const [message, setMessage] = useState({ text: '', variant: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', variant: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchStudents = async () => {
    const startTime = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/users");
      if (!response.ok) {
        throw new Error("Failed to communicate with runtime database services.");
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const studentList = students.filter(s => s.role === "student");
  const uniqueYears = ["All", ...new Set(studentList.map(s => s.year).filter(Boolean))];
  const uniqueSections = ["All", ...new Set(studentList.map(s => s.section).filter(Boolean))];

  const filteredStudents = students.filter((student) => {
    const isStudent = student.role === "student";
    const matchesDept = selectedDept === "All" || student.department?.toUpperCase() === selectedDept.toUpperCase();
    const matchesYear = selectedYear === "All" || student.year === selectedYear;
    const matchesSection = selectedSection === "All" || student.section === selectedSection;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      student.name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.regNo?.toLowerCase().includes(query);
    return isStudent && matchesDept && matchesYear && matchesSection && matchesSearch;
  });

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getBadgeColor = (dept) => {
    switch (dept?.toUpperCase()) {
      case "CSE": return "text-blue-700 bg-blue-50 border-blue-200";
      case "IT": return "text-amber-700 bg-amber-50 border-amber-200";
      case "ECE": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  // ---------- EXPORT ----------
  const exportPDF = () => {
    if (filteredStudents.length === 0) {
      setMessage({ text: 'No student records to export.', variant: 'error' });
      return;
    }
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const tableData = filteredStudents.map((s) => [
      s.name || '—',
      s.regNo || '—',
      s.department || '—',
      s.year || '—',
      s.section || '—',
      s.email || '—',
      s.mobile || '—'
    ]);
    autoTable(doc, {
      head: [['Name', 'Reg No', 'Department', 'Year', 'Section', 'Email', 'Mobile']],
      body: tableData,
      startY: 20,
      theme: 'striped',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 95], textColor: 255 },
    });
    doc.save('Student_List.pdf');
  };

  const exportExcel = () => {
    if (filteredStudents.length === 0) {
      setMessage({ text: 'No student records to export.', variant: 'error' });
      return;
    }
    const excelData = filteredStudents.map((s) => ({
      Name: s.name || '—',
      'Registration No': s.regNo || '—',
      Department: s.department || '—',
      Year: s.year || '—',
      Section: s.section || '—',
      Email: s.email || '—',
      Mobile: s.mobile || '—'
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'Student_List.xlsx');
  };

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      
      {/* HEADER with Back & Refresh buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200/60"
            title="Back to Dashboard"
          >
            <FaArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Student Management
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Here, you can view, filter, and manage student records. Use the search and filter options to narrow down the list, and click on a student to view detailed information.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center flex-1 sm:flex-initial min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered / Total</p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {isLoading ? "..." : filteredStudents.length}{' '}
              <span className="text-slate-300 text-xs font-normal">
                / {isLoading ? "..." : students.filter(s => s.role === "student").length}
              </span>
            </p>
          </div>
          <button
            onClick={fetchStudents}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all shadow-sm"
            title="Refresh Data"
          >
            <FaSync className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} size={14} />
          </button>
        </div>
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm border ${
              message.variant === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-green-50 text-green-800 border-green-200'
            }`}
          >
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* SEARCH & FILTER BAR – fully responsive */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-50 border border-slate-200/60 p-3 sm:p-4 rounded-2xl">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search students by name, email, or reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>

        {/* Filters Container */}
        <div className="flex flex-col sm:flex-row lg:flex-wrap items-center gap-2 w-full lg:w-auto">
          
          {/* ROW 1 (Mobile) / INLINE (Desktop): Department */}
          <div className="relative w-full sm:w-auto lg:flex-1 min-w-[120px]">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl pl-8 pr-7 py-2.5 text-sm font-bold outline-hidden focus:border-blue-500 transition-all shadow-xs cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '14px',
              }}
            >
              <option value="All">All Departments</option>
              <option value="BME">BME</option>
              <option value="AUTO">AUTO</option>
              <option value="CIVIL">CIVIL</option>
              <option value="CSE">CSE</option>
              <option value="CSD">CSD</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="SFE">SFE</option>
              <option value="CS">CS</option>
              <option value="IT">IT</option>
              <option value="IoT">IoT</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
            </select>
          </div>

          {/* ROW 2 (Mobile) / INLINE (Desktop): Year, Section, Export */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[80px] sm:flex-initial">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-hidden focus:border-blue-500 transition-all shadow-xs cursor-pointer appearance-none"
              >
                <option value="All">All Years</option>
                {uniqueYears.filter(y => y !== 'All').map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[80px] sm:flex-initial">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-hidden focus:border-blue-500 transition-all shadow-xs cursor-pointer appearance-none"
              >
                <option value="All">All Sections</option>
                {uniqueSections.filter(s => s !== 'All').map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1">
              <button
                onClick={exportPDF}
                className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl shadow-sm transition-all border border-red-600"
                title="Export PDF"
              >
                <FaFilePdf size={14} />
              </button>
              <button
                onClick={exportExcel}
                className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-xl shadow-sm transition-all border border-green-700"
                title="Export Excel"
              >
                <FaFileExcel size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE – horizontal scroll on small screens */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 md:px-6">Student Profile</th>
                <th className="py-4 px-4 md:px-6">Reg No</th>
                <th className="py-4 px-4 md:px-6 hidden sm:table-cell">Email</th>
                <th className="py-4 px-4 md:px-6">Department</th>
                <th className="py-4 px-4 md:px-6">Year & Section</th>
                <th className="py-4 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  // 🚀 Loader row – shows for at least 2 seconds
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaSync className="animate-spin text-blue-600 text-3xl" />
                        <p className="text-sm font-bold text-slate-500">Fetching student details...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-red-500 font-bold text-xs bg-red-50/30">
                      ⚠️ Runtime Error: {error}
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <motion.tr
                      key={student._id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-slate-50/50 group transition-colors"
                    >
                      <td className="py-4 px-4 md:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-xs shadow-xs shrink-0">
                            {getInitials(student.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400 font-normal truncate sm:hidden">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <FaIdCard className="text-slate-300" size={12} />
                          <span className="font-mono font-bold text-slate-800 uppercase">
                            {student.regNo || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-xs text-slate-600 hidden sm:table-cell">
                        {student.email}
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${getBadgeColor(student.department)}`}>
                          {student.department || "Unknown"}
                        </span>
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                          <FaCalendarCheck size={11} className="text-slate-400" />
                          {student.year || "—"} {student.section ? `(Sec ${student.section})` : ""}
                        </span>
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200/60 hover:border-blue-200 px-2.5 py-1.5 rounded-lg transition-all shadow-xs"
                        >
                          <FaEye size={11} />
                          <span>View</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr layout>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaGraduationCap size={28} className="text-slate-200" />
                        <p className="text-xs font-bold text-slate-400">No student records match your filters.</p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL – responsive */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 border border-blue-700 text-white flex items-center justify-center text-lg sm:text-xl font-black shadow-md shadow-blue-100">
                    {getInitials(selectedStudent.name)}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                      {selectedStudent.name}
                    </h3>
                    <span className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      Role: {selectedStudent.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-5 text-sm overflow-y-auto">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <FaGraduationCap /> Profile Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/40 font-semibold">
                    <div>
                      <p className="text-[11px] text-slate-400">Registration Number</p>
                      <p className="text-slate-800 font-mono font-bold uppercase mt-0.5">
                        {selectedStudent.regNo || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Department</p>
                      <p className="text-slate-800 font-black mt-0.5">{selectedStudent.department || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Academic Year</p>
                      <p className="text-slate-800 mt-0.5">{selectedStudent.year || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Section</p>
                      <p className="text-slate-800 mt-0.5">Section {selectedStudent.section || "—"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <FaUser /> Communication Details
                  </h4>
                  <div className="space-y-2.5 font-semibold">
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <FaEnvelope className="text-slate-400 shrink-0" size={14} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Email</p>
                        <p className="text-slate-800 truncate mt-1 font-medium">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <FaPhone className="text-slate-400 shrink-0" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Mobile</p>
                        <p className="text-slate-800 font-mono mt-1">{selectedStudent.mobile || "Not Linked"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <FaClock size={12} />
                    <span>Profile Enrolled: {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "Historical Log"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentManagement;