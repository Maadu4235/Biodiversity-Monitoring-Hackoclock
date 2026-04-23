import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Sighting, AnimalType, SightingStatus } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory storage
  const sightings: Sighting[] = [];

  // Helper for AI simulation
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
    const { images, animalType } = req.body;
    
    if (!images || !animalType) {
      return res.status(400).json({ error: "Missing images or animal type" });
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
      timestamp: new Date().toISOString()
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
