import express from "express";
import { getAllUsers, getUserProfile, getMentorByDepartment } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🚨 Map to GET /api/users 
router.get("/", getAllUsers);

// Map to GET /api/users/profile/:id
router.get("/profile/:id", protect, getUserProfile);
router.get("/mentor-lookup", getMentorByDepartment);

export default router;