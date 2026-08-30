import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Spoc from "../models/Spoc.js";
import User from "../models/User.js";           // 👈 needed for student lookup
import Registration from "../models/Registration.js"; // 👈 needed for registrations
import Event from "../models/Event.js";         // 👈 needed for event enrichment
import { sendEmail } from '../config/email.js';

// ------------------------------------------------------------------
// 1. ADMIN CRUD OPERATIONS
// ------------------------------------------------------------------

export const addSpoc = async (req, res) => {
  try {
    const { firstName, lastName, department, phoneNo, emailId, password } = req.body;

    if (!firstName || !lastName || !department || !phoneNo || !emailId || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!emailId.endsWith("@ksrce.ac.in")) {
      return res.status(400).json({ message: "Access denied. Only @ksrce.ac.in emails allowed." });
    }

    if (!/^[0-9]{10}$/.test(phoneNo)) {
      return res.status(400).json({ message: "Invalid phone structure. Must be exactly 10 digits." });
    }

    const existingSpoc = await Spoc.findOne({ $or: [{ emailId }, { phoneNo }] });
    if (existingSpoc) {
      return res.status(409).json({ message: "A SPOC with this Email or Phone number already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSpoc = new Spoc({
      firstName,
      lastName,
      department,
      phoneNo,
      emailId,
      password: hashedPassword,
    });

    await newSpoc.save();
    return res.status(201).json({ message: "SPOC successfully registered." });
  } catch (error) {
    console.error("Error in addSpoc:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getAllSpocs = async (req, res) => {
  try {
    const spocs = await Spoc.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(spocs);
  } catch (error) {
    console.error("Error in getAllSpocs:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getSpocById = async (req, res) => {
  try {
    const spoc = await Spoc.findById(req.params.id).select("-password");
    if (!spoc) {
      return res.status(404).json({ message: "SPOC profile not found." });
    }
    return res.status(200).json(spoc);
  } catch (error) {
    console.error("Error in getSpocById:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const updateSpoc = async (req, res) => {
  try {
    const { firstName, lastName, department, phoneNo, emailId } = req.body;
    const spocId = req.params.id;

    let spoc = await Spoc.findById(spocId);
    if (!spoc) {
      return res.status(404).json({ message: "SPOC profile not found." });
    }

    if (phoneNo && !/^[0-9]{10}$/.test(phoneNo)) {
      return res.status(400).json({ message: "Invalid phone structure. Must be exactly 10 digits." });
    }

    if (emailId && !emailId.endsWith("@ksrce.ac.in")) {
      return res.status(400).json({ message: "Access denied. Only @ksrce.ac.in emails allowed." });
    }

    if (emailId || phoneNo) {
      const duplicateCheck = await Spoc.findOne({
        _id: { $ne: spocId },
        $or: [
          ...(emailId ? [{ emailId }] : []),
          ...(phoneNo ? [{ phoneNo }] : []),
        ],
      });

      if (duplicateCheck) {
        return res.status(409).json({ message: "Another SPOC is already using this Email or Phone number." });
      }
    }

    spoc.firstName = firstName || spoc.firstName;
    spoc.lastName = lastName || spoc.lastName;
    spoc.department = department || spoc.department;
    spoc.phoneNo = phoneNo || spoc.phoneNo;
    spoc.emailId = emailId || spoc.emailId;

    const updatedSpoc = await spoc.save();
    const responseData = updatedSpoc.toObject();
    delete responseData.password;

    return res.status(200).json({ message: "SPOC updated successfully.", data: responseData });
  } catch (error) {
    console.error("Error in updateSpoc:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const deleteSpoc = async (req, res) => {
  try {
    const deletedSpoc = await Spoc.findByIdAndDelete(req.params.id);
    if (!deletedSpoc) {
      return res.status(404).json({ message: "SPOC profile not found." });
    }
    return res.status(200).json({ message: "SPOC profile successfully deleted." });
  } catch (error) {
    console.error("Error in deleteSpoc:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

// ------------------------------------------------------------------
// 2. SPOC AUTHENTICATION & PROFILE
// ------------------------------------------------------------------

export const spocLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const spoc = await Spoc.findOne({ emailId: email });
    if (!spoc) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, spoc.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: spoc._id,
        email: spoc.emailId,
        role: "spoc",
        department: spoc.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      id: spoc._id,
      name: `${spoc.firstName} ${spoc.lastName}`,
      email: spoc.emailId,
      role: "spoc",
      department: spoc.department,
      phoneNo: spoc.phoneNo,
    };

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error in spocLogin:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getSpocProfile = async (req, res) => {
  try {
    const spoc = await Spoc.findById(req.user.id).select("-password");
    if (!spoc) {
      return res.status(404).json({ message: "SPOC profile not found." });
    }

    const profile = {
      id: spoc._id,
      firstName: spoc.firstName,
      lastName: spoc.lastName,
      email: spoc.emailId,
      department: spoc.department,
      phoneNo: spoc.phoneNo,
      createdAt: spoc.createdAt,
      updatedAt: spoc.updatedAt,
    };

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error in getSpocProfile:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

// ------------------------------------------------------------------
// 3. NEW SPOC DASHBOARD ENDPOINTS
// ------------------------------------------------------------------

export const getSpocByDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ success: false, message: "Department query parameter is required" });
    }

    const spoc = await Spoc.findOne({ department: { $regex: new RegExp(`^${department}$`, "i") } });

    if (!spoc) {
      return res.status(404).json({ success: false, message: "SPOC not found for this department" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: spoc._id,
        firstName: spoc.firstName,
        lastName: spoc.lastName,
        department: spoc.department,
        emailId: spoc.emailId,
        phoneNo: spoc.phoneNo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentsByDepartment = async (req, res) => {
  try {
    const spocUser = req.user; // from protect middleware
    if (!spocUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // --- 1. Get SPOC department (with fallback to Spoc model) ---
    let department = spocUser.department;
    if (!department) {
      const spoc = await Spoc.findOne({ emailId: spocUser.email });
      if (spoc) department = spoc.department;
    }
    if (!department) {
      return res.status(400).json({ success: false, message: "Department not found for this SPOC." });
    }

    // --- 2. Normalize the department string (trim, convert to lowercase) ---
    const normalizedDept = department.trim();

    // --- 3. Query students with case‑insensitive, trim‑safe matching ---
    const students = await User.find({
      role: "student",
      // Use $regex with case‑insensitive option, and allow leading/trailing spaces
      department: { $regex: new RegExp(`^${normalizedDept}$`, "i") }
    })
      .select("name email regNo phone year section department") // include department for debugging
      .sort({ name: 1 });

    // --- 4. If still no results, try a looser match (contains) for debugging ---
    if (students.length === 0) {
      // Optional: log a warning so you know there's a mismatch
      console.warn(`⚠️ No students found for department: "${normalizedDept}". Check database values.`);
    }

    res.status(200).json({ 
      success: true, 
      count: students.length, 
      data: students,
      spocDepartment: normalizedDept // include this for frontend debugging
    });
  } catch (error) {
    console.error("❌ Error fetching students by department:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

export const getRegistrationsForSpoc = async (req, res) => {
  try {
    const spocUser = req.user;
    if (!spocUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Find the SPOC document
    const spocDoc = await Spoc.findOne({ emailId: spocUser.email });
    if (!spocDoc) {
      return res.status(404).json({ success: false, message: "SPOC profile not found." });
    }

    // 2. Get the SPOC's _id as a string (matches the registration's departmentMentor)
    const spocId = spocDoc._id.toString();

    // 3. Build the query – ALWAYS filter by departmentMentor
    const { status, search } = req.query;
    const query = { departmentMentor: spocId };   // ✅ THIS IS THE FILTER

    // Apply status filter if provided and not "All"
    if (status && status !== "All") {
      const mappedStatus = status === "Pending" ? "Pending Approval" : status;
      query.status = mappedStatus;
    }

    // Apply search filter if provided
    if (search) {
      query.$and = [
        {
          $or: [
            { teamName: { $regex: search, $options: "i" } },
            { leadName: { $regex: search, $options: "i" } },
            { projectTitle: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    console.log(`🔍 SPOC ID: ${spocId}, Query:`, JSON.stringify(query, null, 2));

    // 4. Execute query
    const registrations = await Registration.find(query)
      .populate("createdBy", "name email regNo department")
      .populate("departmentMentor", "name email")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ SPOC ${spocDoc.emailId} → ${registrations.length} registrations.`);

    // 5. Enrich with event details
    const enriched = await Promise.all(
      registrations.map(async (reg) => {
        if (reg.eventId) {
          try {
            const event = await Event.findOne({ eventId: reg.eventId })
              .select("eventId title description")
              .lean();
            if (event) {
              reg.eventDetails = {
                customEventId: event.eventId || reg.eventId,
                title: event.title,
                description: event.description,
              };
            } else {
              reg.eventDetails = { customEventId: reg.eventId, title: "Unknown", description: "N/A" };
            }
          } catch (e) {
            reg.eventDetails = { customEventId: reg.eventId, title: "Error", description: "N/A" };
          }
        } else {
          reg.eventDetails = { customEventId: "N/A", title: "N/A", description: "N/A" };
        }
        return reg;
      })
    );

    // ✅ Send response with debugging info
    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
      spocEmail: spocDoc.emailId,   // 👈 For frontend debug
      spocId: spocDoc._id.toString()
    });
  } catch (error) {
    console.error("❌ Error fetching registrations for SPOC:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending Approval"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const spocUser = req.user;
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found." });
    }

    // Build list of authorized SPOC IDs
    const userId = spocUser._id || spocUser.id || spocUser.userId;
    const spocIds = userId ? [userId] : [];

    const spocDoc = await Spoc.findOne({ emailId: spocUser.email });
    if (spocDoc && spocDoc._id) spocIds.push(spocDoc._id);

    // Authorization: compare as strings to avoid type issues
    const isAuthorized = registration.departmentMentor &&
      spocIds.some(sid => sid && sid.toString() === registration.departmentMentor.toString());

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this registration." });
    }

    const updated = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: `Registration ${status.toLowerCase()} successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating registration status:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // 1. Validate Input
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // 2. Find SPOC user in database
    const spoc = await Spoc.findById(id);
    if (!spoc) {
      return res.status(404).json({
        success: false,
        message: "SPOC account not found.",
      });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Update password and save
    spoc.password = hashedPassword;
    await spoc.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Error updating SPOC password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating password.",
      error: error.message,
    });
  }
};

/**
 * Send welcome email to a newly registered SPOC
 * POST /api/admin/spoc/send-welcome-email
 */
export const sendWelcomeEmail = async (req, res) => {
  try {
    const { firstName, lastName, emailId, department, phoneNo } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !emailId || !department) {
      return res.status(400).json({
        success: false,
        message: 'Missing required SPOC details: firstName, lastName, emailId, department.',
      });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const defaultPassword = '12345678';

    // Build email HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to KSRCE NEO Event Hub</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f1f5f9; }
          .header h1 { color: #0b1a2e; font-size: 24px; margin: 0; }
          .header span { color: #f59e0b; }
          .content { padding: 24px 0; color: #1e293b; line-height: 1.7; }
          .content p { margin: 12px 0; }
          .highlight { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 14px; display: inline-block; }
          .credentials { background: #fef9e7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px; }
          .btn { display: inline-block; background: #0b1a2e; color: #f59e0b; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .footer { text-align: center; padding: 16px 0; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KSRCE <span>NEO</span> Event Hub</h1>
            <p style="color: #64748b; margin: 4px 0 0;">Welcome to the SPOC Portal</p>
          </div>
          <div class="content">
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>We are pleased to inform you that you have been registered as a <strong>Single Point of Contact (SPOC)</strong> for the <strong>${department}</strong> department at the KSRCE NEO Event Hub.</p>
            <p>Your role is vital – you will oversee and manage event registrations, student submissions, and departmental engagement within the platform.</p>
            <div class="credentials">
              <p><strong>🔑 Your Login Credentials:</strong></p>
              <p><strong>Username:</strong> ${emailId}</p>
              <p><strong>Default Password:</strong> <span class="highlight">${defaultPassword}</span></p>
            </div>
            <p><strong>Important:</strong> After your first login, you <strong>must</strong> change your password. To do so:</p>
            <ol style="margin: 8px 0 12px 20px;">
              <li>Click on your profile icon (top‑right corner).</li>
              <li>Select <strong>Manage Profile</strong>.</li>
              <li>Scroll to the <strong>Update Password</strong> section.</li>
              <li>Set a new, secure password.</li>
            </ol>
            <p>You can access the portal at: <a href="https://your-portal-url.com" target="_blank">https://your-portal-url.com</a></p>
            <p style="margin-top: 20px;">Welcome aboard! We look forward to your contributions.</p>
            <p>Regards,<br><strong>KSRCE NEO Event Hub Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} KSRCE NEO Event Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      from: `KSRCE NEO Portal <${process.env.EMAIL_USER}>`,
      to: emailId,
      subject: 'Welcome to KSRCE NEO Event Hub – SPOC Account Created',
      html,
    });

    if (!result.success) {
      console.error('Email sending failed:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send welcome email. Please check email configuration.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully to ' + emailId,
    });
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending email.',
    });
  }
};