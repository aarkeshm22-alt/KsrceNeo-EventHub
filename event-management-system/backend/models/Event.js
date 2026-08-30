import mongoose from "mongoose";
import Counter from "./Counter.js";

const EventSchema = new mongoose.Schema(
  {
    eventId: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    eventDate: { type: Date, required: true },
    image: { type: String, default: "" },
    registrationLink: { type: String, required: true, trim: true },
    registrationOpenDate: {
      type: Date,
      required: [true, "Registration open date is required."]
    },
    registrationCloseDate: {
      type: Date,
      required: [true, "Registration close date is required."]
    },
    // ⬇️ NEW: Event levels (rounds) stored as an array of strings
    levels: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    // 🔒 Schema‑level validation – ensures close > open
    validate: {
      validator: function () {
        if (this.registrationOpenDate && this.registrationCloseDate) {
          return this.registrationCloseDate > this.registrationOpenDate;
        }
        return true;
      },
      message: "Registration close date must be after the open date."
    }
  }
);

// ========================================================
// ⚡ AUTO‑INCREMENT PRE‑SAVE MIDDLEWARE (unchanged)
// ========================================================
EventSchema.pre("save", async function () {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "event_id_sequence" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );
      const formattedSequence = String(counter.seq).padStart(2, "0");
      this.eventId = `EV_${formattedSequence}`;
    } catch (error) {
      throw error;
    }
  }
});
 
export default mongoose.model("Event", EventSchema, "events");