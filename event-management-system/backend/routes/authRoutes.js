import { registerStudent, registerMentor, loginUser, getUserProfile, forgotPassword, 
sendOTP, verifyOTPEndpoint, resendOTP} from "../controllers/authController.js";

import express from "express";
const router = express.Router();

// Assign distinct route patterns for separate registration payloads
router.post("/register/student", registerStudent);
router.post("/register/mentor", registerMentor);
router.post("/login", loginUser);
router.get("/profile/:id", getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPEndpoint);
router.post('/resend-otp', resendOTP);

export default router;