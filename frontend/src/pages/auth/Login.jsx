import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaUserAlt,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaSpinner,
  FaUserShield,
  FaTimes,
  FaUserTie,
  FaArrowRight,
  FaInfoCircle,
  FaSync,
} from "react-icons/fa";
import useAuthStore from "../../store/authStore";

const THEME = {
  navy: "#0B1A2E",
  navyHover: "#132A4A",
  amber: "#F59E0B",
  amberHover: "#D97706",
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const redirectNotice = location.state?.message || "";

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState({ text: "", isError: false });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });

  // ----- CAPTCHA State (alphanumeric) -----
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // ----- Generate random alphanumeric CAPTCHA (6 chars) -----
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setCaptchaInput("");
    setCaptchaError("");
  };

  // ----- Generate on mount -----
  useEffect(() => {
    generateCaptcha();
  }, []);

  const HARDCODED_ACCOUNTS = {
    admin: {
      email: "admin@ksrce.ac.in",
      password: "AdminPassword123!",
      userMock: {
        id: "admin-static-id",
        name: "System Administrator",
        email: "admin@ksrce.ac.in",
        role: "admin",
        department: "MANAGEMENT",
      },
    },
    coadmin: {
      email: "coadmin@ksrce.ac.in",
      password: "CoadminPassword123!",
      userMock: {
        id: "coadmin-static-id",
        name: "Assistant Administrator",
        email: "coadmin@ksrce.ac.in",
        role: "coadmin",
        department: "MANAGEMENT",
      },
    },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
    if (captchaError) setCaptchaError("");
  };

  const handleRoleChange = (newRole) => {
    if (isLoading) return;
    setFormData({ ...formData, role: newRole });
    if (errorMessage) setErrorMessage("");
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage({ text: "", isError: false });

    try {
      const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to process request.");
      setModalMessage({ text: "Password reset link sent to your email!", isError: false });
      setTimeout(() => {
        setShowForgotModal(false);
        setModalMessage({ text: "", isError: false });
      }, 3000);
    } catch (err) {
      setModalMessage({ text: err.message, isError: true });
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----- CAPTCHA Verification (case‑insensitive) -----
    if (!captchaInput || captchaInput.toLowerCase() !== captcha.toLowerCase()) {
      setCaptchaError("❌ Incorrect CAPTCHA code. Please try again.");
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setCaptchaError("");

    const selectedRole = formData.role;

    setTimeout(async () => {
      if (selectedRole === "admin" || selectedRole === "coadmin") {
        const matchAccount = HARDCODED_ACCOUNTS[selectedRole];
        if (formData.email === matchAccount.email && formData.password === matchAccount.password) {
          const mockToken = `mock-local-token-${selectedRole}`;
          localStorage.setItem("authToken", mockToken);
          localStorage.setItem("token", mockToken);
          localStorage.setItem("user", JSON.stringify(matchAccount.userMock));
          localStorage.setItem("userId", matchAccount.userMock.id);
          login(matchAccount.userMock);
          setIsLoading(false);
          navigate("/admin/dashboard");
          return;
        } else {
          setIsLoading(false);
          setErrorMessage("Invalid credentials for administrative access.");
          return;
        }
      }

      if (selectedRole === "spoc") {
        try {
          const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/auth/spoc-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "SPOC authentication failed.");
          }
          if (data.token) {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("token", data.token);
          }
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("userId", data.user.id);
          }
          login(data.user);
          navigate("/spoc/dashboard");
          setIsLoading(false);
          return;
        } catch (err) {
          setErrorMessage(err.message);
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await fetch("https://ksrceneo-eventhub.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: selectedRole,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Authentication failed.");
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userId", data.user.id || data.user._id);
        }
        login(data.user);

        switch (data.user.role) {
          case "mentor":
            navigate("/mentor/dashboard");
            break;
          case "student":
            navigate("/student/dashboard");
            break;
          default:
            throw new Error("Unknown user role.");
        }
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    }, 1200);
  };

  const roles = [
    { id: "student", label: "Student", icon: FaGraduationCap },
    { id: "mentor", label: "Mentor", icon: FaChalkboardTeacher },
    { id: "spoc", label: "SPOC", icon: FaUserTie },
    { id: "coadmin", label: "Co-Admin", icon: FaUserShield },
    { id: "admin", label: "Admin", icon: FaUserAlt },
  ];

  return (
    <>
      {/* FULL-PAGE LOADER */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-[5px] border-slate-100"
                style={{
                  borderTopColor: THEME.amber,
                  borderRightColor: THEME.navy,
                }}
              />
              <div className="absolute w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                <FaSpinner className="text-[#0B1A2E] animate-spin" size={22} />
              </div>
            </div>
            <p className="mt-6 text-sm font-bold text-[#0B1A2E] tracking-wide animate-pulse">
              Authenticating, please wait...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PURE WHITE BACKGROUND – SOLID CARD ===== */}
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-white selection:bg-amber-400 selection:text-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 md:p-10"
        >
          {/* Top Amber Accent Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-amber-500 rounded-b-full shadow-xs" />

          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1A2E] tracking-tight">
              KSRCE <span className="text-amber-500">NEO</span> Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select your role and sign in to access your portal
            </p>
          </div>

          {/* REDIRECT NOTICE */}
          {redirectNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs font-semibold leading-relaxed"
            >
              <FaInfoCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <span>{redirectNotice}</span>
            </motion.div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold text-center"
            >
              {errorMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Select Role
              </label>
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = formData.role === r.id;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleRoleChange(r.id)}
                      className={`
                        relative flex items-center justify-center gap-1.5 py-2 px-3
                        rounded-xl text-xs font-bold transition-all duration-150 outline-none flex-1 min-w-[80px] sm:min-w-[90px]
                        ${isSelected
                          ? 'bg-[#0B1A2E] text-amber-400 shadow-md scale-[1.02]'
                          : 'text-slate-600 hover:text-[#0B1A2E] hover:bg-white/80'
                        }
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <Icon
                        size={13}
                        className={`transition-colors shrink-0 ${
                          isSelected ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="whitespace-nowrap tracking-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Field */}
            <div className="relative group">
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  formData.email
                    ? "text-[10px] -top-2.5 bg-white px-1.5 text-[#0B1A2E] font-bold"
                    : "top-3.5 text-slate-400 group-focus-within:text-[#0B1A2E] group-focus-within:text-[10px] group-focus-within:-top-2.5 group-focus-within:bg-white group-focus-within:px-1.5 font-medium"
                }`}
              >
                <FaEnvelope className="inline mr-1.5 text-xs text-amber-500" />
                Email Address
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                disabled={isLoading}
                placeholder=" "
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl px-4 pt-4 pb-2.5 text-sm font-semibold text-slate-800 outline-none transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="relative group">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    formData.password
                      ? "text-[10px] -top-2.5 bg-white px-1.5 text-[#0B1A2E] font-bold"
                      : "top-3.5 text-slate-400 group-focus-within:text-[#0B1A2E] group-focus-within:text-[10px] group-focus-within:-top-2.5 group-focus-within:bg-white group-focus-within:px-1.5 font-medium"
                  }`}
                >
                  <FaLock className="inline mr-1.5 text-xs text-amber-500" />
                  Password
                </label>
                <input
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  disabled={isLoading}
                  placeholder=" "
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl px-4 pt-4 pb-2.5 text-sm font-semibold text-slate-800 outline-none transition-all duration-200"
                />
              </div>

              {formData.role !== "admin" && formData.role !== "coadmin" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMessage({ text: "", isError: false });
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* ===== ALPHANUMERIC CAPTCHA ===== */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                CAPTCHA Verification
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-slate-800 select-none">
                  {captcha.split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        transform: `rotate(${Math.random() * 10 - 5}deg)`,
                        display: "inline-block",
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                  title="Refresh CAPTCHA"
                >
                  <FaSync size={16} />
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  if (captchaError) setCaptchaError("");
                }}
                placeholder="Enter the CAPTCHA here"
                className={`w-full bg-slate-50 border ${
                  captchaError ? "border-red-400" : "border-slate-200"
                } focus:border-amber-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all duration-200`}
                required
              />
              {captchaError && (
                <p className="text-xs font-bold text-red-600 mt-1">{captchaError}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-[#0B1A2E] hover:bg-[#132A4A] border border-[#0B1A2E] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 group cursor-pointer"
            >
              <span>Sign In</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
            </button>
          </form>

          {/* Registration Redirects */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
            <Link
              to="/student-register"
              className="text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors"
            >
              Create Student Account
            </Link>
            <span className="hidden sm:inline text-slate-300">•</span>
            <Link
              to="/mentor-register"
              className="text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors"
            >
              Create Mentor Account
            </Link>
          </div>
        </motion.div>

        {/* Forgot Password Modal – Solid White */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <FaTimes size={15} />
              </button>

              <h3 className="text-base font-black text-[#0B1A2E] mb-1">Reset Password</h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Sending password reset link for your <span className="text-amber-600 font-bold uppercase">{formData.role}</span> account.
              </p>

              {modalMessage.text && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs font-bold text-center border ${
                    modalMessage.isError
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {modalMessage.text}
                </div>
              )}

              <form onSubmit={handleSendResetLink} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Registered Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-4 py-2 text-xs font-bold bg-[#0B1A2E] text-amber-400 hover:bg-[#132A4A] rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-60"
                  >
                    {modalLoading && <FaSpinner className="animate-spin" size={12} />}
                    {modalLoading ? "Sending..." : "Send Link"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;