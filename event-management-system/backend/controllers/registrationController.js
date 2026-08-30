import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Spoc from "../models/Spoc.js";

// ========================================================
// 📩 PIPELINE 1: SUBMIT NEW REGISTRATION (POST)
// ========================================================
export const submitRegistration = async (req, res) => {
  try {
    const {
      eventId,
      createdBy,
      teamName,
      projectTitle,
      projectDomain,
      leadName,
      leadPhone,
      leadEmail,
      year,
      section,
      members,
      personalMentor,
      departmentMentor,
    } = req.body;

    if (!eventId || !createdBy || !teamName || !projectTitle || !projectDomain ||
        !leadName || !leadPhone || !leadEmail || !year || !section ||
        !members || !personalMentor) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters. All registration track fields are required.",
      });
    }

    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: "Members must be an array of objects.",
      });
    }

    const cleanedMembers = members.filter((m) =>
      m && typeof m === "object" &&
      m.name?.trim() && m.regNo?.trim() && m.department?.trim()
    );

    if (cleanedMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Submission rejected. You must provide at least one valid team member with name, registration number, and department.",
      });
    }

    const studentProfile = await User.findById(createdBy);
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: `Submission rejected: The profile account ID '${createdBy}' does not exist.`,
      });
    }

    let finalDepartmentMentor = departmentMentor;
    if (!finalDepartmentMentor || !mongoose.Types.ObjectId.isValid(finalDepartmentMentor) || finalDepartmentMentor.length !== 24) {
      finalDepartmentMentor = createdBy;
    }

    const newRegistration = await Registration.create({
      eventId,
      createdBy,
      teamName,
      projectTitle,
      projectDomain,
      leadName,
      leadPhone,
      leadEmail,
      year,
      section,
      members: cleanedMembers,
      departmentMentor: finalDepartmentMentor,
      personalMentor,
      status: "Pending Approval",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      createdDate: newRegistration.createdAt,
      data: newRegistration,
    });
  } catch (error) {
    console.error("❌ BACKEND REGISTRATION CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal framework error. Form submission trace halted.",
      error: error.message,
    });
  }
};

// ========================================================
// 🎓 PIPELINE 2: FETCH PERSONAL STUDENT SUBMISSIONS (GET)
// ========================================================
export const getMyRegistrations = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.query.userId;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Identification error. Authenticated 'userId' context is required to fetch applications.",
      });
    }

    const registrations = await Registration.find({ createdBy: currentUserId })
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      registrations.map(async (registration) => {
        let eventDetails = {
          customEventId: registration.eventId || "N/A",
          title: "Unknown Event",
          description: "N/A",
        };
        if (registration.eventId) {
          try {
            const event = await Event.findOne({
              $or: [
                { eventId: String(registration.eventId) },
                ...(mongoose.isValidObjectId(registration.eventId)
                  ? [{ _id: registration.eventId }]
                  : []),
              ],
            }).select("eventId title description").lean();
            if (event) {
              eventDetails = {
                customEventId: event.eventId || registration.eventId,
                title: event.title,
                description: event.description || "N/A",
              };
            }
          } catch (e) {
            // ignore
          }
        }
        registration.eventDetails = eventDetails;

        const createdByUser = await User.findById(registration.createdBy)
          .select("name email studentId")
          .lean();
        if (createdByUser) {
          registration.createdBy = createdByUser;
        }

        let mentorInfo = null;
        if (registration.departmentMentor && mongoose.isValidObjectId(registration.departmentMentor)) {
          let mentor = await User.findById(registration.departmentMentor)
            .select("name email role department")
            .lean();
          if (mentor) {
            mentorInfo = {
              _id: mentor._id,
              name: mentor.name,
              email: mentor.email,
            };
          } else {
            let spoc = await Spoc.findById(registration.departmentMentor)
              .select("firstName lastName emailId")
              .lean();
            if (spoc) {
              const fullName = spoc.firstName + (spoc.lastName ? " " + spoc.lastName : "");
              mentorInfo = {
                _id: spoc._id,
                name: fullName || "SPOC",
                email: spoc.emailId || "",
              };
            }
          }
        }
        registration.departmentMentor = mentorInfo;

        return registration;
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error("❌ BACKEND GET MY REGISTRATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server failed to look up your application histories.",
      error: error.message,
    });
  }
};

