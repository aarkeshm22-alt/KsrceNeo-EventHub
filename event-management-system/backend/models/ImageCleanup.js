import mongoose from "mongoose";
import Event from "./Event.js";

const ImageCleanupSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  expireAt: {
    type: Date,
    required: true
  }
});

// Create a native MongoDB TTL index on the expireAt field
ImageCleanupSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Middleware Hook: Right before MongoDB drops this document, clear the Event image field
ImageCleanupSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    await Event.findByIdAndUpdate(this.eventId, { $set: { image: "" } });
    console.log(`🧹 Automated Lifecycle: Cleared image field for Event ID: ${this.eventId}`);
    next();
  } catch (error) {
    console.error("Failed to run image field automation sweep:", error);
    next(error);
  }
});

// Fallback for query-based deletions (like MongoDB's background TTL engine runner)
ImageCleanupSchema.pre("findOneAndDelete", async function (next) {
  try {
    const docToDel = await this.model.findOne(this.getQuery());
    if (docToDel) {
      await Event.findByIdAndUpdate(docToDel.eventId, { $set: { image: "" } });
      console.log(`🧹 Automated Lifecycle (Engine): Cleared image field for Event ID: ${docToDel.eventId}`);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const ImageCleanup = mongoose.model("ImageCleanup", ImageCleanupSchema);
export default ImageCleanup;