import Event from "../models/Event.js";
import ImageCleanup from "../models/ImageCleanup.js";
import Counter from "../models/Counter.js";
import fs from "fs";
import path from "path";

const deleteLocalFile = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("/uploads/")) return;
  try {
    const filename = imageUrl.split("/uploads/")[1];
    const fullPath = path.join(process.cwd(), "uploads", filename);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Successfully purged asset: ${filename}`);
    }
  } catch (err) {
    console.error("File parsing cleanup stream trace bypassed safety limits:", err.message);
  }
};

// ============================================================
// CREATE EVENT – handles levels
// ============================================================
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      eventDate,
      registrationLink,
      registrationOpenDate,
      registrationCloseDate,
      levels, // ← new: JSON string from FormData
    } = req.body;

    if (!title || !description || !location || !eventDate || !registrationLink ||
        !registrationOpenDate || !registrationCloseDate) {
      return res.status(400).json({
        message: "Please fill in all required configuration layout tracks (including registration dates)."
      });
    }

    const openDate = new Date(registrationOpenDate);
    const closeDate = new Date(registrationCloseDate);
    if (closeDate <= openDate) {
      return res.status(400).json({
        message: "Registration close date must be after the open date."
      });
    }

    // ✅ Parse levels (if provided) – default to empty array
    let parsedLevels = [];
    if (levels) {
      try {
        parsedLevels = JSON.parse(levels);
        if (!Array.isArray(parsedLevels)) parsedLevels = [];
      } catch (e) {
        parsedLevels = [];
      }
    }

    let imagePath = "";
    if (req.file) {
      imagePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } else {
      imagePath = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";
    }

    const event = new Event({
      title,
      description,
      location,
      eventDate: new Date(eventDate),
      image: imagePath,
      registrationLink,
      registrationOpenDate: openDate,
      registrationCloseDate: closeDate,
      levels: parsedLevels, // ← store levels
    });

    await event.save();

    const parsedEventDate = new Date(eventDate);
    const purgeDate = new Date(parsedEventDate);
    purgeDate.setDate(purgeDate.getDate() + 7);
    purgeDate.setHours(23, 59, 59, 999);

    await ImageCleanup.create({
      eventId: event._id,
      expireAt: purgeDate
    });

    res.status(201).json({
      success: true,
      data: event,
      message: "Event deployed, image lifecycle cleanup active."
    });
  } catch (error) {
    console.error("❌ BACKEND EXCEPTION CAUGHT INSIDE createEvent:", error);
    res.status(500).json({
      message: "Server event engine compilation failure.",
      error: error.message
    });
  }
};

// ============================================================
// FETCH ALL EVENTS (unchanged)
// ============================================================
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Failed fetching event collections database.",
      error: error.message
    });
  }
};

// ============================================================
// UPDATE EVENT – handles levels
// ============================================================
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      eventDate,
      registrationLink,
      registrationOpenDate,
      registrationCloseDate,
      levels, // ← new: JSON string from FormData
    } = req.body;

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        message: "Target modification record event layout track not found."
      });
    }

    if (registrationOpenDate && registrationCloseDate) {
      const openDate = new Date(registrationOpenDate);
      const closeDate = new Date(registrationCloseDate);
      if (closeDate <= openDate) {
        return res.status(400).json({
          message: "Registration close date must be after the open date."
        });
      }
    }

    // ✅ Parse levels (if provided)
    let parsedLevels = existingEvent.levels || [];
    if (levels !== undefined) {
      try {
        parsedLevels = JSON.parse(levels);
        if (!Array.isArray(parsedLevels)) parsedLevels = [];
      } catch (e) {
        parsedLevels = [];
      }
    }

    const updateFields = {
      title,
      description,
      location,
      registrationLink,
      levels: parsedLevels, // ← update levels
    };

    if (eventDate) updateFields.eventDate = new Date(eventDate);
    if (registrationOpenDate) updateFields.registrationOpenDate = new Date(registrationOpenDate);
    if (registrationCloseDate) updateFields.registrationCloseDate = new Date(registrationCloseDate);

    if (req.file) {
      deleteLocalFile(existingEvent.image);
      updateFields.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateFields, { new: true });

    if (eventDate) {
      const parsedEventDate = new Date(eventDate);
      const purgeDate = new Date(parsedEventDate);
      purgeDate.setDate(purgeDate.getDate() + 7);
      purgeDate.setHours(23, 59, 59, 999);

      await ImageCleanup.findOneAndUpdate(
        { eventId: id },
        { expireAt: purgeDate },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      data: updatedEvent,
      message: "Track parameters updated successfully."
    });
  } catch (error) {
    console.error("❌ BACKEND EXCEPTION CAUGHT INSIDE updateEvent:", error);
    res.status(500).json({
      message: "Track mutation parsing structural workflow processing failure.",
      error: error.message
    });
  }
};

// ============================================================
// DELETE EVENT – with counter reset when no events remain
// ============================================================
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        message: "Target track reference missing from registry logs index."
      });
    }

    deleteLocalFile(event.image);

    await Event.findByIdAndDelete(req.params.id);
    await ImageCleanup.deleteOne({ eventId: req.params.id });

    // ✅ Check if there are any events left; if none, reset the counter to 0
    const remainingCount = await Event.countDocuments();
    if (remainingCount === 0) {
      await Counter.findOneAndUpdate(
        { id: "event_id_sequence" },
        { seq: 0 },
        { upsert: true }
      );
      console.log("🔄 All events deleted – sequence counter reset to 0.");
    }

    res.status(200).json({
      message: "Event track dropped from database successfully."
    });
  } catch (error) {
    console.error("❌ BACKEND EXCEPTION CAUGHT INSIDE deleteEvent:", error);
    res.status(500).json({
      message: "Failed processing server delete parameter trace.",
      error: error.message
    });
  }
};