import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // 👈 Added for path resolution
import { fileURLToPath } from "url"; // 👈 Added for ESM directory tracking
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";    
import registrationRoutes from "./routes/registrationRoutes.js"; // Optional: If you have registration routes
import spocRoutes from "./routes/spocRoutes.js"; 

dotenv.config();

connectDB();

const app = express();

// --- ESM DIRNAME CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ========================================================
// 🚨 THE FIX: SERVE UPLOADS FOLDER STATICALLY
// ========================================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Core API Tracks
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/registrations", registrationRoutes); 
app.use("/api", spocRoutes); // SPOC routes under /api/spocs

app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Hackathon ESM Core API Active." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🖥️  Server initialized in ESM execution pipeline on port ${PORT}`);
});  