// ========================================================
// 💡 PIPELINE 3: FETCH REGISTRATIONS BY EVENT ID (GET)
// ========================================================
export const getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const records = await Registration.find({ eventId })
      .populate("createdBy", "name email")
      .populate("departmentMentor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("❌ BACKEND GET REGISTRATIONS BY EVENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to pull registration pipeline logs.",
      error: error.message,
    });
  }
};

// ========================================================
// 🏛️ PIPELINE 4: FETCH DEPARTMENT REQUESTS FOR MENTOR (GET)
// ========================================================
export const getDepartmentRequests = async (req, res) => {
  try {
    const { department } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Filtering error. A target 'department' string parameter is required.",
      });
    }

    const requests = await Registration.find()
      .populate({
        path: "createdBy",
        match: { department: department },
        select: "name email department studentId",
      })
      .populate("departmentMentor", "name email")
      .sort({ createdAt: -1 });

    const filteredRequests = requests.filter((item) => item.createdBy !== null);

    res.status(200).json({
      success: true,
      count: filteredRequests.length,
      data: filteredRequests,
    });
  } catch (error) {
    console.error("❌ BACKEND GET DEPARTMENT REQUESTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load matching department submission trees.",
      error: error.message,
    });
  }
};

// ========================================================
// 📝 PIPELINE 5: UPDATE APPLICATION APPROVAL STATUS (PATCH)
// ========================================================
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending Approval"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Validation failure. Provided status string configuration state is unmapped.",
      });
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email department")
      .populate("departmentMentor", "name email");

    if (!updatedRegistration) {
      return res.status(404).json({
        success: false,
        message: "Update trace halted. Relational registration log ID not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Application submission has been successfully marked as '${status}'!`,
      data: updatedRegistration,
    });
  } catch (error) {
    console.error("❌ BACKEND UPDATE REGISTRATION STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server failed to save updated state status block.",
      error: error.message,
    });
  }
};

// ========================================================
// 📊 PIPELINE 6: GET ALL REGISTRATIONS (AGGREGATED) – UPDATED
// ========================================================
export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "eventId",
          as: "eventDetails",
        },
      },
      {
        $unwind: {
          path: "$eventDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    // ✅ Populate createdBy with department
    const populatedData = await Registration.populate(registrations, {
      path: "createdBy",
      select: "name email department title", // ← added department
    });

    res.status(200).json(populatedData);
  } catch (error) {
    console.error("❌ Aggregation failed pipeline breakdown:", error);
    res.status(500).json({
      success: false,
      message: "Aggregation failed",
      error: error.message,
    });
  }
};

// ========================================================
// 🔍 PIPELINE 7: FETCH VIEW SUBMISSIONS FOR ADMIN TABLE (FIXED)
// ========================================================
export const getViewSubmissions = async (req, res) => {
  try {
    const { status, year, search } = req.query;
    let queryCondition = {};

    if (status && status !== "All") {
      queryCondition.status = status === "Pending" ? "Pending Approval" : status;
    }

    if (year && year !== "All") {
      queryCondition.year = year;
    }

    if (search) {
      queryCondition.$or = [
        { teamName: { $regex: search, $options: "i" } },
        { leadName: { $regex: search, $options: "i" } },
        { section: { $regex: search, $options: "i" } },
        { projectTitle: { $regex: search, $options: "i" } },
      ];
    }

    const rawSubmissions = await Registration.find(queryCondition)
      .populate({
        path: "createdBy",
        select: "name email studentId department",
      })
      .sort({ createdAt: -1 })
      .lean();

    const submissions = await Promise.all(
      rawSubmissions.map(async (submission) => {
        let mentorInfo = null;
        if (submission.departmentMentor && mongoose.isValidObjectId(submission.departmentMentor)) {
          let mentor = await User.findById(submission.departmentMentor)
            .select("name email role department")
            .lean();
          if (mentor) {
            mentorInfo = {
              _id: mentor._id,
              name: mentor.name,
              email: mentor.email,
              role: mentor.role,
            };
          } else {
            let spoc = await Spoc.findById(submission.departmentMentor)
              .select("firstName lastName emailId")
              .lean();
            if (spoc) {
              const fullName = spoc.firstName + (spoc.lastName ? " " + spoc.lastName : "");
              mentorInfo = {
                _id: spoc._id,
                name: fullName || "SPOC",
                email: spoc.emailId || "",
                role: "spoc",
              };
            }
          }
        }
        submission.departmentMentor = mentorInfo;

        const rawEventIdentifier = submission.eventId;
        if (rawEventIdentifier) {
          const foundEvent = await mongoose
            .model("Event")
            .findOne({
              $or: [
                { eventId: String(rawEventIdentifier) },
                ...(mongoose.Types.ObjectId.isValid(rawEventIdentifier)
                  ? [{ _id: rawEventIdentifier }]
                  : []),
              ],
            })
            .select("eventId title description")
            .lean();

          if (foundEvent) {
            submission.eventId = {
              customEventId: foundEvent.eventId || "EV_XX",
              eventName: foundEvent.title,
              description: foundEvent.description || "No description provided for this event.",
            };
          } else {
            submission.eventId = {
              customEventId: String(rawEventIdentifier),
              eventName: "Unknown / Legacy Event",
              description: "N/A",
            };
          }
        } else {
          submission.eventId = {
            customEventId: "N/A",
            eventName: "Unspecified Event",
            description: "N/A",
          };
        }

        return submission;
      })
    );

    res.status(200).json(submissions);
  } catch (error) {
    console.error("❌ Error inside getViewSubmissions controller:", error);
    res.status(500).json({ message: "Failed to fetch registrations.", error: error.message });
  }
};

