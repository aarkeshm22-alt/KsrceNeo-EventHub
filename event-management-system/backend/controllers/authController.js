import User from "../models/User.js"; // Note: Explicit .js extension is required in ESM
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/email.js";

// ============================================================
// SHARED HELPERS
// ============================================================

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Only @ksrce.ac.in or @ksriet.ac.in are allowed
const ALLOWED_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(ksrce\.ac\.in|ksriet\.ac\.in)$/;

const isValidCollegeEmail = (email) =>
  typeof email === "string" && ALLOWED_EMAIL_REGEX.test(email.trim());

// Same rules as frontend: 6–8 chars, 1 upper, 1 digit, 1 special
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,8}$/;

// ============================================================
// TEMPORARY OTP STORE (in-memory for development)
// For production, use Redis or a DB collection.
// ============================================================
const otpStore = new Map(); // key: email, value: { otp, expiresAt }

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Reusable email template (used by both sendOTP and resendOTP)
const buildOTPEmailHtml = (otp, name) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>OTP Verification</title>
    <style>
      @media screen and (max-width: 600px) {
        .container { width: 100% !important; border-radius: 0 !important; }
        .inner-padding { padding: 20px !important; }
        .otp-code { font-size: 28px !important; letter-spacing: 4px !important; }
        h1 { font-size: 20px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 20px 0;">
      <tr>
        <td align="center" style="padding: 10px;">
          <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="padding: 24px 20px; background-color: #2563eb;">
                <h1 style="margin: 0; color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;">KSRCE NEO Event Hub</h1>
                <p style="margin: 5px 0 0; color: #e0e7ff; font-family: Arial, sans-serif; font-size: 14px;">One-Time Verification Code</p>
              </td>
            </tr>
            <tr>
              <td class="inner-padding" align="left" style="padding: 30px; font-family: Arial, sans-serif;">
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Hello <strong>${name || "User"}</strong>,
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Use the following OTP to complete your registration:
                </p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                  <tr>
                    <td align="center" style="padding: 20px; background-color: #f1f5f9; border-radius: 12px; border: 2px dashed #2563eb;">
                      <span class="otp-code" style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace; line-height: 1.2;">
                        ${otp}
                      </span>
                    </td>
                  </tr>
                </table>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                  This OTP will expire in <strong>5 minutes</strong>.
                </p>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                  If you didn't request this, please ignore this email.
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 20px 0 0;">
                  Regards,<br>
                  <strong>KSRCE NEO Event Hub Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px; background-color: #f8fafc; color: #94a3b8; font-family: Arial, sans-serif; font-size: 12px;">
                <p style="margin: 0;">&copy; 2026 KSRCE NEO Event Hub. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// Internal OTP verification (does NOT delete on success — register endpoint does)
const consumeOTP = (email, otp) => {
  if (!email || !otp) {
    return { valid: false, message: "Email and OTP are required." };
  }
  const key = email.trim().toLowerCase();
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, message: "No OTP found for this email. Please request a new one." };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: "OTP has expired. Please request a new one." };
  }
  if (record.otp !== otp) {
    return { valid: false, message: "Invalid OTP." };
  }
  // Valid — consume it
  otpStore.delete(key);
  return { valid: true, message: "OTP verified successfully." };
};

// ============================================================
// REGISTER STUDENT
// ============================================================
export const registerStudent = async (req, res) => {
  try {
    const { email, regNo, name, department, year, section, mobile, password, otp } = req.body;

    // 0. Basic presence + domain validation
    if (!email || !isValidCollegeEmail(email)) {
      return res.status(400).json({
        message: "Please use your official college email (@ksrce.ac.in or @ksriet.ac.in).",
      });
    }
    if (!password || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Password must be 6–8 characters with at least 1 uppercase, 1 number, and 1 special character.",
      });
    }

    // 1. Verify OTP FIRST (before hitting the DB)
    const otpCheck = consumeOTP(email, otp);
    if (!otpCheck.valid) {
      return res.status(400).json({ message: otpCheck.message });
    }

    // 2. Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // 3. Check register number
    if (regNo) {
      const regNoExists = await User.findOne({ regNo });
      if (regNoExists) {
        return res.status(400).json({
          message: "A student with this Register Number is already registered.",
        });
      }
    }

    // 4. Create the user
    const student = await User.create({
      name,
      email,
      password,
      regNo,
      department,
      year,
      section,
      mobile,
      role: "student",
    });

    if (student) {
      return res.status(201).json({
        success: true,
        message: "Student registration successful!",
      });
    }
    return res.status(400).json({ message: "Invalid student profile data structure." });
  } catch (error) {
    res.status(500).json({
      message: "Server operational student database setup error.",
      error: error.message,
    });
  }
};

