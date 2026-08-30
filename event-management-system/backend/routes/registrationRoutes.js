import express from "express";
import {
  submitRegistration,
  getMyRegistrations,
  getRegistrationsByEvent,
  getDepartmentRequests,        // 👈 Add import
  updateRegistrationStatus,     // 👈 Add import
  getAllRegistrations  ,
  getViewSubmissions, 
  updateRegistrationRemarks,
  getPersonalMentorRequests,    // 👈 Add import
  getDistinctLevels              // 👈 Add import
} from "../controllers/registrationController.js";

const router = express.Router();

router.post("/submit", submitRegistration);
router.get("/my-submissions", getMyRegistrations);
router.get("/event/:eventId", getRegistrationsByEvent);
router.patch("/:id/remarks", updateRegistrationRemarks);
router.get("/personal-mentor-requests", getPersonalMentorRequests);
router.get("/distinct-levels", getDistinctLevels);

// 🌟 Add these two lines to handle the Mentor view frontend calls safely:
router.get("/department-requests", getDepartmentRequests);
router.patch("/update-status/:id", updateRegistrationStatus);
router.get("/view-submissions", getViewSubmissions); // 👈 Add this line
router.get("/", getAllRegistrations); // 👈 Add this line

export default router;