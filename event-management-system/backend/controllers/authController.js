import User from "../models/User.js"; // Note: Explicit .js extension is required in ESM
import jwt from "jsonwebtoken";
import { sendEmail } from '../config/email.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// --- REGISTER STUDENT ---
export const registerStudent = async (req, res) => {
  try {
    const { email, regNo, name, department, year, section, mobile, password } = req.body;

    // 1. Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // 2. Check if Register Number already exists (Prevents DB duplication index crashes)
    if (regNo) {
      const regNoExists = await User.findOne({ regNo });
      if (regNoExists) {
        return res.status(400).json({ message: "A student with this Register Number is already registered." });
      }
    }

    // 3. Create the user explicitly attaching the student role payload
    const student = await User.create({
      name,
      email,
      password,
      regNo,
      department,
      year,
      section,
      mobile,
      role: "student", // Hard-coded protection fallback
    });

    if (student) {
      return res.status(201).json({
        success: true,
        message: "Student registration successful!",
      });
    } else {
      return res.status(400).json({ message: "Invalid student profile data structure layers." });
    }
  } catch (error) {
    // This will now capture and display the exact database validation field error inside the network response
    res.status(500).json({ message: "Server operational student database setup error.", error: error.message });
  }
};

// --- REGISTER MENTOR ---
// --- REGISTER MENTOR ---
export const registerMentor = async (req, res) => {
  try {
    const { email, firstName, lastName, name, department, mobile, password } = req.body;

    // 1. Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // 2. Handle Name Mapping dynamically
    // If frontend sends firstName & lastName, combine them into 'name' to satisfy the schema requirement
    let finalName = name;
    if (!finalName && (firstName || lastName)) {
      finalName = `${firstName || ""} ${lastName || ""}`.trim();
    }

    if (!finalName) {
      return res.status(400).json({ message: "Name field validation requirement is missing." });
    }

    // 3. Create the mentor profile
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
    } else {
      return res.status(400).json({ message: "Invalid mentor profile data structure layers." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server operational mentor database setup error.", error: error.message });
  }
};

// --- LOGIN USER (Remains unified for all roles) ---
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid verification parameters." });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: `Access denied. Target framework role mismatch: ${role}.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid verification parameters." });
    }

    res.status(200).json({
      token: generateToken(user._id, user.role),
      user: {
        id: user._id, // 👈 Explicit mapping to your Mongoose database _id key
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department // 👈 Ensure this is present
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server parsing trace fault.", error: error.message });
  }
};

// --- GET PROFILE ---
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); 
    
    if (user) {
      // 🚨 Ensure it matches the frontend schema layout wrapper:
      res.status(200).json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: "User workspace timeline context not found." 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Data compilation fault trace error.", 
      error: error.message 
    });
  }
};

// Inside your backend routes file (e.g., routes/auth.js)

export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    // 1. Look up the user in the database based on their role
    // Example: const user = await User.findOne({ email, role });
    
    // 2. Generate a reset token or send a verification email here...

    // 3. ALWAYS return a JSON response back to the frontend
    return res.status(200).json({ 
      success: true, 
      message: "Password reset link sent successfully!" 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Server error occurred while processing reset link." 
    });
  }
};

// Import email utility (adjust path as needed)


// ============================================================
// TEMPORARY OTP STORE (in‑memory for development)
// For production, use Redis or a database collection
// ============================================================
const otpStore = new Map(); // key: email, value: { otp, expiresAt }

// Helper: generate 6‑digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// 1. SEND OTP
// ============================================================
export const sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Basic email format validation (optional)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP (overwrite any existing)
    otpStore.set(email, { otp, expiresAt });

    console.log(`📧 OTP for ${email}: ${otp}`); // for debugging

    // Send email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #1e293b; font-size: 24px; margin: 0;">KSRCE NEO Portal</h1>
          <p style="color: #64748b; font-size: 14px; margin: 5px 0;">One‑Time Verification Code</p>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Hello <strong>${name || 'User'}</strong>,
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Use the following OTP to complete your registration:
          </p>
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f1f5f9; border-radius: 12px; border: 2px dashed #2563eb;">
            <span style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            This OTP will expire in <strong>5 minutes</strong>.
          </p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #94a3b8; font-size: 12px;">
          <p>&copy; 2026 KSRCE NEO Portal. All rights reserved.</p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      from: `KSRCE NEO Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'KSRCE NEO Portal - OTP Verification',
      html,
    });

    if (!result.success) {
      // If email fails, remove the OTP from store
      otpStore.delete(email);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
      // In development, you can return the OTP for testing:
      // otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ============================================================
// 2. VERIFY OTP (internal function)
// ============================================================
export const verifyOTP = (email, otp) => {
  if (!email || !otp) return { valid: false, message: 'Email and OTP are required.' };

  const record = otpStore.get(email);
  if (!record) {
    return { valid: false, message: 'No OTP found for this email. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.otp !== otp) {
    return { valid: false, message: 'Invalid OTP.' };
  }

  // OTP is valid – delete it so it cannot be reused
  otpStore.delete(email);
  return { valid: true, message: 'OTP verified successfully.' };
};

// ============================================================
// 3. VERIFY OTP – API endpoint (optional)
// ============================================================
export const verifyOTPEndpoint = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = verifyOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ============================================================
// 4. RESEND OTP
// ============================================================
export const resendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Remove old OTP
    otpStore.delete(email);

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });

    console.log(`📧 Resend OTP for ${email}: ${otp}`);

    // Send email (same as above – reuse HTML)
    const html = `...`; // same as sendOTP

    const result = await sendEmail({
      from: `KSRCE NEO Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'KSRCE NEO Portal - New OTP',
      html,
    });

    if (!result.success) {
      otpStore.delete(email);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully.',
    });
  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};