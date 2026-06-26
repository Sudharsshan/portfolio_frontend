import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

// Fallback local projects if token or API is unavailable
const fallbackProjects = [
  {
    project_id: "C2025EMB-01",
    title: "AI-Powered Smart Helmet Detection System",
    owner: "College",
    status: "COMPLETED",
    ideation_date: "2025-02-15",
    domain: "Embedded Systems",
    subdomains: "Deep Learning, Computer Vision, Ignitions",
    repository: "https://github.com/Sudharsshan/smart-helmet-detection",
    hardware: true,
    tags: ["STM32", "OV2640", "TensorFlow Lite", "Embedded C", "YOLOv2"],
    slug: "ai-smart-helmet-detection",
    bodyHtml: `
      <h2>Project Overview</h2>
      <p>This capstone project aims to improve two-wheeler safety by preventing vehicle start unless the driver is wearing a certified safety helmet. Built using an STM32 MCU paired with an OV2640 camera module, the system processes a live camera stream on-device and uses a quantized TensorFlow Lite Micro model to detect helmet usage in real time.</p>
      
      <h2>Core Architecture</h2>
      <ul>
        <li><strong>Microcontroller:</strong> STM32F4 series running at high clock rates.</li>
        <li><strong>Camera Interface:</strong> OV2640 camera configured with DMA (Direct Memory Access) for high-performance frame capture.</li>
        <li><strong>Edge AI:</strong> Quantized YOLOv2 model compiled to run efficiently on TensorFlow Lite Micro with weight pruning and micro-operator scaling.</li>
        <li><strong>Ignition Control:</strong> Solid-state relay connected to the vehicle starter coil requiring a certified cryptographic OK pulse from the MCU.</li>
      </ul>

      <h2>Key Features</h2>
      <ol>
        <li>Real-time helmet presence assessment within 420 milliseconds.</li>
        <li>Low hardware latency and battery footprint.</li>
        <li>Offline verification without cloud dependency, securing local driver privacy.</li>
        <li>Anti-spoofing mechanism to prevent bypass using paper photos.</li>
      </ol>
    `,
    ownerCode: "C",
    yearMonth: "2025",
    domainCode: "EMB",
    sequence: "01"
  },
  {
    project_id: "C2024EV-02",
    title: "Solar Electric Vehicle - Control Unit (VCU)",
    owner: "College",
    status: "COMPLETED",
    ideation_date: "2024-06-10",
    domain: "Power Electronics",
    subdomains: "CAN Bus, Battery Management System, Telemetry",
    repository: "NA",
    hardware: true,
    tags: ["Embedded Systems", "Power Electronics", "CAN Bus", "LTSpice", "Simulink"],
    slug: "solar-ev-control-unit",
    bodyHtml: `
      <h2>Project Overview</h2>
      <p>Designed and programmed the Master Vehicle Control Unit (VCU) for Christ University's solar-powered electric buggy entering the 2024 SAE REEV regional competition. The unit coordinates driver inputs, monitors battery temperature and state-of-charge, controls high-voltage contactors, and streams real-time cell parameters over CAN bus.</p>

      <h2>Engineering Highlights</h2>
      <ul>
        <li>Implemented multi-master CAN bus topology to synchronize State of Charge (SoC) from BMS with Motor Controller feedback loops.</li>
        <li>Developed hardware-in-the-loop (HIL) safety routines using MATLAB Simulink to validate throttle pedal plausibility (preventing runaway motor commands).</li>
        <li>Designed a low-ripple buck converter circuit in LTSpice to step down the 48V auxiliary pack safely to 12V for accessory control.</li>
      </ul>
    `,
    ownerCode: "C",
    yearMonth: "2024",
    domainCode: "EV",
    sequence: "02"
  },
  {
    project_id: "P2023SaaS-01",
    title: "PulseBoard - IoT SaaS Device Management Dashboard",
    owner: "personal",
    status: "IN_PROGRESS",
    ideation_date: "2023-11-05",
    domain: "IoT Cloud",
    subdomains: "MQTT Broker, Multi-tenant Dashboard, WebSockets",
    repository: "https://github.com/Sudharsshan/pulseboard-iot",
    hardware: false,
    tags: ["Flutter", "FastAPI", "MQTT", "Firebase", "TimescaleDB"],
    slug: "pulseboard-iot-dashboard",
    bodyHtml: `
      <h2>Project Overview</h2>
      <p>PulseBoard is a high-speed multi-tenant device telemetry dashboard. It enables real-time device health reporting, MQTT configuration sync, and analytical graphs showing voltage logs, temperature trends, and ping ratios for ESP32/ESP8266 fleets deployed in remote agricultural pumps.</p>

      <h2>Technical Implementation</h2>
      <ul>
        <li><strong>Frontend:</strong> Cross-platform Flutter client with local SQLite buffer and elegant animated canvas dashboards.</li>
        <li><strong>Backend:</strong> High-performance FastAPI server processing device logs concurrently at up to 1200 messages/sec.</li>
        <li><strong>Messaging Layer:</strong> EMQX MQTT Cluster utilizing WebSockets for real-time frontend notifications.</li>
        <li><strong>Storage:</strong> TimescaleDB (PostgreSQL extension) for high-performance and low-overhead hypertable queries of historical telemetry logs.</li>
      </ul>
    `,
    ownerCode: "P",
    yearMonth: "2023",
    domainCode: "SaaS",
    sequence: "01"
  }
];

