import User from "../models/User.js";

// ========================================================
// NEW: Fetch all users for the StudentManagement Table
// ========================================================
export const getAllUsers = async (req, res) => {
  try {
    // Get all users, omit passwords, sort by newest
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed fetching user tracking collections.", 
      error: error.message 
    });
  }
};

// ========================================================
// KEEP: Fetch single user profile by ID conditionally
// ========================================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User profile record not found." });
    }

    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      mobile: user.mobile,
      createdAt: user.createdAt,
      // Pass raw student values to root so frontend destructs cleanly
      regNo: user.regNo,
      year: user.year,
      section: user.section,
      firstName: user.firstName,
      lastName: user.lastName
    };

    res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    res.status(500).json({ message: "Failed parsing profile.", error: error.message });
  }
};

// ========================================================
// 🔍 LOOKUP MENTOR BY DEPARTMENT (GET)
// ========================================================
export const getMentorByDepartment = async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department parameter query is required."
      });
    }

    // Find a user with role 'mentor' inside the requested department
    const matchedMentor = await User.findOne({
      role: { $regex: /^mentor$/i },
      department: { $regex: new RegExp(`^${department}$`, "i") }
    }).select("name email department"); // only select fields you want public

    if (!matchedMentor) {
      return res.status(404).json({
        success: false,
        message: `No mentor found registered under ${department.toUpperCase()}`
      });
    }

    res.status(200).json({
      success: true,
      data: matchedMentor
    });
  } catch (error) {
    console.error("❌ MENTOR LOOKUP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server failed looking up department faculty details.",
      error: error.message
    });
  }
};