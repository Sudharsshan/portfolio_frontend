import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import fs from "fs";
import path from "path";

export interface ProjectsResponse {
  projects: any[];
  source: string;
}

export interface MarkdownResponse {
  html: string;
  metadata: any;
  source: string;
}

interface CacheEntry<T> {
  data: T | null;
  commitSha: string | null;
  lastChecked: number;
  source: string;
  pendingRefresh: Promise<T> | null;
}

interface CacheStore {
  projects: CacheEntry<ProjectsResponse>;
  internship: CacheEntry<MarkdownResponse>;
  standard: CacheEntry<MarkdownResponse>;
}

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

export class GitHubContentCache {
  private cache: CacheStore = {
    projects: {
      data: null,
      commitSha: null,
      lastChecked: 0,
      source: "fallback",
      pendingRefresh: null,
    },
    internship: {
      data: null,
      commitSha: null,
      lastChecked: 0,
      source: "local",
      pendingRefresh: null,
    },
    standard: {
      data: null,
      commitSha: null,
      lastChecked: 0,
      source: "local",
      pendingRefresh: null,
    },
  };

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes safety fallback TTL

  /**
   * Retrieves live projects, using memory-cached data if possible.
   */
  public async getProjects(): Promise<ProjectsResponse> {
    const entry = this.cache.projects;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "fallback") {
        console.log("[Cache] Serving cached response. (No GITHUB_TOKEN, served from memory fallback)");
        return entry.data;
      }
      return this.refreshProjects();
    }

    // Safety TTL check: Serve from cache immediately without GitHub network hop
    if (entry.data && (Date.now() - entry.lastChecked < this.CACHE_TTL)) {
      console.log("[Cache] Serving cached response.");
      return entry.data;
    }

    // Thread Safety: Wait on existing promise if a fetch is already in flight
    if (entry.pendingRefresh) {
      console.log("[Cache] Serving cached response (awaiting concurrent projects refresh)...");
      return entry.pendingRefresh;
    }

    entry.pendingRefresh = this.refreshProjects().finally(() => {
      entry.pendingRefresh = null;
    });

    return entry.pendingRefresh;
  }

  /**
   * Retrieves internship content, using memory-cached data if possible.
   */
  public async getInternship(): Promise<MarkdownResponse> {
    const entry = this.cache.internship;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "local") {
        console.log("[Cache] Serving cached response. (No GITHUB_TOKEN, served from memory local)");
        return entry.data;
      }
      return this.refreshInternship();
    }

    // Safety TTL check
    if (entry.data && (Date.now() - entry.lastChecked < this.CACHE_TTL)) {
      console.log("[Cache] Serving cached response.");
      return entry.data;
    }

    // Thread Safety
    if (entry.pendingRefresh) {
      console.log("[Cache] Serving cached response (awaiting concurrent internship refresh)...");
      return entry.pendingRefresh;
    }

    entry.pendingRefresh = this.refreshInternship().finally(() => {
      entry.pendingRefresh = null;
    });

    return entry.pendingRefresh;
  }

  /**
   * Retrieves project ID standard content, using memory-cached data if possible.
   */
  public async getProjectIdStandard(): Promise<MarkdownResponse> {
    const entry = this.cache.standard;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "local") {
        console.log("[Cache] Serving cached response. (No GITHUB_TOKEN, served from memory local)");
        return entry.data;
      }
      return this.refreshProjectIdStandard();
    }

    // Safety TTL check
    if (entry.data && (Date.now() - entry.lastChecked < this.CACHE_TTL)) {
      console.log("[Cache] Serving cached response.");
      return entry.data;
    }

    // Thread Safety
    if (entry.pendingRefresh) {
      console.log("[Cache] Serving cached response (awaiting concurrent project standards refresh)...");
      return entry.pendingRefresh;
    }

    entry.pendingRefresh = this.refreshProjectIdStandard().finally(() => {
      entry.pendingRefresh = null;
    });

    return entry.pendingRefresh;
  }

  /**
   * Core refresh logic for projects endpoint.
   */
  private async refreshProjects(): Promise<ProjectsResponse> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const PROJECTS_PATH = process.env.GITHUB_PROJECTS_PATH || "Projects";

    if (!GITHUB_TOKEN) {
      console.log("[Cache] Cold start. No GITHUB_TOKEN configured. Serving fallback projects.");
      const result = { projects: fallbackProjects, source: "fallback" };
      this.cache.projects.data = result;
      this.cache.projects.source = "fallback";
      this.cache.projects.lastChecked = Date.now();
      return result;
    }

    try {
      // 1. Freshness verification using latest commit SHA
      const commitSha = await this.fetchLatestCommitSha(OWNER, REPO, PROJECTS_PATH, GITHUB_TOKEN);
      
      if (commitSha && this.cache.projects.commitSha === commitSha && this.cache.projects.data) {
        console.log("[Cache] Repository unchanged.");
        console.log("[Cache] Serving cached response.");
        this.cache.projects.lastChecked = Date.now();
        return this.cache.projects.data;
      }

      if (this.cache.projects.data) {
        console.log("[Cache] Repository updated.");
      } else {
        console.log("[Cache] Cold start.");
      }

      // 2. Load and process projects since cache was stale/absent
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

      let finalData: ProjectsResponse;
      let finalSource: string;

      if (projects.length === 0) {
        console.log("[Cache] GitHub returned empty projects list. Fallback triggered.");
        finalData = { projects: fallbackProjects, source: "fallback_empty" };
        finalSource = "fallback_empty";
      } else {
        finalData = { projects, source: "github" };
        finalSource = "github";
      }

      console.log("[Cache] Refresh completed.");

      this.cache.projects.data = finalData;
      this.cache.projects.source = finalSource;
      this.cache.projects.commitSha = commitSha;
      this.cache.projects.lastChecked = Date.now();

      return finalData;

    } catch (error: any) {
      console.warn(`[Cache] GitHub unavailable, serving stale cache. Error: ${error.message}`);
      
      // Serve existing cached projects if available
      if (this.cache.projects.data) {
        return this.cache.projects.data;
      }

      // First run fallback
      console.log("[Cache] No cached projects available. Serving fallback projects.");
      const fallbackResult = { projects: fallbackProjects, source: "fallback_error" };
      this.cache.projects.data = fallbackResult;
      this.cache.projects.source = "fallback_error";
      // We do NOT set lastChecked to retry on next visitor
      return fallbackResult;
    }
  }

  /**
   * Core refresh logic for internship experience.
   */
  private async refreshInternship(): Promise<MarkdownResponse> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const INTERNSHIP_PATH = "Internship";

    if (!GITHUB_TOKEN) {
      console.log("[Cache] Cold start. No GITHUB_TOKEN configured. Serving local internship.");
      const result = await this.loadLocalInternship();
      this.cache.internship.data = result;
      this.cache.internship.source = result.source;
      this.cache.internship.lastChecked = Date.now();
      return result;
    }

    try {
      // 1. Check repo freshness (checking both 'Internship' and 'internship')
      const commitSha = await this.fetchLatestCommitSha(OWNER, REPO, INTERNSHIP_PATH, GITHUB_TOKEN) ||
                        await this.fetchLatestCommitSha(OWNER, REPO, "internship", GITHUB_TOKEN);

      if (commitSha && this.cache.internship.commitSha === commitSha && this.cache.internship.data) {
        console.log("[Cache] Repository unchanged.");
        console.log("[Cache] Serving cached response.");
        this.cache.internship.lastChecked = Date.now();
        return this.cache.internship.data;
      }

      if (this.cache.internship.data) {
        console.log("[Cache] Repository updated.");
      } else {
        console.log("[Cache] Cold start.");
      }

      // 2. Fetch and parse contents since cache was stale/absent
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

      let markdownContent = "";
      let source = "local";

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

      let result: MarkdownResponse;

      if (markdownContent) {
        const { data, content } = matter(markdownContent);
        const processed = await remark()
          .use(remarkGfm)
          .use(remarkHtml, { sanitize: false })
          .process(content);

        result = {
          html: String(processed),
          metadata: data,
          source,
        };
      } else {
        result = await this.loadLocalInternship();
      }

      console.log("[Cache] Refresh completed.");

      this.cache.internship.data = result;
      this.cache.internship.source = result.source;
      this.cache.internship.commitSha = commitSha;
      this.cache.internship.lastChecked = Date.now();

      return result;

    } catch (error: any) {
      console.warn(`[Cache] GitHub unavailable, serving stale cache. Error: ${error.message}`);

      if (this.cache.internship.data) {
        return this.cache.internship.data;
      }

      console.log("[Cache] No cached internship available. Serving local internship.");
      const fallbackResult = await this.loadLocalInternship();
      this.cache.internship.data = fallbackResult;
      this.cache.internship.source = fallbackResult.source;
      return fallbackResult;
    }
  }

  /**
   * Helper to load internship markdown from local workspace directory.
   */
  private async loadLocalInternship(): Promise<MarkdownResponse> {
    const localVariants = [
      path.join(process.cwd(), "internship", "ReadMe.md"),
      path.join(process.cwd(), "internship", "ReadMe"),
      path.join(process.cwd(), "internship", "README.md"),
      path.join(process.cwd(), "internship", "readme.md"),
    ];

    let markdownContent = "";
    for (const lp of localVariants) {
      try {
        markdownContent = await fs.promises.readFile(lp, "utf-8");
        break;
      } catch {}
    }

    if (!markdownContent) {
      markdownContent = "# Internship Experience\n\nNo internship markdown found in workspace.";
    }

    const { data, content } = matter(markdownContent);
    const processed = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content);

    return {
      html: String(processed),
      metadata: data,
      source: "local",
    };
  }

  /**
   * Core refresh logic for project standards endpoint.
   */
  private async refreshProjectIdStandard(): Promise<MarkdownResponse> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const STANDARD_PATH = "templates-standards";

    if (!GITHUB_TOKEN) {
      console.log("[Cache] Cold start. No GITHUB_TOKEN configured. Serving local project standards.");
      const result = await this.loadLocalProjectIdStandard();
      this.cache.standard.data = result;
      this.cache.standard.source = result.source;
      this.cache.standard.lastChecked = Date.now();
      return result;
    }

    try {
      // 1. Freshness validation using newest commit SHA
      const commitSha = await this.fetchLatestCommitSha(OWNER, REPO, STANDARD_PATH, GITHUB_TOKEN);

      if (commitSha && this.cache.standard.commitSha === commitSha && this.cache.standard.data) {
        console.log("[Cache] Repository unchanged.");
        console.log("[Cache] Serving cached response.");
        this.cache.standard.lastChecked = Date.now();
        return this.cache.standard.data;
      }

      if (this.cache.standard.data) {
        console.log("[Cache] Repository updated.");
      } else {
        console.log("[Cache] Cold start.");
      }

      // 2. Fetch standards document from GitHub
      const headers = {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Sudharsshan-Portfolio-App",
      };

      const fileVariants = [
        "templates-standards/PROJECT_ID_STANDARD.md",
        "templates-standards/project_id_standard.md",
      ];

      let markdownContent = "";
      let source = "local";

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

      let result: MarkdownResponse;

      if (markdownContent) {
        const { data, content } = matter(markdownContent);
        const processed = await remark()
          .use(remarkGfm)
          .use(remarkHtml, { sanitize: false })
          .process(content);

        result = {
          html: String(processed),
          metadata: data,
          source,
        };
      } else {
        result = await this.loadLocalProjectIdStandard();
      }

      console.log("[Cache] Refresh completed.");

      this.cache.standard.data = result;
      this.cache.standard.source = result.source;
      this.cache.standard.commitSha = commitSha;
      this.cache.standard.lastChecked = Date.now();

      return result;

    } catch (error: any) {
      console.warn(`[Cache] GitHub unavailable, serving stale cache. Error: ${error.message}`);

      if (this.cache.standard.data) {
        return this.cache.standard.data;
      }

      console.log("[Cache] No cached standards available. Serving local standards.");
      const fallbackResult = await this.loadLocalProjectIdStandard();
      this.cache.standard.data = fallbackResult;
      this.cache.standard.source = fallbackResult.source;
      return fallbackResult;
    }
  }

  /**
   * Helper to load project standards markdown from local workspace directory.
   */
  private async loadLocalProjectIdStandard(): Promise<MarkdownResponse> {
    const localVariants = [
      path.join(process.cwd(), "templates-standards", "PROJECT_ID_STANDARD.md"),
      path.join(process.cwd(), "templates-standards", "project_id_standard.md"),
    ];

    let markdownContent = "";
    for (const lp of localVariants) {
      try {
        markdownContent = await fs.promises.readFile(lp, "utf-8");
        break;
      } catch {}
    }

    if (!markdownContent) {
      markdownContent = "# Project ID Standards\n\nNo standards file found in workspace.";
    }

    const { data, content } = matter(markdownContent);
    const processed = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content);

    return {
      html: String(processed),
      metadata: data,
      source: "local",
    };
  }

  /**
   * Fetches latest commit SHA affecting a specific path in the repository.
   */
  private async fetchLatestCommitSha(owner: string, repo: string, pathStr: string, token: string): Promise<string | null> {
    try {
      const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(pathStr)}&per_page=1`;
      const res = await fetch(commitUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Sudharsshan-Portfolio-App",
        },
      });

      if (res.ok) {
        const commits = await res.json() as Array<{ sha: string }>;
        if (commits && commits.length > 0) {
          return commits[0].sha;
        }
      }
    } catch (err: any) {
      console.warn(`[Cache] Failed to fetch latest commit SHA for path "${pathStr}":`, err.message);
    }
    return null;
  }
}

// Export a singleton instance of the cache manager
export const gitHubContentCache = new GitHubContentCache();