function parseProjectId(id: string) {
  const match = id.match(/^([CP])(\d{4})([A-Z]+)-(\d+)$/);
  if (!match) return { ownerCode: "P" as const, yearMonth: "", domainCode: "", sequence: "01" };
  return {
    ownerCode: match[1] as "C" | "P",
    yearMonth: match[2],
    domainCode: match[3],
    sequence: match[4],
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch projects from GitHub (Proxying securely)
  app.get("/api/projects", async (req, res) => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const PROJECTS_PATH = process.env.GITHUB_PROJECTS_PATH || "Projects";

    if (!GITHUB_TOKEN) {
      console.log("No GITHUB_TOKEN configured. Serving high-quality fallback projects.");
      return res.json({ projects: fallbackProjects, source: "fallback" });
    }

    try {
      const headers = {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Sudharsshan-Portfolio-App",
      };

      const folderUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PROJECTS_PATH}`;
      const folderRes = await fetch(folderUrl, { headers });

      if (!folderRes.ok) {
        throw new Error(`GitHub API returned status ${folderRes.status}`);
      }

      const folderData = await folderRes.json() as Array<{ name: string; type: string }>;
      const directories = folderData.filter((item) => item.type === "dir").map((item) => item.name);
      const projects: any[] = [];

      // Fetch Readmes for directories parallelly (up to a reasonable limit)
      await Promise.all(
        directories.map(async (folder) => {
          const fileVariants = ["ReadMe.md", "README.md", "Readme.md", "readme.md"];
          let readmeContent: string | null = null;

          for (const variant of fileVariants) {
            const fileUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PROJECTS_PATH}/${encodeURIComponent(folder)}/${variant}`;
            const fileRes = await fetch(fileUrl, { headers });
            if (fileRes.ok) {
              const fileData = await fileRes.json() as { content: string };
              readmeContent = Buffer.from(fileData.content, "base64").toString("utf-8");
              break;
            }
          }

          if (readmeContent) {
            try {
              const { data, content } = matter(readmeContent);
              if (data.project_id && data.title) {
                const processed = await remark()
                  .use(remarkGfm)
                  .use(remarkHtml, { sanitize: false })
                  .process(content);

                const parsedId = parseProjectId(data.project_id);

                projects.push({
                  project_id: data.project_id,
                  title: data.title,
                  owner: data.owner || "personal",
                  status: data.status || "IN_PROGRESS",
                  ideation_date: data.ideation_date || "",
                  domain: data.domain || "",
                  subdomains: data.subdomains || "",
                  repository: data.repository || "NA",
                  hardware: data.hardware === true || data.hardware === "true",
                  tags: Array.isArray(data.tags) ? data.tags : [],
                  slug: folder.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                  bodyHtml: String(processed),
                  ...parsedId,
                });
              }
            } catch (err) {
              console.error(`Error parsing frontmatter in folder: ${folder}`, err);
            }
          }
        })
      );

      // Sort by ideation date descending
      projects.sort((a, b) => new Date(b.ideation_date).getTime() - new Date(a.ideation_date).getTime());

      if (projects.length === 0) {
        return res.json({ projects: fallbackProjects, source: "fallback_empty" });
      }

      return res.json({ projects, source: "github" });
    } catch (error: any) {
      console.log("Information: Could not synchronise live projects from GitHub repository. Operating in standalone local database mode.", error.message);
      // Fallback in case of rate limit, invalid token, etc.
      return res.json({ projects: fallbackProjects, source: "fallback_error" });
    }
  });

  // API Route to fetch internship markdown and convert to HTML
  app.get("/api/internship", async (req, res) => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";

    let markdownContent = "";
    let source = "local";

    if (GITHUB_TOKEN) {
      try {
        const headers = {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Sudharsshan-Portfolio-App",
        };

        const fileVariants = [
          "Internship/ReadMe.md",
          "Internship/ReadMe",
          "internship/ReadMe.md",
          "internship/ReadMe",
          "internship/README.md",
          "internship/readme.md",
          "internship/Readme.md",
        ];

        for (const variant of fileVariants) {
          const fileUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${variant}`;
          const fileRes = await fetch(fileUrl, { headers });
          if (fileRes.ok) {
            const fileData = await fileRes.json() as { content: string };
            markdownContent = Buffer.from(fileData.content, "base64").toString("utf-8");
            source = "github";
            break;
          }
        }
      } catch (err: any) {
        console.log("Information: Could not load internship from GitHub repo, falling back to local file.", err.message);
      }
    }

    // Fallback to reading local file variants if github fetch failed or was skipped
    if (!markdownContent) {
      const localVariants = [
        path.join(process.cwd(), "internship", "ReadMe.md"),
        path.join(process.cwd(), "internship", "ReadMe"),
        path.join(process.cwd(), "internship", "README.md"),
        path.join(process.cwd(), "internship", "readme.md"),
      ];
      
      for (const lp of localVariants) {
        try {
          markdownContent = await fs.promises.readFile(lp, "utf-8");
          source = "local";
          break;
        } catch {}
      }

      if (!markdownContent) {
        markdownContent = "# Internship Experience\n\nNo internship markdown found in workspace.";
      }
    }

    try {
      // Process markdown to HTML
      const { data, content } = matter(markdownContent);
      const processed = await remark()
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .process(content);

      return res.json({
        html: String(processed),
        metadata: data,
        source,
      });
    } catch (err: any) {
      console.error("Error processing internship markdown:", err);
      return res.status(500).json({ error: "Failed to parse internship markdown" });
    }
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
