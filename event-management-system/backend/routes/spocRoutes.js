import express from "express";
import { 
  addSpoc, 
  getAllSpocs, 
  getSpocById, 
  updateSpoc, 
  deleteSpoc,
  spocLogin,
  getSpocProfile,
  getSpocByDepartment,
  getStudentsByDepartment,
  getRegistrationsForSpoc,
  updateRegistrationStatus,
  updatePassword,
  sendWelcomeEmail
} from "../controllers/spocController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================================================
// CUSTOM MIDDLEWARE: Bypass token ONLY for Admin & Co-Admin
// ================================================================
const smartProtect = (req, res, next) => {
  // Extract role from custom header, query param, or body
  const role = req.headers["x-user-role"] || req.query.role || req.body?.role;
  const normalizedRole = role ? String(role).toLowerCase() : "";

  // If the role is admin or coadmin, bypass JWT token verification
  if (normalizedRole === "admin" || normalizedRole === "coadmin") {
    req.user = { role: normalizedRole }; // Attach mock user object
    return next();
  }

  // For spoc, student, mentor, or unauthenticated users -> enforce Token Verification
  return protect(req, res, next);
};

// ================================================================
// 1. PUBLIC ROUTES
// ================================================================
router.post("/auth/spoc-login", spocLogin);
router.get("/by-department", getSpocByDepartment);

// Apply smart protection from here down
router.use(smartProtect);

// ================================================================
// 2. PRIVATE ROUTES – SPOC, STUDENT, MENTOR (Token Required)
// ================================================================

// ---- SPOC Only routes ----
router.get("/spoc/profile", authorizeRoles("spoc"), getSpocProfile);

// ---- Routes accessible by SPOC, Admin, Co-admin ----
router.get("/students", authorizeRoles("spoc", "admin", "coadmin"), getStudentsByDepartment);
router.get("/registrations", authorizeRoles("spoc", "admin", "coadmin"), getRegistrationsForSpoc);
router.patch("/registrations/:id/status", updateRegistrationStatus);

// ================================================================
// 3. PRIVATE ROUTES – ADMIN / CO-ADMIN ONLY (Token Bypassed)
// ================================================================
router.post("/admin/spoc", addSpoc);
router.get("/admin/spoc", getAllSpocs);
router.get("/admin/spoc/profile/:id", getSpocById);
router.put("/admin/spoc/update/:id", updateSpoc);
router.delete("/admin/spoc/delete/:id", deleteSpoc);
router.patch("/admin/spoc/update-password/:id", protect, updatePassword);
router.post('/admin/spoc/send-welcome-email', sendWelcomeEmail);

export default router;