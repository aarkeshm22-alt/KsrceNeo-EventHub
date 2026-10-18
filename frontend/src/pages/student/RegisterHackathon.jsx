import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaLightbulb,
  FaGlobe,
  FaUserPlus,
  FaPaperPlane,
  FaCircleInfo,
  FaHashtag,
  FaUserShield,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaLayerGroup,
  FaPlus,
  FaTrashCan,
  FaLock,
  FaChalkboardUser,
} from "react-icons/fa6";

const RegisterHackathon = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const linkedEvent = location.state?.event || null;
  const TargetEventId = linkedEvent?.eventId || linkedEvent?._id || "6a27f5ff1b3ae178a3954abc";

  const getValidFallbackId = () => {
    const rawUserId = localStorage.getItem("userId");
    return rawUserId && rawUserId.length === 24 ? rawUserId : "6a27f5ff1b3ae178a3954aba";
  };
  const currentUserId = getValidFallbackId();

  // Static department list (can be fetched from API if needed)
  const departmentOptions = ["BME","AUTO","CIVIL","CSE", "CSD","ECE", "EEE", "MECH", "SFE", "CS", "IT", "IOT", "MCA", "MBA"];

  const [formData, setFormData] = useState({
    eventId: TargetEventId,
    createdBy: currentUserId,
    teamName: "",
    projectTitle: "",
    projectDomain: "",
    leadName: "",
    leadPhone: "",
    leadEmail: "",
    year: "I",
    section: "A",
    members: [{ name: "", regNo: "", department: "" }], // array of objects
    personalMentor: "",
  });

  const [spocName, setSpocName] = useState("Assigned on Review");
  const [spocId, setSpocId] = useState(null);
  const [mentorsList, setMentorsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  const fetchStudentProfileAndRelated = async () => {
    try {
      const cachedUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

      if (cachedUser) {
        setFormData((prev) => ({
          ...prev,
          leadName: prev.leadName || cachedUser.name || "",
          leadEmail: prev.leadEmail || cachedUser.email || "",
        }));
      }

      let department = null;
      if (cachedUser && cachedUser.department) {
        department = cachedUser.department;
      } else if (currentUserId) {
        const response = await fetch(
          `https://ksrceneo-eventhub.onrender.com/api/auth/profile/${currentUserId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const result = await response.json();
          const userData = result.success ? result.data : result;
          if (userData && userData.department) {
            department = userData.department;
          }
        }
      }

      if (department) {
        // 1. Fetch SPOC first – this sets spocId
        await fetchSpocByDepartment(department);
        // 2. Fetch mentors, passing the SPOC's ID to exclude it
        await fetchMentorsByDepartment(department, spocId);
      }
    } catch (err) {
      console.warn("Profile or related data fetch failed:", err);
    }
  };

  const fetchSpocByDepartment = async (department) => {
    try {
      const response = await fetch(
        `https://ksrceneo-eventhub.onrender.com/api/by-department?department=${encodeURIComponent(department)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        setSpocName(`${department.toUpperCase()} SPOC (Auto)`);
        return;
      }
      const result = await response.json();
      if (result.success && result.data) {
        const spoc = result.data;
        const fullName = spoc.firstName + (spoc.lastName ? " " + spoc.lastName : "");
        setSpocName(fullName || `${department.toUpperCase()} SPOC`);
        if (spoc._id && spoc._id.length === 24) {
          setSpocId(spoc._id); // <-- this is now available for exclusion
        }
      } else {
        setSpocName(`${department.toUpperCase()} SPOC (Auto)`);
      }
    } catch (e) {
      console.warn("SPOC fetch failed:", e);
      setSpocName(`${department.toUpperCase()} SPOC (Auto)`);
    }
  };

  // ✅ Accept an optional `excludeId` to filter out the SPOC
  const fetchMentorsByDepartment = async (department, excludeId = null) => {
    try {
      const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        setMentorsList([]);
        return;
      }
      const result = await response.json();
      let users = [];
      if (Array.isArray(result)) {
        users = result;
      } else if (result.data && Array.isArray(result.data)) {
        users = result.data;
      } else {
        users = [];
      }
      // Filter mentors by role and department, and optionally exclude the SPOC ID
      const mentors = users.filter(
        (user) =>
          user.role === "mentor" &&
          user.department === department &&
          (excludeId ? user._id !== excludeId : true)
      );
      setMentorsList(mentors);
      if (mentors.length > 0) {
        setFormData((prev) => ({
          ...prev,
          personalMentor: prev.personalMentor || mentors[0].name,
        }));
      } else {
        // If no mentors left after exclusion, clear the selection
        setFormData((prev) => ({
          ...prev,
          personalMentor: "",
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch mentors:", e);
      setMentorsList([]);
    }
  };

  fetchStudentProfileAndRelated();
}, [currentUserId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle changes to member fields (name, regNo, department)
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, members: updatedMembers });
  };

  const addMemberField = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: "", regNo: "", department: "" }],
    });
  };

  const removeMemberField = (index) => {
    if (formData.members.length === 1) return;
    const updatedMembers = formData.members.filter((_, idx) => idx !== index);
    setFormData({ ...formData, members: updatedMembers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter out empty member entries (if all fields are empty)
    const cleanedMembers = formData.members.filter(
      (m) => m.name.trim() !== "" || m.regNo.trim() !== "" || m.department.trim() !== ""
    );

    // Optionally, if you only need names for the backend, you can map to array of names:
    // const memberNames = cleanedMembers.map(m => m.name);
    // But we'll send the full objects as per the new structure.
    // Adjust according to your backend expectations.

    let finalDepartmentMentor = spocId;
    if (
      !finalDepartmentMentor ||
      String(finalDepartmentMentor).includes("Auto") ||
      String(finalDepartmentMentor).length !== 24
    ) {
      finalDepartmentMentor = currentUserId;
    }

    const registrationPayload = {
      eventId: TargetEventId ? TargetEventId : "MISSING_EVENT_ID",
      createdBy: currentUserId,
      teamName: formData.teamName,
      projectTitle: formData.projectTitle,
      projectDomain: formData.projectDomain,
      leadName: formData.leadName,
      leadPhone: formData.leadPhone,
      leadEmail: formData.leadEmail,
      year: formData.year,
      section: formData.section,
      members: cleanedMembers, // array of objects { name, regNo, department }
      personalMentor: formData.personalMentor || "Not Specified",
      departmentMentor: finalDepartmentMentor,
    };

    try {
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/registrations/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(registrationPayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(result.message || "Registration Saved & Processed Successfully!");
        navigate("/student/applications");
      } else {
        alert(`Submission Rejected: ${result.message || "Bad account context details."}`);
      }
    } catch (err) {
      console.error("Database connection failure:", err);
      alert("Network Error: Could not broadcast pipeline record block.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
      {/* Header Area */}
      <div className="max-w-6xl mx-auto border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Submit Your Details Here...
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Application for: <span className="text-blue-600 font-bold">{linkedEvent?.title || "Selected Track"}</span>
          </p>
        </div>

        <div className="self-start md:self-center inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 font-black tracking-wider rounded-xl text-[11px] select-none shadow-sm">
          <FaHashtag size={11} className="text-blue-500" />
          <span>Event ID: {TargetEventId}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm lg:col-span-2"
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* --- SECTION 1: PROJECT PROFILE --- */}
            <div className="border-b border-slate-100 pb-5 space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                Enter the Details of Your Project and Team
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <FaUsers size={12} className="text-slate-400" />
                  <span>Team Name</span>
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  placeholder="e.g., Tech Titans"
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <FaLightbulb size={12} className="text-slate-400" />
                    <span>Project Title</span>
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    placeholder="e.g., Innovation title..."
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <FaGlobe size={12} className="text-slate-400" />
                    <span>Project Domain</span>
                  </label>
                  <input
                    type="text"
                    name="projectDomain"
                    value={formData.projectDomain}
                    placeholder="e.g., Generative AI, Web3"
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: TEAM LEAD --- */}
            <div className="border-b border-slate-100 pb-5 space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                Team Lead 
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <FaUserShield size={12} className="text-slate-400" />
                  <span>Team Lead Name</span>
                </label>
                <input
                  type="text"
                  name="leadName"
                  value={formData.leadName}
                  placeholder="Full Name of Team Captain"
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <FaPhone size={12} className="text-slate-400" />
                    <span>Lead Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    name="leadPhone"
                    value={formData.leadPhone}
                    placeholder="10-digit mobile line"
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <FaEnvelope size={12} className="text-slate-400" />
                    <span>Lead Mail ID</span>
                  </label>
                  <input
                    type="email"
                    name="leadEmail"
                    value={formData.leadEmail}
                    placeholder="name@institution.com"
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <FaGraduationCap size={13} className="text-slate-400" />
                    <span>Year</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="I">I Year</option>
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <FaLayerGroup size={12} className="text-slate-400" />
                    <span>Section</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>
            </div>

            {/* --- SECTION 3: MENTOR ASSIGNMENTS --- */}
            <div className="border-b border-slate-100 pb-5 space-y-4">
              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                Spoc & Personal Mentor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FaChalkboardUser size={12} className="text-slate-400" />
                      <span>Department Spoc</span>
                    </span>
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1 rounded flex items-center gap-0.5 uppercase tracking-wide">
                      <FaLock size={8} /> Auto-Assigned
                    </span>
                  </label>
                  <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-3 sm:py-2.5 text-xs sm:text-sm font-semibold flex items-center select-none cursor-not-allowed min-h-[44px] sm:min-h-[38px]">
                    <span className="truncate">{spocName}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <FaChalkboardUser size={12} className="text-blue-500" />
                    <span>Personal Mentor</span>
                  </label>
                  <select
                    name="personalMentor"
                    value={formData.personalMentor}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-3 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition-all font-medium cursor-pointer"
                  >
                    {mentorsList.length === 0 ? (
                      <option value="">No mentors available</option>
                    ) : (
                      mentorsList.map((mentor) => (
                        <option key={mentor._id} value={mentor.name}>
                          {mentor.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* --- SECTION 4: ADDITIONAL MEMBERS (UPDATED) --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FaUserPlus size={12} />
                  <span>Team Members</span>
                </label>
                <button
                  type="button"
                  onClick={addMemberField}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-2 sm:py-1.5 rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
                >
                  <FaPlus size={10} /> Add Member
                </button>
              </div>

              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {formData.members.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-500">Member #{index + 1}</span>
                        <button
                          type="button"
                          disabled={formData.members.length === 1}
                          onClick={() => removeMemberField(index)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FaTrashCan size={12} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Register Number"
                          value={member.regNo}
                          onChange={(e) => handleMemberChange(index, "regNo", e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all"
                        />
                        <select
                          value={member.department}
                          onChange={(e) => handleMemberChange(index, "department", e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-all font-medium cursor-pointer"
                        >
                          <option value="">Department</option>
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-4 sm:py-3.5 rounded-xl transition-all shadow-md active:scale-[0.99] disabled:bg-blue-400 disabled:cursor-wait"
              >
                <FaPaperPlane size={11} />
                <span>{isSubmitting ? "Submitting Your Application..." : "Submit Application"}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info Card */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 text-slate-800">
            <FaCircleInfo size={13} className="text-blue-500 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Note</h2>
          </div>
          <ul className="space-y-3.5 text-xs text-slate-500 leading-relaxed list-none pl-0">
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
              <p>
                The <b className="text-amber-600">SPOC</b> will be auto-assigned by the system based on the logged-in user's department. This assignment cannot be changed.
              </p>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
              <p>
                All fields marked as required must be completed before submitting the form.
              </p>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 shrink-0" />
              <p>
                Team Lead communication details (Mail & Phone) must be functional.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterHackathon;