import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import projectsHandler from "./api/projects";
import internshipHandler from "./api/internship";
import standardsHandler from "./api/project-id-standard";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch projects from GitHub (with caching and freshness check)
  app.get("/api/projects", async (req, res) => {
    await projectsHandler(req, res);
  });

  // API Route to fetch internship markdown and convert to HTML (cached)
  app.get("/api/internship", async (req, res) => {
    await internshipHandler(req, res);
  });

  // API Route to fetch project standard markdown and convert to HTML (cached)
  app.get("/api/project-id-standard", async (req, res) => {
    await standardsHandler(req, res);
  });


  // Serve static assets in production, or mount Vite dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