// ========================================================
// 📝 PIPELINE 8: UPDATE REGISTRATION REMARKS (PATCH)
// ========================================================
export const updateRegistrationRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const updated = await Registration.findByIdAndUpdate(
      id,
      { remarks },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Remarks updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating remarks:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating remarks.",
      error: error.message,
    });
  }
};

// ========================================================
// 👨‍🏫 PIPELINE 9: FETCH REQUESTS FOR PERSONAL MENTOR (GET)
// ========================================================
export const getPersonalMentorRequests = async (req, res) => {
  try {
    const { mentorName } = req.query;

    if (!mentorName) {
      return res.status(400).json({
        success: false,
        message: "Missing query parameter: mentorName",
      });
    }

    const rawSubmissions = await Registration.find({
      personalMentor: { $regex: new RegExp(`^${mentorName.trim()}$`, "i") },
    })
      .populate("createdBy", "name email department")
      .sort({ createdAt: -1 })
      .lean();

    const submissions = await Promise.all(
      rawSubmissions.map(async (submission) => {
        let mentorInfo = null;
        if (submission.departmentMentor && mongoose.isValidObjectId(submission.departmentMentor)) {
          let mentor = await User.findById(submission.departmentMentor)
            .select("name email role department")
            .lean();
          if (mentor) {
            mentorInfo = {
              _id: mentor._id,
              name: mentor.name,
              email: mentor.email,
              role: mentor.role,
            };
          } else {
            let spoc = await Spoc.findById(submission.departmentMentor)
              .select("firstName lastName emailId")
              .lean();
            if (spoc) {
              const fullName = spoc.firstName + (spoc.lastName ? " " + spoc.lastName : "");
              mentorInfo = {
                _id: spoc._id,
                name: fullName || "SPOC",
                email: spoc.emailId || "",
                role: "spoc",
              };
            }
          }
        }
        submission.departmentMentor = mentorInfo;

        const rawEventIdentifier = submission.eventId;
        if (rawEventIdentifier) {
          const foundEvent = await mongoose
            .model("Event")
            .findOne({
              $or: [
                { eventId: String(rawEventIdentifier) },
                ...(mongoose.Types.ObjectId.isValid(rawEventIdentifier)
                  ? [{ _id: rawEventIdentifier }]
                  : []),
              ],
            })
            .select("eventId title description")
            .lean();

          if (foundEvent) {
            submission.eventId = {
              customEventId: foundEvent.eventId || "EV_XX",
              eventName: foundEvent.title,
              description: foundEvent.description || "No description provided for this event.",
            };
          } else {
            submission.eventId = {
              customEventId: String(rawEventIdentifier),
              eventName: "Unknown / Legacy Event",
              description: "N/A",
            };
          }
        } else {
          submission.eventId = {
            customEventId: "N/A",
            eventName: "Unspecified Event",
            description: "N/A",
          };
        }

        return submission;
      })
    );

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("❌ Error fetching personal mentor requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching personal mentor requests.",
      error: error.message,
    });
  }
};

export const getDistinctLevels = async (req, res) => {
  try {
    const events = await Event.find({}, 'levels');
    const levelSet = new Set();
    events.forEach(event => {
      if (event.levels && Array.isArray(event.levels)) {
        event.levels.forEach(level => {
          if (level && level.trim()) levelSet.add(level.trim());
        });
      }
    });
    const distinctLevels = Array.from(levelSet).sort();
    res.json(distinctLevels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};