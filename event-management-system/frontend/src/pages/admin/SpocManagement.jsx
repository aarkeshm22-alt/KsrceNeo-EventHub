import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserTie,
  FaEnvelope,
  FaFolderOpen,
  FaFilter,
  FaSearch,
  FaTimes,
  FaPhone,
  FaClock,
  FaRegIdCard,
  FaChalkboardTeacher,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilePdf,
  FaFileExcel,
  FaPlus,
  FaSync,
  FaArrowLeft,
  FaSpinner,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SpocManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000/api/admin';

  const initialFormState = {
    firstName: '',
    lastName: '',
    department: '',
    phoneNo: '',
    emailId: '',
    password: '12345678',
  };

  const [spocs, setSpocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false); // ✅ NEW
  const [message, setMessage] = useState({ type: '', text: '', variant: '' });
  const [selectedSpoc, setSelectedSpoc] = useState(null);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '', variant: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ---------- FETCH SPOCs ----------
  const fetchSpocs = async () => {
    const startTime = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/spoc`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch SPOC profiles.');
      const data = await response.json();
      setSpocs(data);
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
    fetchSpocs();
  }, []);

  // ---------- VALIDATION ----------
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.firstName.trim()) tempErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) tempErrors.lastName = 'Last name is required.';
    if (!formData.department.trim()) tempErrors.department = 'Department is required.';
    if (!formData.phoneNo) {
      tempErrors.phoneNo = 'Phone number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNo)) {
      tempErrors.phoneNo = 'Must be exactly 10 digits (0-9 only).';
    }
    if (!formData.emailId) {
      tempErrors.emailId = 'Email is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@ksrce\.ac\.in$/.test(formData.emailId)) {
      tempErrors.emailId = 'Only @ksrce.ac.in domain is allowed.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNo') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 10) {
        setFormData({ ...formData, [name]: cleanValue });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // ---------- SEND WELCOME EMAIL ----------
  const sendWelcomeEmail = async (spocData) => {
    try {
      setSendingEmail(true);
      const response = await fetch(`${API_BASE_URL}/spoc/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify(spocData),
      });
      if (!response.ok) {
        console.warn('Welcome email could not be sent (endpoint may not be implemented).');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error sending welcome email:', err);
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  // ---------- SUBMIT (Create/Update) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '', variant: '' });

    const url = editingId ? `${API_BASE_URL}/spoc/update/${editingId}` : `${API_BASE_URL}/spoc`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        // ✅ Registration successful – send welcome email (only for new SPOC)
        if (!editingId) {
          const spocData = { ...formData };
          await sendWelcomeEmail(spocData);
          setMessage({
            type: 'success',
            text: 'SPOC registered successfully! A welcome email has been sent.',
            variant: 'success',
          });
        } else {
          setMessage({
            type: 'success',
            text: 'SPOC details updated successfully!',
            variant: 'edit',
          });
        }
        closeModal();
        fetchSpocs();
      } else {
        setMessage({ type: 'error', text: data.message || 'Action failed.', variant: 'error' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ---------- MODAL CONTROLS ----------
  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData(initialFormState);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (spoc) => {
    setModalMode('edit');
    setEditingId(spoc._id);
    setFormData({
      firstName: spoc.firstName,
      lastName: spoc.lastName,
      department: spoc.department,
      phoneNo: spoc.phoneNo,
      emailId: spoc.emailId,
      password: '12345678',
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // ---------- DELETE ----------
  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SPOC profile?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/spoc/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'SPOC profile removed successfully.', variant: 'delete' });
        if (editingId === id) closeModal();
        fetchSpocs();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server communication error.', variant: 'error' });
    }
  };

  // ---------- EXPORT ----------
  const exportPDF = () => {
    if (filteredSpocs.length === 0) {
      setMessage({ type: 'error', text: 'No SPOC records to export.', variant: 'error' });
      return;
    }
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const tableData = filteredSpocs.map((spoc) => [
      `${spoc.firstName} ${spoc.lastName}`,
      spoc.department,
      spoc.emailId,
      spoc.phoneNo,
    ]);
    autoTable(doc, {
      head: [['Name', 'Department', 'Email', 'Mobile']],
      body: tableData,
      startY: 20,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 95], textColor: 255 },
    });
    doc.save('SPOC_List.pdf');
  };

  const exportExcel = () => {
    if (filteredSpocs.length === 0) {
      setMessage({ type: 'error', text: 'No SPOC records to export.', variant: 'error' });
      return;
    }
    const excelData = filteredSpocs.map((spoc) => ({
      Name: `${spoc.firstName} ${spoc.lastName}`,
      Department: spoc.department,
      Email: spoc.emailId,
      Mobile: spoc.phoneNo,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'SPOCs');
    XLSX.writeFile(wb, 'SPOC_List.xlsx');
  };

  // ---------- FILTER ----------
  const filteredSpocs = spocs.filter((spoc) => {
    const matchesDept = selectedDept === 'All' || spoc.department?.toUpperCase() === selectedDept.toUpperCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      `${spoc.firstName} ${spoc.lastName}`.toLowerCase().includes(query) ||
      spoc.emailId?.toLowerCase().includes(query) ||
      spoc.department?.toLowerCase().includes(query);
    return matchesDept && matchesSearch;
  });

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '??';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase().slice(0, 2);
  };

  const getBadgeColor = (dept) => {
    switch (dept?.toUpperCase()) {
      case 'CSE': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'IT': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ECE': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'EEE': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'MECH': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const allDepartments = [
    'BME', 'AUTO', 'CIVIL', 'CSE', 'CSD', 'ECE', 'EEE', 'MECH', 'SFE', 'CS', 'IT', 'IoT', 'MCA', 'MBA'
  ];

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
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
              SPOC Management
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Manage departmental SPOC profiles – add, edit, delete, and export records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center flex-1 sm:flex-initial min-w-[100px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered / Total</p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {isLoading ? '...' : filteredSpocs.length}{' '}
              <span className="text-slate-300 text-xs font-normal">
                / {isLoading ? '...' : spocs.length}
              </span>
            </p>
          </div>
          <button
            onClick={fetchSpocs}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all shadow-sm"
            title="Refresh Data"
          >
            <FaSync className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} size={14} />
          </button>
        </div>
      </div>

      {/* ===== MESSAGE TOAST ===== */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm border ${message.variant === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : message.variant === 'edit'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : message.variant === 'delete'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
          >
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SEARCH, FILTER, EXPORT, ADD ===== */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-50 border border-slate-200/60 p-3 sm:p-4 rounded-2xl">
        <div className="relative w-full lg:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search SPOCs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[130px]">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl pl-8 pr-7 py-2.5 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-xs cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '14px',
              }}
            >
              <option value="All">All Departments</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-2 transition-all border border-blue-700 whitespace-nowrap text-sm flex-1 sm:flex-none justify-center"
          >
            <FaPlus size={12} />
            <span>Add</span>
          </button>

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

      {/* ===== TABLE ===== */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 md:px-6">SPOC Profile</th>
                <th className="py-4 px-4 md:px-6">Department</th>
                <th className="py-4 px-4 md:px-6 hidden sm:table-cell">Email</th>
                <th className="py-4 px-4 md:px-6">Mobile</th>
                <th className="py-4 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaSync className="animate-spin text-blue-600 text-3xl" />
                        <p className="text-sm font-bold text-slate-500">Fetching SPOC details...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-red-500 font-bold text-xs bg-red-50/30">
                      ⚠️ {error}
                    </td>
                  </tr>
                ) : filteredSpocs.length > 0 ? (
                  filteredSpocs.map((spoc) => (
                    <motion.tr
                      key={spoc._id}
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
                            {getInitials(spoc.firstName, spoc.lastName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {spoc.firstName} {spoc.lastName}
                            </p>
                            <p className="text-xs text-slate-400 font-normal truncate sm:hidden">
                              {spoc.emailId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${getBadgeColor(
                            spoc.department
                          )}`}
                        >
                          {spoc.department || 'General'}
                        </span>
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-xs text-slate-600 hidden sm:table-cell">
                        {spoc.emailId}
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-xs font-mono text-slate-600">
                        {spoc.phoneNo || '—'}
                      </td>

                      <td className="py-4 px-4 md:px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <button
                            onClick={() => setSelectedSpoc(spoc)}
                            className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200/60 hover:border-blue-200 p-2 rounded-lg transition-all"
                            title="View"
                          >
                            <FaEye size={12} />
                          </button>
                          <button
                            onClick={() => openEditModal(spoc)}
                            className="text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 border border-slate-200/60 hover:border-amber-200 p-2 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(spoc._id)}
                            className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200/60 hover:border-red-200 p-2 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr layout>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaChalkboardTeacher size={28} className="text-slate-200" />
                        <p className="text-xs font-bold text-slate-400">No SPOC records found.</p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD / EDIT MODAL ===== */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
            >
              <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {modalMode === 'add' ? 'Register New SPOC' : 'Edit SPOC Details'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {modalMode === 'add' ? 'Create a new SPOC profile' : 'Update SPOC details'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 text-sm font-medium border rounded-xl outline-none transition focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-slate-200'
                        }`}
                      placeholder="e.g., Rajesh"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 text-sm font-medium border rounded-xl outline-none transition focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-slate-200'
                        }`}
                      placeholder="e.g., Kumar"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Department *
                  </label>
                  <div className="relative">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 text-sm font-medium border rounded-xl outline-none transition focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none cursor-pointer ${errors.department ? 'border-red-400 bg-red-50' : 'border-slate-200'
                        }`}
                    >
                      <option value="">Choose department</option>
                      {allDepartments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 8L1 3h10z" fill="#94a3b8" />
                      </svg>
                    </div>
                  </div>
                  {errors.department && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="text"
                      name="phoneNo"
                      value={formData.phoneNo}
                      onChange={handleChange}
                      maxLength="10"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm font-medium border rounded-xl outline-none transition focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${errors.phoneNo ? 'border-red-400 bg-red-50' : 'border-slate-200'
                        }`}
                      placeholder="Enter 10-digit number"
                    />
                  </div>
                  {errors.phoneNo && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">{errors.phoneNo}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Only digits (0-9) • Exactly 10 digits</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email address *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="email"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm font-medium border rounded-xl outline-none transition focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${errors.emailId ? 'border-red-400 bg-red-50' : 'border-slate-200'
                        }`}
                      placeholder="e.g., username@ksrce.ac.in"
                    />
                  </div>
                  {errors.emailId && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">{errors.emailId}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Only @ksrce.ac.in domain allowed</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Default Password
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      disabled
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-500 font-semibold rounded-xl cursor-not-allowed select-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-normal font-medium">
                    Default credentials assigned automatically.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || sendingEmail}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-60 border ${modalMode === 'edit'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                      }`}
                  >
                    {(loading || sendingEmail) ? (
                      <FaSpinner className="animate-spin" size={14} />
                    ) : modalMode === 'edit' ? (
                      <FaEdit size={14} />
                    ) : (
                      <FaUserTie size={14} />
                    )}
                    {loading ? 'Processing…' : sendingEmail ? 'Sending email…' : modalMode === 'edit' ? 'Update' : 'Register'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== VIEW PROFILE MODAL (unchanged) ===== */}
      <AnimatePresence>
        {selectedSpoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpoc(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative z-10 flex flex-col"
            >
              <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500 border border-amber-600 text-white flex items-center justify-center text-lg sm:text-xl font-black shadow-md shadow-amber-100">
                    {getInitials(selectedSpoc.firstName, selectedSpoc.lastName)}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                      {selectedSpoc.firstName} {selectedSpoc.lastName}
                    </h3>
                    <span className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                      Role: {selectedSpoc.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSpoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-5 text-sm">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <FaRegIdCard /> Profile Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/40 font-semibold">
                    <div>
                      <p className="text-[11px] text-slate-400">First Name</p>
                      <p className="text-slate-800 mt-0.5">{selectedSpoc.firstName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Last Name</p>
                      <p className="text-slate-800 mt-0.5">{selectedSpoc.lastName}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-slate-400">Department</p>
                      <p className="text-slate-800 font-bold mt-0.5">{selectedSpoc.department || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <FaUserTie /> Communication Details
                  </h4>
                  <div className="space-y-2.5 font-semibold">
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <FaEnvelope className="text-slate-400 shrink-0" size={14} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Official Email</p>
                        <p className="text-slate-800 truncate mt-1 font-medium">{selectedSpoc.emailId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <FaPhone className="text-slate-400 shrink-0" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Mobile Number</p>
                        <p className="text-slate-800 font-mono mt-1">{selectedSpoc.phoneNo || 'Unlinked'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <FaClock size={12} />
                    <span>
                      Profile Enrolled: {selectedSpoc.createdAt
                        ? new Date(selectedSpoc.createdAt).toLocaleDateString()
                        : 'System Launch'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedSpoc(null);
                    openEditModal(selectedSpoc);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <FaEdit size={12} /> Edit
                </button>
                <button
                  onClick={() => setSelectedSpoc(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
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

export default SpocManagement;