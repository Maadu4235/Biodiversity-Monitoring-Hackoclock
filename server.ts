import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import Database from "better-sqlite3";
import { Sighting, AnimalType, SightingStatus, User } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database("biodiversity.db");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT,
    isApproved INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sightings (
    id TEXT PRIMARY KEY,
    imagePath TEXT,
    animalType TEXT,
    detectedSpecies TEXT,
    confidenceScore REAL,
    isDanger INTEGER,
    status TEXT,
    timestamp TEXT,
    location TEXT,
    userId TEXT
  );
`);

// Migration: Check if userId column exists, if not, add it
try {
  const tableInfo = db.prepare("PRAGMA table_info(sightings)").all() as any[];
  const hasUserId = tableInfo.some(col => col.name === 'userId');
  if (!hasUserId) {
    db.prepare("ALTER TABLE sightings ADD COLUMN userId TEXT").run();
    console.log("Migration: Added userId column to sightings table");
  }
} catch (e) {
  console.error("Migration failed", e);
}

// Create uploads directory
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use("/uploads", express.static(uploadDir));

  // Seed Admin if not exists
  const adminById = db.prepare("SELECT * FROM users WHERE id = ?").get("1") as any;
  if (!adminById) {
    db.prepare("INSERT INTO users (id, email, password, name, role, isApproved) VALUES (?, ?, ?, ?, ?, ?)")
      .run("1", "officer@silva.gov", "password123", "Marcus Thorne", "Officer", 1);
  } else if (adminById.email !== "officer@silva.gov") {
    // Update existing admin email to reflect branding
    db.prepare("UPDATE users SET email = ? WHERE id = ?").run("officer@silva.gov", "1");
  }

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.role === 'Officer' && user.isApproved === 0) {
      return res.status(403).json({ error: "Officer account is pending administrative approval." });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      user: { ...userWithoutPassword, isApproved: user.isApproved === 1 }, 
      token: "mock-jwt-token" 
    });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, name, role } = req.body;
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const isApproved = role === 'Officer' ? 0 : 1;
      db.prepare("INSERT INTO users (id, email, password, name, role, isApproved) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, email, password, name, role || 'User', isApproved);
      
      if (role === 'Officer') {
        return res.json({ message: "Officer account created. Awaiting administrative approval.", pending: true });
      }

      res.json({ 
        user: { id, email, name, role: role || 'User', isApproved: true }, 
        token: "mock-jwt-token" 
      });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  // Admin Officer Management
  app.get("/api/admin/officers", (req, res) => {
    const officers = db.prepare("SELECT id, email, name, role, isApproved FROM users WHERE role = 'Officer'").all();
    res.json(officers.map((o: any) => ({ ...o, isApproved: o.isApproved === 1 })));
  });

  app.post("/api/admin/officers/:id/approve", (req, res) => {
    db.prepare("UPDATE users SET isApproved = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // API Routes
  app.get("/api/sightings", (req, res) => {
    const rows = db.prepare("SELECT * FROM sightings ORDER BY timestamp DESC").all() as any[];
    const sightings = rows.map(r => ({
      ...r,
      images: [r.imagePath], 
      isDanger: r.isDanger === 1
    }));
    res.json(sightings);
  });

  app.get("/api/sightings/user/:userId", (req, res) => {
    const rows = db.prepare("SELECT * FROM sightings WHERE userId = ? ORDER BY timestamp DESC").all(req.params.userId) as any[];
    const sightings = rows.map(r => ({
      ...r,
      images: [r.imagePath],
      isDanger: r.isDanger === 1
    }));
    res.json(sightings);
  });

  app.get("/api/alerts/latest", (req, res) => {
    const row = db.prepare("SELECT * FROM sightings WHERE isDanger = 1 AND status = 'Approved' ORDER BY timestamp DESC LIMIT 1").get() as any;
    if (!row) return res.json(null);
    res.json({
      ...row,
      images: [row.imagePath],
      isDanger: true
    });
  });

  app.post("/api/upload", upload.single("image"), (req, res) => {
    const { animalType, location, userId } = req.body;
    const file = (req as any).file;
    
    if (!file || !location) {
      return res.status(400).json({ error: "Missing image or location" });
    }

    // Simple Detection Factor: Filename
    const originalName = file.originalname.toLowerCase();
    let detectedSpecies = animalType || "Unknown";
    
    if (originalName.includes("tiger")) detectedSpecies = "Tiger";
    else if (originalName.includes("elephant")) detectedSpecies = "Elephant";
    else if (originalName.includes("deer")) detectedSpecies = "Deer";
    else if (originalName.includes("leopard")) detectedSpecies = "Leopard";
    else if (originalName.includes("human")) detectedSpecies = "Human";

    const id = Math.random().toString(36).substr(2, 9);
    const imagePath = `/uploads/${file.filename}`;
    const confidenceScore = 100;
    const isDanger = ['Tiger', 'Leopard', 'Elephant'].includes(detectedSpecies) ? 1 : 0;
    const status = 'Pending';
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO sightings (id, imagePath, animalType, detectedSpecies, confidenceScore, isDanger, status, timestamp, location, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, imagePath, detectedSpecies, detectedSpecies, confidenceScore, isDanger, status, timestamp, location, userId || 'anonymous');

    const sighting: Sighting = {
      id,
      images: [imagePath],
      animalType: detectedSpecies as AnimalType,
      detectedSpecies,
      confidenceScore,
      isDanger: isDanger === 1,
      status,
      timestamp,
      location
    };

    res.status(201).json(sighting);
  });

  app.post("/api/sightings/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE sightings SET status = ? WHERE id = ?").run(status, req.params.id);
    const sighting = db.prepare("SELECT * FROM sightings WHERE id = ?").get(req.params.id);
    res.json(sighting);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
