import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ["student", "mentor", "admin", "coadmin"], 
      required: true 
    },
    department: { 
      type: String, 
      required: true 
    },
    mobile: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String,
      required: true // Make sure this is required so student registrations save instantly
    },

    // Student Fields (Must be optional/sparse so they don't break Mentors or Admin profiles)
    regNo: { 
      type: String, 
      unique: true, 
      sparse: true,
      trim: true
    },
    year: { type: String },
    section: { type: String },

    // Mentor Fields (Optional fields)
    firstName: { type: String },
    lastName: { type: String }
  },
  { timestamps: true }
);

// Locate this section inside your backend/models/User.js file:
UserSchema.pre("save", async function () {
  // If password isn't modified, skip hashing completely
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw new Error("Password encryption layer breakdown: " + err.message);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;