// ============================================================
// REGISTER MENTOR
// ============================================================
export const registerMentor = async (req, res) => {
  try {
    const { email, firstName, lastName, name, department, mobile, password } = req.body;

    if (!email || !isValidCollegeEmail(email)) {
      return res.status(400).json({
        message: "Please use your official college email (@ksrce.ac.in or @ksriet.ac.in).",
      });
    }
    if (!password || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Password must be 6–8 characters with at least 1 uppercase, 1 number, and 1 special character.",
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    let finalName = name;
    if (!finalName && (firstName || lastName)) {
      finalName = `${firstName || ""} ${lastName || ""}`.trim();
    }
    if (!finalName) {
      return res.status(400).json({ message: "Name field validation requirement is missing." });
    }

    const mentor = await User.create({
      name: finalName,
      email,
      password,
      department,
      mobile,
      firstName: firstName || "",
      lastName: lastName || "",
      role: "mentor",
    });

    if (mentor) {
      return res.status(201).json({
        success: true,
        message: "Mentor registration successful!",
      });
    }
    return res.status(400).json({ message: "Invalid mentor profile data structure." });
  } catch (error) {
    res.status(500).json({
      message: "Server operational mentor database setup error.",
      error: error.message,
    });
  }
};

// ============================================================
// LOGIN
// ============================================================
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid verification parameters." });
    }
    if (user.role !== role) {
      return res
        .status(403)
        .json({ message: `Access denied. Target framework role mismatch: ${role}.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid verification parameters." });
    }

    res.status(200).json({
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server parsing trace fault.", error: error.message });
  }
};

// ============================================================
// GET PROFILE
// ============================================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      return res.status(200).json({ success: true, data: user });
    }
    return res
      .status(404)
      .json({ success: false, message: "User workspace timeline context not found." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Data compilation fault trace error.",
      error: error.message,
    });
  }
};

// ============================================================
// FORGOT PASSWORD (stub)
// ============================================================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // TODO: implement token generation + email
    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully!",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error occurred while processing reset link." });
  }
};

// ============================================================
// SEND OTP
// ============================================================
export const sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // ✅ College-domain check (this was missing)
    if (!isValidCollegeEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Only @ksrce.ac.in or @ksriet.ac.in email addresses are allowed.",
      });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email.trim().toLowerCase(), { otp, expiresAt });

    console.log(`📧 OTP for ${email}: ${otp}`);

    const result = await sendEmail({
      from: `KSRCE NEO Event Hub <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "KSRCE NEO Event Hub - OTP Verification",
      html: buildOTPEmailHtml(otp, name),
    });

    if (!result.success) {
      otpStore.delete(email.trim().toLowerCase());
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ============================================================
// VERIFY OTP (internal helper — exported for reuse)
// ============================================================
export const verifyOTP = (email, otp) => consumeOTP(email, otp);

// ============================================================
// VERIFY OTP ENDPOINT (optional standalone route)
// ============================================================
export const verifyOTPEndpoint = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = consumeOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ============================================================
// RESEND OTP
// ============================================================
export const resendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!isValidCollegeEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Only @ksrce.ac.in or @ksriet.ac.in email addresses are allowed.",
      });
    }

    const key = email.trim().toLowerCase();
    otpStore.delete(key);

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(key, { otp, expiresAt });

    console.log(`📧 Resend OTP for ${email}: ${otp}`);

    // ✅ Was previously a literal "..." string — now uses the shared template
    const result = await sendEmail({
      from: `KSRCE NEO Event Hub <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "KSRCE NEO Event Hub - New OTP",
      html: buildOTPEmailHtml(otp, name),
    });

    if (!result.success) {
      otpStore.delete(key);
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully.",
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};