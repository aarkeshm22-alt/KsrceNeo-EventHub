import express from "express";
import { upload } from "../middleware/upload.js";
import { createEvent, getEvents, updateEvent, deleteEvent } from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/create", upload.single("image"), createEvent);
router.put("/update/:id", upload.single("image"), updateEvent);
router.delete("/:id", deleteEvent);

export default router;