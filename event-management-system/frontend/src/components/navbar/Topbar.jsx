import { useState, useEffect } from "react";
import {
  FaBars,
  FaSignOutAlt,
  FaUserAlt,
  FaCheckCircle,
  FaChevronDown,
  FaTimes,
  FaIdCard,
  FaEnvelope,
  FaShieldAlt,
  FaPhone,
  FaGraduationCap,
  FaBuilding,
  FaLock,
  FaCheck,
  FaSync,
  FaLockOpen
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Topbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [viewDetailModal, setViewDetailModal] = useState(false);

  // Password change state for SPOC
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ text: "", type: "" });

  const [passwordUpdated, setPasswordUpdated] = useState(() => {
    return localStorage.getItem('spocPasswordUpdated') === 'true';
  });

  // Get user from store and fallback to localStorage
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  // Build userProfile from store or localStorage
  const getUserProfile = () => {
    if (user && Object.keys(user).length > 0) {
      return user;
    }
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to parse user from localStorage:", e);
    }
    return null;
  };

  const userProfile = getUserProfile();

  // --------------------------------------------
  // Helpers
  // --------------------------------------------
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const role = (userProfile?.role || "guest").toLowerCase();

  const getDisplayName = () => {
    const source = userProfile;
    if (source?.firstName || source?.lastName) {
      return `${source.firstName || ""} ${source.lastName || ""}`.trim();
    }
    return source?.name || "Anonymous User";
  };

  const userName = getDisplayName();
  const userEmail = userProfile?.email || userProfile?.emailId || "No email provided";

  const getMobileNumber = () => {
    const source = userProfile;
    return source?.mobileNo || source?.mobile || source?.phoneNo || source?.phone || source?.contact || "—";
  };

  const getRegno = () => {
    const source = userProfile;
    return source?.registerNo || source?.regNo || source?.registrationNumber || "—";
  };

  // --------------------------------------------
  // Password update handler (unchanged)
  // --------------------------------------------
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    const authToken = token || localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!authToken) {
      setPwdMessage({ text: "Session expired. Please log in again.", type: "error" });
      return;
    }

    const spocId = user?._id || user?.id;
    if (!spocId) {
      setPwdMessage({ text: "User ID not found.", type: "error" });
      return;
    }

    try {
      setPwdLoading(true);
      setPwdMessage({ text: "", type: "" });

      const response = await fetch(`https://ksrceneo-eventhub.onrender.com/api/admin/spoc/update-password/${spocId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "x-user-role": user?.role || "spoc"
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update password.");

      setPasswordUpdated(true);
      localStorage.setItem('spocPasswordUpdated', 'true');

      setPwdMessage({ text: "Password updated successfully! This section is now locked.", type: "success" });
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setPwdMessage({ text: "", type: "" });
      }, 4000);

    } catch (err) {
      setPwdMessage({ text: err.message, type: "error" });
    } finally {
      setPwdLoading(false);
    }
  };

  // --------------------------------------------
  // Render (unchanged except using helpers)
  // --------------------------------------------
  return (
    <>
      {/* TOPBAR */}
      <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 z-40 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center transition-colors active:scale-95 cursor-pointer lg:hidden"
            aria-label="Toggle Side Navigation"
          >
            <FaBars size={16} />
          </button>
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2.5">
              <span>Event Hub</span>
              <span className="inline-flex items-center text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                KSRCE<span className="text-[7px] text-blue-400 font-black mx-0.5">-</span>NEO
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-5 w-px bg-slate-200/80 hidden xs:block" />

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50/80 border border-transparent hover:border-slate-100 transition-all text-left cursor-pointer group"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden shadow-2xs">
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-xs text-slate-700 font-bold">{userName.charAt(0).toUpperCase()}</span>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden md:block max-w-[140px] pr-1">
                <p className="font-bold text-xs text-slate-900 truncate tracking-tight">{userName}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                  {role}
                </p>
              </div>
              <FaChevronDown size={10} className={`text-slate-400 transition-transform duration-200 hidden md:block ${profileOpen ? "rotate-180 text-slate-700" : "group-hover:text-slate-600"}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 6 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-lg rounded-2xl p-1.5 z-20 origin-top-right overflow-hidden"
                  >
                    <div className="p-3 border-b border-slate-100 md:hidden block bg-slate-50/60 rounded-xl mb-1">
                      <p className="font-bold text-xs text-slate-900 truncate">{userName}</p>
                      <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 uppercase tracking-wider">
                        <FaCheckCircle className="text-[8px]" />
                        {role}
                      </div>
                    </div>

                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1 hidden md:block">
                      Account Panel
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setViewDetailModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left group/item cursor-pointer"
                    >
                      <FaUserAlt className="text-slate-400 group-hover/item:text-blue-500 transition-colors text-xs" />
                      Manage Profile
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 rounded-xl transition-colors text-left group/item cursor-pointer"
                    >
                      <FaSignOutAlt className="text-rose-400 group-hover/item:text-rose-600 transition-colors text-xs" />
                      Terminate Session
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PROFILE SLIDE-OUT DRAWER */}
      {/* ======================================================== */}
      <AnimatePresence>
        {viewDetailModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewDetailModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", damping: 20, stiffness: 160 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-900 text-base tracking-tight">Profile Information</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {role === "admin" || role === "coadmin" ? "Administration" : `${role.toUpperCase()} Profile`}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewDetailModal(false)}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>

                {/* Avatar Banner */}
                <div className="flex flex-col items-center gap-2.5 bg-slate-50/70 border border-slate-200/50 p-5 rounded-2xl text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 font-black text-xl text-white flex items-center justify-center shadow-md border-2 border-white ring-4 ring-blue-50 overflow-hidden">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{userName}</h4>
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                      {role}
                    </span>
                  </div>
                </div>

                {/* ROLE CASE 1: ADMIN & CO-ADMIN */}
                {(role === "admin" || role === "coadmin") && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 text-slate-400 flex items-center justify-center">
                        <FaShieldAlt size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">System Role</p>
                        <p className="text-xs font-bold text-slate-700 capitalize">{role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 text-slate-400 flex items-center justify-center">
                        <FaEnvelope size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Mail Address</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 text-slate-400 flex items-center justify-center">
                        <FaPhone size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Mobile Number</p>
                        <p className="text-xs font-bold text-slate-700">{getMobileNumber()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ROLE CASE 2: STUDENT */}
                {role === "student" && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                        <FaIdCard size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reg No</p>
                        <p className="text-xs font-bold text-slate-700">{getRegno()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2.5 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                        <FaBuilding size={12} className="text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase text-slate-400">Dept</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{userProfile?.department || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                        <FaGraduationCap size={12} className="text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase text-slate-400">Year / Sec</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{userProfile?.year || "—"} / {userProfile?.section || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                        <FaEnvelope size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Email</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                        <FaPhone size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Mobile Number</p>
                        <p className="text-xs font-bold text-slate-700">{getMobileNumber()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ROLE CASE 3: MENTOR */}
                {role === "mentor" && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                        <FaBuilding size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Department</p>
                        <p className="text-xs font-bold text-slate-700">{userProfile?.department || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                        <FaEnvelope size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Email</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                        <FaPhone size={12} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Mobile Number</p>
                        <p className="text-xs font-bold text-slate-700">{getMobileNumber()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ROLE CASE 4: SPOC */}
                {role === "spoc" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                          <FaBuilding size={12} className="text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Department</p>
                          <p className="text-xs font-bold text-slate-700">{userProfile?.department || "—"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                          <FaEnvelope size={12} className="text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Email Address</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{userEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center">
                          <FaPhone size={12} className="text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Phone Number</p>
                          <p className="text-xs font-bold text-slate-700">{getMobileNumber()}</p>
                        </div>
                      </div>
                    </div>

                    {/* ======== PASSWORD UPDATE SECTION ======== */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center gap-2">
                        {passwordUpdated ? (
                          <FaLockOpen className="text-emerald-600" size={12} />
                        ) : (
                          <FaLock className="text-blue-600" size={12} />
                        )}
                        <h5 className="font-extrabold text-slate-900 text-xs tracking-tight">
                          {passwordUpdated ? "Password Updated & Locked" : "Update Password"}
                        </h5>
                      </div>

                      {passwordUpdated ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-start gap-2">
                          <FaCheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={14} />
                          <span>
                            <span className="font-bold">Default password updated successfully!</span><br />
                            You were required to change the default password assigned by the admin.
                            This section is now <span className="font-bold">permanently locked</span> for security purposes.
                          </span>
                        </div>
                      ) : (
                        <>
                          {pwdMessage.text && (
                            <div className={`p-2.5 rounded-xl text-xs font-semibold ${pwdMessage.type === "success"
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : "bg-rose-50 border border-rose-200 text-rose-700"
                              }`}>
                              {pwdMessage.text}
                            </div>
                          )}

                          <form onSubmit={handlePasswordUpdate} className="space-y-2.5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">New Password</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirm Password</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                required
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={pwdLoading}
                              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                              {pwdLoading ? <FaSync className="animate-spin" size={11} /> : <FaCheck size={11} />}
                              <span>Update Password</span>
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 tracking-tight">
                  &copy; {new Date().getFullYear()} Event Hub. All rights reserved.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;