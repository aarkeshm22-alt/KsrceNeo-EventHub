import mongoose from "mongoose";

// Sub-schema for each team member
const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    regNo: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
  },
  { _id: false } // prevents auto-generating an _id for each member
);

const RegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      ref: "Event",
      required: true,
    },
    // Tracks the user who submitted the application
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamName: { type: String, required: true, trim: true },
    projectTitle: { type: String, required: true, trim: true },
    projectDomain: { type: String, required: true, trim: true },

    // Team Lead Details
    leadName: { type: String, required: true, trim: true },
    leadPhone: { type: String, required: true, trim: true },
    leadEmail: { type: String, required: true, trim: true },
    year: { type: String, required: true, enum: ["I", "II", "III", "IV"] },
    section: { type: String, required: true, enum: ["A", "B", "C", "D"] },

    // 👇 UPDATED: members as an array of objects
    members: { type: [MemberSchema], required: true, default: [] },

    // Mentor Assignments
    departmentMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    personalMentor: { type: String, required: true, trim: true },

    // Status tracking
    status: {
      type: String,
      required: true,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
     remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

const Registration = mongoose.model("Registration", RegistrationSchema);
export default Registration;