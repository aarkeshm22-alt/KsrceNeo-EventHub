import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaUser, 
  FaIdCard, 
  FaBuilding, 
  FaCalendarAlt, 
  FaLayerGroup, 
  FaPhone, 
  FaEnvelope, 
  FaLock, 
  FaCheckCircle,
  FaSpinner,
  FaInfoCircle,
  FaArrowLeft,
  FaSync
} from "react-icons/fa";

import {
  validateKsrceEmail,
  validateMobile,
  validatePassword,
} from "../../utils/validators";

const StudentRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    department: "",
    year: "",
    section: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ----- OTP State -----
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ----- Timer for resend OTP -----
  useEffect(() => {
    let interval;
    if (otpResendCooldown > 0) {
      interval = setInterval(() => {
        setOtpResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendCooldown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
    }
    if (!formData.regNo.trim()) {
      newErrors.regNo = "Register number is required";
    }
    if (!formData.department) {
      newErrors.department = "Please select your department";
    }
    if (!formData.year) {
      newErrors.year = "Please select your current year";
    }
    if (!formData.section.trim()) {
      newErrors.section = "Section is required (e.g., A, B, or C)";
    }
    if (!validateMobile(formData.mobile)) {
      newErrors.mobile = "Mobile Number must be exactly 10 digits";
    }
    if (!validateKsrceEmail(formData.email)) {
      newErrors.email = "Please use a valid @ksrce.ac.in student email";
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must meet college security rules";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----- Step 1: Send OTP -----
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSendingOtp(true);
    setServerError("");
    setOtpError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setOtpSent(true);
      setOtpResendCooldown(60); // 60 seconds cooldown
      setStep("otp");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ----- Step 2: Verify OTP & Register -----
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setOtpError("Please enter the OTP sent to your email.");
      return;
    }

    setIsVerifying(true);
    setOtpError("");
    setServerError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please check your OTP.");
      }

      // Success: redirect to login
      navigate("/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // ----- Resend OTP -----
  const handleResendOtp = async () => {
    if (otpResendCooldown > 0) return;

    setIsSendingOtp(true);
    setOtpError("");
    setServerError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP.");
      }

      setOtpResendCooldown(60);
      setOtpSent(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ----- Go back to form step -----
  const handleBackToForm = () => {
    setStep("form");
    setOtp("");
    setOtpError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-lg border border-slate-200 rounded-2xl w-full max-w-2xl p-6 sm:p-8"
      >
        {/* Header Title with Navy & Gold */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-slate-900">
            <span className="text-amber-500">✦</span> Student Registration
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create your account to take part in the college hackathon event portal
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-4 gap-3 text-xs font-bold">
          <div className={`flex items-center gap-2 ${step === "form" ? "text-slate-900" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step === "form" ? "bg-slate-900 text-amber-400" : "bg-slate-200 text-slate-500"
            }`}>1</span>
            <span>Details</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-300" />
          <div className={`flex items-center gap-2 ${step === "otp" ? "text-slate-900" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step === "otp" ? "bg-slate-900 text-amber-400" : "bg-slate-200 text-slate-500"
            }`}>2</span>
            <span>Verify OTP</span>
          </div>
        </div>

        {/* Account Requirements Bullet Points (only in form step) */}
        {step === "form" && (
          <div className="mb-5 p-4 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-700">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs mb-2 uppercase tracking-wider">
              <FaInfoCircle size={14} className="text-amber-500" />
              <span>Registration Instructions</span>
            </div>
            <ul className="list-disc pl-5 text-xs space-y-1.5 text-slate-600">
              <li>
                You must use your official college email ID (<span className="font-semibold text-slate-900">@ksrce.ac.in</span>) only.
              </li>
              <li>
                Password length must be strictly between <span className="font-semibold text-slate-900">6 to 8 characters</span>.
              </li>
              <li>
                Password must contain at least <span className="font-semibold text-slate-900">1 uppercase letter</span>, <span className="font-semibold text-slate-900">1 number</span>, and <span className="font-semibold text-slate-900">1 special symbol</span> (e.g., @, $, !, %, *, ?, &).
              </li>
            </ul>
          </div>
        )}

        {/* Global Server Error */}
        {serverError && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
            {serverError}
          </div>
        )}

        {/* ===== STEP 1: FORM ===== */}
        {step === "form" && (
          <form onSubmit={handleSendOtp} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  name="name"
                  disabled={isSendingOtp}
                  placeholder="eg. Ravi V"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all disabled:opacity-60`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Register Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Register Number</label>
              <div className="relative">
                <FaIdCard className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  name="regNo"
                  disabled={isSendingOtp}
                  placeholder="eg. 711421104..."
                  value={formData.regNo}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.regNo ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all disabled:opacity-60`}
                />
              </div>
              {errors.regNo && <p className="text-red-500 text-xs mt-1">{errors.regNo}</p>}
            </div>

            {/* Department Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Department</label>
              <div className="relative">
                <FaBuilding className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <select
                  name="department"
                  disabled={isSendingOtp}
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.department ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all appearance-none disabled:opacity-60`}
                >
                  <option value="">Choose department</option>
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
                <div className="absolute right-4 top-3.5 pointer-events-none text-xs text-slate-400">▼</div>
              </div>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            {/* Year Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Current Year</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <select
                  name="year"
                  disabled={isSendingOtp}
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.year ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all appearance-none disabled:opacity-60`}
                >
                  <option value="">Choose year</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-xs text-slate-400">▼</div>
              </div>
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>

            {/* Section */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Section</label>
              <div className="relative">
                <FaLayerGroup className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  name="section"
                  disabled={isSendingOtp}
                  placeholder="eg. A, B,C or D"
                  maxLength="3"
                  value={formData.section}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.section ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all disabled:opacity-60`}
                />
              </div>
              {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  name="mobile"
                  disabled={isSendingOtp}
                  placeholder="eg. 9876543210"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.mobile ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all disabled:opacity-60`}
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block">College Email ID</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="email"
                  name="email"
                  disabled={isSendingOtp}
                  placeholder="eg. yourname@ksrce.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all disabled:opacity-60`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="password"
                  name="password"
                  disabled={isSendingOtp}
                  placeholder="Create secure password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.password ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all disabled:opacity-60`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="password"
                  name="confirmPassword"
                  disabled={isSendingOtp}
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all disabled:opacity-60`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Send OTP Button */}
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed border border-slate-800"
              >
                {isSendingOtp ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <FaEnvelope size={14} />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ===== STEP 2: OTP VERIFICATION ===== */}
        {step === "otp" && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs text-slate-600 text-center">
                We've sent a one‑time verification code to <strong>{formData.email}</strong>.
                <br />
                Please enter it below to complete your registration.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">OTP Code</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (otpError) setOtpError("");
                  }}
                  placeholder="Enter 6‑digit OTP"
                  maxLength="6"
                  className={`w-full bg-slate-50 border ${
                    otpError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-amber-500"
                  } focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all`}
                  required
                />
              </div>
              {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackToForm}
                className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FaArrowLeft size={12} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed border border-slate-800"
              >
                {isVerifying ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={14} />
                    <span>Verify & Create Account</span>
                  </>
                )}
              </button>
            </div>

            {/* Resend OTP */}
            <div className="text-center text-xs text-slate-500 pt-2">
              <span>Didn't receive the code? </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpResendCooldown > 0 || isSendingOtp}
                className={`text-amber-600 font-semibold hover:underline transition-colors ${
                  otpResendCooldown > 0 ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {otpResendCooldown > 0 ? `Resend in ${otpResendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Existing Account Link */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100 text-sm text-slate-500">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegister;