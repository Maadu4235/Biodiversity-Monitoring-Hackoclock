import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Sighting, AnimalType, SightingStatus, User } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory storage
  const sightings: Sighting[] = [];
  const users: User[] = [
    { id: '1', email: 'officer@silva.gov', password: 'password123', role: 'Officer', name: 'Marcus Thorne', isApproved: true },
    { id: '2', email: 'user@example.com', password: 'password123', role: 'User', name: 'John Doe' }
  ];

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if officer is approved
    if (user.role === 'Officer' && user.isApproved === false) {
      return res.status(403).json({ error: "Officer account is pending administrative approval." });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token: "mock-jwt-token" });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, name, role } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9), 
      email, 
      password, 
      name, 
      role: role || 'User',
      isApproved: role === 'Officer' ? false : undefined 
    };
    
    users.push(newUser);
    
    if (newUser.role === 'Officer') {
      return res.json({ message: "Officer account created. Awaiting administrative approval.", pending: true });
    }

    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ user: userWithoutPassword, token: "mock-jwt-token" });
  });

  // Admin Officer Management
  app.get("/api/admin/officers", (req, res) => {
    const officers = users.filter(u => u.role === 'Officer');
    res.json(officers);
  });

  app.post("/api/admin/officers/:id/approve", (req, res) => {
    const user = users.find(u => u.id === req.params.id && u.role === 'Officer');
    if (!user) return res.status(404).json({ error: "Officer not found" });
    user.isApproved = true;
    res.json({ success: true, user });
  });

  // API Routes
  const getSimulatedDetection = (userSelectedType: AnimalType) => {
    const confidence = Math.floor(Math.random() * (99 - 85 + 1)) + 85; // 85% to 99%
    
    // Danger logic
    const dangerTypes: AnimalType[] = ['Tiger', 'Leopard', 'Elephant', 'Human'];
    const isDanger = dangerTypes.includes(userSelectedType);

    return {
      detectedSpecies: userSelectedType,
      confidenceScore: confidence,
      isDanger
    };
  };

  // API Routes
  app.get("/api/sightings", (req, res) => {
    res.json(sightings);
  });

  app.post("/api/upload", (req, res) => {
    const { images, animalType, location } = req.body;
    
    if (!images || !animalType || !location) {
      return res.status(400).json({ error: "Missing images, animal type, or location" });
    }

    const { detectedSpecies, confidenceScore, isDanger } = getSimulatedDetection(animalType);

    const newSighting: Sighting = {
      id: Math.random().toString(36).substr(2, 9),
      images,
      animalType,
      detectedSpecies,
      confidenceScore,
      isDanger,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      location
    };

    sightings.unshift(newSighting);
    res.status(201).json(newSighting);
  });

  app.post("/api/sightings/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' | 'Rejected'
    
    const sighting = sightings.find(s => s.id === id);
    if (!sighting) {
      return res.status(404).json({ error: "Sighting not found" });
    }

    sighting.status = status as SightingStatus;
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
