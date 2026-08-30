import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaUserGraduate,
  FaEnvelope,
  FaIdBadge,
  FaArrowLeft,
  FaArrowsRotate,
  FaMagnifyingGlass,
  FaTriangleExclamation
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const SpocStudentsDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [spocDept, setSpocDept] = useState(null);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStudents(result.data || []);
        setSpocDept(result.spocDepartment || null);
      } else if (response.status === 403) {
        setError("Access forbidden. You do not have permission to view students.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.message || result.error || "Failed to fetch students.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter students by search query
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const name = student.name?.toLowerCase() || "";
    const email = student.email?.toLowerCase() || "";
    const regNo = (student.regNo || student.studentId || "").toLowerCase();
    return name.includes(query) || email.includes(query) || regNo.includes(query);
  });

  const showDepartmentHint = !loading && !error && students.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8 relative p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/spoc/dashboard')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200/60"
            title="Back to Dashboard"
          >
            <FaArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              SPOC Students Details
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              View students in your department.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center flex-1 sm:flex-initial min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {loading ? "..." : filteredStudents.length}
            </p>
          </div>
          <button
            onClick={fetchStudents}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all shadow-sm"
            title="Refresh Data"
          >
            <FaArrowsRotate className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} size={14} />
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 border border-slate-200/60 p-3 sm:p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name, email, or registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FaArrowsRotate className="animate-spin text-blue-600 text-3xl" />
            <p className="text-sm font-bold text-slate-500">Fetching students...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-bold text-rose-900">Access Error</p>
              <p className="text-xs text-rose-500/80 font-medium max-w-xs mx-auto">
                {error}
              </p>
            </div>
          </div>
        ) : showDepartmentHint ? (
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
            <FaTriangleExclamation className="text-amber-500 text-3xl mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">No students found</p>
              <p className="text-xs text-amber-700/80 font-medium max-w-xs mx-auto">
                The system could not find any students in your department.
                {spocDept && (
                  <span className="block mt-2 font-mono bg-amber-100/50 px-2 py-1 rounded">
                    Your department: <strong>{spocDept}</strong>
                  </span>
                )}
              </p>
              <p className="text-xs text-amber-600/80 font-medium max-w-xs mx-auto">
                Ensure that students have the <strong>exact same</strong> department name (case‑insensitive).
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Desktop/Tablet Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center w-12">S.No</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Register No</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Year</th>
                    <th className="py-4 px-6">Section</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-400">
                        {searchQuery ? "No students match your search criteria." : "No students found in your department."}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const regNo = student.regNo || student.studentId || "N/A";
                      return (
                        <tr
                          key={student._id}
                          className={`hover:bg-slate-50/40 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="py-4 px-6 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-800">
                            {student.name || "Unnamed"}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {regNo}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            <a href={`mailto:${student.email}`} className="hover:text-blue-600 transition-colors">
                              {student.email || "N/A"}
                            </a>
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {student.year || "N/A"}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {student.section || "N/A"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3 p-4">
              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  {searchQuery ? "No students match your search." : "No students found in your department."}
                </div>
              ) : (
                filteredStudents.map((student, idx) => {
                  const regNo = student.regNo || student.studentId || "N/A";
                  return (
                    <div
                      key={student._id}
                      className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-slate-200 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                      <div className="flex items-start justify-between ml-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-full">
                              #{idx + 1}
                            </span>
                            <p className="font-bold text-slate-800 text-lg">
                              {student.name || "Unnamed"}
                            </p>
                          </div>
                          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <FaIdBadge className="text-blue-500 text-xs w-4" />
                              <span className="text-slate-500">Reg No:</span>
                              <span className="text-slate-700 font-medium">{regNo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-blue-500 text-xs w-4" />
                              <a
                                href={`mailto:${student.email}`}
                                className="hover:text-blue-600 transition-colors text-slate-600 truncate"
                              >
                                {student.email || "N/A"}
                              </a>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                              <span>Year: {student.year || "N/A"}</span>
                              <span>Section: {student.section || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SpocStudentsDetails;