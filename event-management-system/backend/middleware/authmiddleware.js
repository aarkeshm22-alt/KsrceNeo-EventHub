// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware: Protect routes – verifies JWT token and attaches user data to req.user
 * Supports all roles: admin, coadmin, student, mentor, spoc
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded user data to req.user (no database lookup needed)
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        department: decoded.department || null,
        // Include any other fields stored in the token
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Authorization failed. Token verification timeout." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token tracking payload missing." });
  }
};

/**
 * Middleware: Role-based authorization
 * @param  {...string} roles - Allowed roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden. User security clearance verification missing." });
    }
    next();
  };
}; 