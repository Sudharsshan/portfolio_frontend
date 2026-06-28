import fs from "fs";
import path from "path";
import { CacheStore, ProjectsResponse, MarkdownResponse, DiagnosticsError } from "./types.js";
import { fallbackProjects, parseProjectId } from "./parser.js";
import { fetchLatestCommitSha, fetchDirectoryContents, fetchFileContent } from "./github.js";
import { safeParseMarkdown } from "./markdown.js";

let globalCache: CacheStore | null = null;

function getCacheStore(): CacheStore {
  if (!globalCache) {
    globalCache = {
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
  }
  return globalCache;
}

export class GitHubContentCache {
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

  private getCache() {
    return getCacheStore();
  }

  /**
   * Retrieves live projects, using memory-cached data if possible.
   */
  public async getProjects(): Promise<ProjectsResponse> {
    const store = this.getCache();
    const entry = store.projects;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const timestamp = new Date().toISOString();

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "fallback") {
        console.log(`[Cache Hit] Serving cached fallback projects response (Timestamp: ${timestamp})`);
        return entry.data;
      }
      console.log(`[Cache Miss] GITHUB_TOKEN missing, refreshing fallback projects (Timestamp: ${timestamp})`);
      return this.refreshProjects();
    }

    // Safety TTL check
    if (entry.data && (Date.now() - entry.lastChecked < this.CACHE_TTL)) {
      console.log(`[Cache Hit] Serving cached projects response (Timestamp: ${timestamp})`);
      return entry.data;
    }

    // Thread Safety: Wait on existing promise if a fetch is already in flight
    if (entry.pendingRefresh) {
      console.log(`[Cache Hit] Serving cached projects response - awaiting concurrent refresh (Timestamp: ${timestamp})`);
      return entry.pendingRefresh;
    }

    console.log(`[Cache Miss] Initiating projects refresh (Timestamp: ${timestamp})`);
    entry.pendingRefresh = this.refreshProjects().finally(() => {
      entry.pendingRefresh = null;
    });

    return entry.pendingRefresh;
  }

  /**
   * Retrieves internship content, using memory-cached data if possible.
   */
  public async getInternship(): Promise<MarkdownResponse> {
    const store = this.getCache();
    const entry = store.internship;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const timestamp = new Date().toISOString();

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "local") {
        console.log(`[Cache Hit] Serving cached local internship response (Timestamp: ${timestamp})`);
        return entry.data;
      }
      console.log(`[Cache Miss] GITHUB_TOKEN missing, refreshing local internship (Timestamp: ${timestamp})`);
      return this.refreshInternship();
    }

    // Safety TTL check
    if (entry.data && (Date.now() - entry.lastChecked < this.CACHE_TTL)) {
      console.log(`[Cache Hit] Serving cached internship response (Timestamp: ${timestamp})`);
      return entry.data;
    }

    // Thread Safety
    if (entry.pendingRefresh) {
      console.log(`[Cache Hit] Serving cached internship response - awaiting concurrent refresh (Timestamp: ${timestamp})`);
      return entry.pendingRefresh;
    }

    console.log(`[Cache Miss] Initiating internship refresh (Timestamp: ${timestamp})`);
    entry.pendingRefresh = this.refreshInternship().finally(() => {
      entry.pendingRefresh = null;
    });

    return entry.pendingRefresh;
  }

  /**
   * Retrieves project ID standard content, using memory-cached data if possible.
   */
  public async getProjectIdStandard(): Promise<MarkdownResponse> {
    const store = this.getCache();
    const entry = store.standard;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const timestamp = new Date().toISOString();

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "local") {
        console.log(`[Cache Hit] Serving cached local standards response (Timestamp: ${timestamp})`);
        return entry.data;
      }
      console.log(`[Cache Miss] GITHUB_TOKEN missing, refreshing local standards (Timestamp: ${timestamp})`);
      return this.refreshProjectIdStandard();
    }

    // Safety TTL check
    if (entry.data && (Date.now() - entry.lastChecked < this.CACHE_TTL)) {
      console.log(`[Cache Hit] Serving cached standards response (Timestamp: ${timestamp})`);
      return entry.data;
    }

    // Thread Safety
    if (entry.pendingRefresh) {
      console.log(`[Cache Hit] Serving cached standards response - awaiting concurrent refresh (Timestamp: ${timestamp})`);
      return entry.pendingRefresh;
    }

    console.log(`[Cache Miss] Initiating standards refresh (Timestamp: ${timestamp})`);
    entry.pendingRefresh = this.refreshProjectIdStandard().finally(() => {
      entry.pendingRefresh = null;
    });

    return entry.pendingRefresh;
  }

  /**
   * Core refresh logic for projects endpoint.
   */
  private async refreshProjects(): Promise<ProjectsResponse> {
    const store = this.getCache();
    const entry = store.projects;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const PROJECTS_PATH = process.env.GITHUB_PROJECTS_PATH || "Projects";
    const timestamp = new Date().toISOString();

    if (!GITHUB_TOKEN) {
      console.log(`[Cache Refresh] No GITHUB_TOKEN configured. Loading fallback projects (Timestamp: ${timestamp})`);
      const result = { projects: fallbackProjects, source: "fallback" };
      entry.data = result;
      entry.source = "fallback";
      entry.lastChecked = Date.now();
      return result;
    }

    try {
      console.log(`[Cache Refresh] Querying GitHub for latest commit SHA for "${PROJECTS_PATH}"...`);
      const commitSha = await fetchLatestCommitSha(OWNER, REPO, PROJECTS_PATH, GITHUB_TOKEN);
      
      if (commitSha && entry.commitSha === commitSha && entry.data) {
        console.log(`[Commit Unchanged] Remote commit matches cached SHA: ${commitSha} (Timestamp: ${timestamp})`);
        console.log(`[Cache Hit] Serving cached projects response (Timestamp: ${timestamp})`);
        entry.lastChecked = Date.now();
        return entry.data;
      }

      if (commitSha) {
        if (entry.commitSha) {
          console.log(`[Commit Changed] Remote commit changed from ${entry.commitSha} to ${commitSha} (Timestamp: ${timestamp})`);
          console.log(`[Cache Invalidated] Cache invalidated because commit SHA changed (Timestamp: ${timestamp})`);
        } else {
          console.log(`[Commit Changed] First fetch. Remote commit SHA: ${commitSha} (Timestamp: ${timestamp})`);
        }
      }

      console.log(`[Cache Refresh] Fetching projects directory contents...`);
      const folderData = await fetchDirectoryContents(OWNER, REPO, PROJECTS_PATH, GITHUB_TOKEN);
      if (!folderData) {
        throw new DiagnosticsError(
          "Could not fetch directory contents from GitHub.",
          "Fetching directory contents",
          { owner: OWNER, repo: REPO, path: PROJECTS_PATH }
        );
      }

      const directories = folderData.filter((item) => item.type === "dir").map((item) => item.name);
      const projects: any[] = [];

      console.log(`[Cache Refresh] Found ${directories.length} project folders. Downloading and parsing READMEs...`);

      await Promise.all(
        directories.map(async (folder) => {
          const fileVariants = ["README.md"];
          let readmeContent: string | null = null;
          let foundVariant = "";

          for (const variant of fileVariants) {
            const pathStr = `${PROJECTS_PATH}/${encodeURIComponent(folder)}/${variant}`;
            // Allow 404 since we check variants
            readmeContent = await fetchFileContent(OWNER, REPO, pathStr, GITHUB_TOKEN, true);
            if (readmeContent) {
              foundVariant = variant;
              break;
            }
          }

          if (readmeContent) {
            const parsedResult = await safeParseMarkdown(readmeContent);
            if (!parsedResult.success) {
              console.error(`[File Parsing Diagnostics] Failed to parse README for folder: ${folder}`);
              console.error(`[File Parsing Diagnostics] Exception:`, parsedResult.exception || parsedResult.error);
              console.error(`[File Parsing Diagnostics] Front Matter:`, parsedResult.rawFrontMatter || "No front matter found");
              return; // Continue processing remaining projects
            }

            const data = parsedResult.data;
            const html = parsedResult.html;

            if (data && data.project_id && data.title) {
              const parsedId = parseProjectId(data.project_id);
              const mappedProject = {
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
                bodyHtml: html,
                ...parsedId,
              };

              console.log(`[Project Parsing] Folder: ${folder}`);
              console.log(`[Project Parsing] Filename: ${foundVariant}`);
              console.log(`[Project Parsing] Markdown Length: ${readmeContent.length} characters`);
              console.log(`[Project Parsing] Parsed Project Title: ${data.title}`);

              projects.push(mappedProject);
            } else {
              console.warn(`[File Parsing Diagnostics] Downloaded README in folder "${folder}" is missing project_id or title in frontmatter.`);
            }
          } else {
            console.warn(`[File Parsing Diagnostics] No README file variant found in folder "${folder}". Checked variants: ${fileVariants.join(", ")}`);
          }
        })
      );

      // Sort by ideation date descending
      projects.sort((a, b) => new Date(b.ideation_date).getTime() - new Date(a.ideation_date).getTime());

      let finalData: ProjectsResponse;
      let finalSource: string;

      if (projects.length === 0) {
        console.warn(`[Cache Refresh] GitHub returned empty projects list. Fallback triggered.`);
        finalData = { projects: fallbackProjects, source: "fallback_empty" };
        finalSource = "fallback_empty";
      } else {
        finalData = { projects, source: "github" };
        finalSource = "github";
      }

      console.log(`[Cache Refresh] Refresh completed successfully for projects (Timestamp: ${timestamp})`);

      entry.data = finalData;
      entry.source = finalSource;
      entry.commitSha = commitSha;
      entry.lastChecked = Date.now();

      return finalData;

    } catch (error: any) {
      console.warn(`[Cache Refresh Error] GitHub unavailable, serving stale cache. Error: ${error.message}`);
      
      if (entry.data) {
        return entry.data;
      }

      console.log(`[Cache Refresh Fallback] No cached projects available. Serving fallback projects (Timestamp: ${timestamp})`);
      const fallbackResult = { projects: fallbackProjects, source: "fallback_error" };
      entry.data = fallbackResult;
      entry.source = fallbackResult.source;
      return fallbackResult;
    }
  }

  /**
   * Core refresh logic for internship experience.
   */
  private async refreshInternship(): Promise<MarkdownResponse> {
    const store = this.getCache();
    const entry = store.internship;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const INTERNSHIP_PATH = "Internship";
    const timestamp = new Date().toISOString();

    if (!GITHUB_TOKEN) {
      console.log(`[Cache Refresh] No GITHUB_TOKEN configured. Serving local internship (Timestamp: ${timestamp})`);
      const result = await this.loadLocalInternship();
      entry.data = result;
      entry.source = result.source;
      entry.lastChecked = Date.now();
      return result;
    }

    try {
      console.log(`[Cache Refresh] Querying GitHub for latest commit SHA for "${INTERNSHIP_PATH}"...`);
      const commitSha = await fetchLatestCommitSha(OWNER, REPO, INTERNSHIP_PATH, GITHUB_TOKEN) ||
                        await fetchLatestCommitSha(OWNER, REPO, "internship", GITHUB_TOKEN);

      if (commitSha && entry.commitSha === commitSha && entry.data) {
        console.log(`[Commit Unchanged] Remote commit matches cached SHA: ${commitSha} (Timestamp: ${timestamp})`);
        console.log(`[Cache Hit] Serving cached internship response (Timestamp: ${timestamp})`);
        entry.lastChecked = Date.now();
        return entry.data;
      }

      if (commitSha) {
        if (entry.commitSha) {
          console.log(`[Commit Changed] Remote commit changed from ${entry.commitSha} to ${commitSha} (Timestamp: ${timestamp})`);
          console.log(`[Cache Invalidated] Cache invalidated because commit SHA changed (Timestamp: ${timestamp})`);
        } else {
          console.log(`[Commit Changed] First fetch. Remote commit SHA: ${commitSha} (Timestamp: ${timestamp})`);
        }
      }

      const fileVariants = [
        "Internship/README.md",
        "internship/README.md",
      ];

      let markdownContent = "";
      let source = "local";
      let downloadedVariant = "";

      console.log(`[Cache Refresh] Fetching internship file from GitHub...`);
      for (const variant of fileVariants) {
        const fileData = await fetchFileContent(OWNER, REPO, variant, GITHUB_TOKEN, true);
        if (fileData) {
          markdownContent = fileData;
          source = "github";
          downloadedVariant = variant;
          break;
        }
      }

      let result: MarkdownResponse;

      if (markdownContent) {
        console.log(`[Cache Refresh] Internship file successfully downloaded. Parsing markdown...`);
        const parsed = await safeParseMarkdown(markdownContent);
        if (!parsed.success) {
          console.error(`[File Parsing Diagnostics] Failed to parse internship markdown.`);
          console.error(`[File Parsing Diagnostics] Exception:`, parsed.exception || parsed.error);
          console.error(`[File Parsing Diagnostics] Front Matter:`, parsed.rawFrontMatter || "No front matter found");
          
          throw new DiagnosticsError(
            `Failed to parse internship markdown: ${parsed.error}`,
            "Parsing internship markdown",
            { exception: parsed.exception, path: downloadedVariant }
          );
        }

        console.log(`[Project Parsing] Type: Internship`);
        console.log(`[Project Parsing] Filename: ${downloadedVariant}`);
        console.log(`[Project Parsing] Markdown Length: ${markdownContent.length} characters`);
        console.log(`[Project Parsing] Parsed Project Title: ${parsed.data?.title || "No Title"}`);

        result = {
          html: parsed.html!,
          metadata: parsed.data,
          source,
        };
      } else {
        console.warn(`[Cache Refresh] No internship file found on GitHub. Falling back to local...`);
        result = await this.loadLocalInternship();
      }

      console.log(`[Cache Refresh] Refresh completed successfully for internship (Timestamp: ${timestamp})`);

      entry.data = result;
      entry.source = result.source;
      entry.commitSha = commitSha;
      entry.lastChecked = Date.now();

      return result;

    } catch (error: any) {
      console.warn(`[Cache Refresh Error] GitHub unavailable, serving stale cache. Error: ${error.message}`);

      if (entry.data) {
        return entry.data;
      }

      console.log(`[Cache Refresh Fallback] No cached internship available. Serving local internship (Timestamp: ${timestamp})`);
      const fallbackResult = await this.loadLocalInternship();
      entry.data = fallbackResult;
      entry.source = fallbackResult.source;
      return fallbackResult;
    }
  }

  /**
   * Helper to load internship markdown from local workspace directory.
   */
  private async loadLocalInternship(): Promise<MarkdownResponse> {
    const localVariants = [
      path.join(process.cwd(), "internship", "README.md"),
    ];

    let markdownContent = "";
    let foundPath = "";
    for (const lp of localVariants) {
      try {
        markdownContent = await fs.promises.readFile(lp, "utf-8");
        foundPath = lp;
        break;
      } catch {}
    }

    if (!markdownContent) {
      markdownContent = "# Internship Experience\n\nNo internship markdown found in workspace.";
    }

    const parsed = await safeParseMarkdown(markdownContent);
    if (!parsed.success) {
      console.error(`[File Parsing Diagnostics] Failed to parse local internship markdown.`);
      return {
        html: `<h2>Parsing Error</h2><p>Failed to parse local internship markdown.</p>`,
        metadata: {},
        source: "local_error",
      };
    }

    console.log(`[Project Parsing] Type: Internship (Local fallback)`);
    console.log(`[Project Parsing] Filename: ${foundPath || "Fallback Template"}`);
    console.log(`[Project Parsing] Markdown Length: ${markdownContent.length} characters`);

    return {
      html: parsed.html!,
      metadata: parsed.data,
      source: "local",
    };
  }

  /**
   * Core refresh logic for project standards endpoint.
   */
  private async refreshProjectIdStandard(): Promise<MarkdownResponse> {
    const store = this.getCache();
    const entry = store.standard;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const STANDARD_PATH = "templates-standards";
    const timestamp = new Date().toISOString();

    if (!GITHUB_TOKEN) {
      console.log(`[Cache Refresh] No GITHUB_TOKEN configured. Serving local project standards (Timestamp: ${timestamp})`);
      const result = await this.loadLocalProjectIdStandard();
      entry.data = result;
      entry.source = result.source;
      entry.lastChecked = Date.now();
      return result;
    }

    try {
      console.log(`[Cache Refresh] Querying GitHub for latest commit SHA for "${STANDARD_PATH}"...`);
      const commitSha = await fetchLatestCommitSha(OWNER, REPO, STANDARD_PATH, GITHUB_TOKEN);

      if (commitSha && entry.commitSha === commitSha && entry.data) {
        console.log(`[Commit Unchanged] Remote commit matches cached SHA: ${commitSha} (Timestamp: ${timestamp})`);
        console.log(`[Cache Hit] Serving cached standards response (Timestamp: ${timestamp})`);
        entry.lastChecked = Date.now();
        return entry.data;
      }

      if (commitSha) {
        if (entry.commitSha) {
          console.log(`[Commit Changed] Remote commit changed from ${entry.commitSha} to ${commitSha} (Timestamp: ${timestamp})`);
          console.log(`[Cache Invalidated] Cache invalidated because commit SHA changed (Timestamp: ${timestamp})`);
        } else {
          console.log(`[Commit Changed] First fetch. Remote commit SHA: ${commitSha} (Timestamp: ${timestamp})`);
        }
      }

      const fileVariants = [
        "templates-standards/PROJECT_ID_STANDARD.md",
        "templates-standards/project_id_standard.md",
      ];

      let markdownContent = "";
      let source = "local";
      let downloadedVariant = "";

      console.log(`[Cache Refresh] Fetching project standards file from GitHub...`);
      for (const variant of fileVariants) {
        const fileData = await fetchFileContent(OWNER, REPO, variant, GITHUB_TOKEN, true);
        if (fileData) {
          markdownContent = fileData;
          source = "github";
          downloadedVariant = variant;
          break;
        }
      }

      let result: MarkdownResponse;

      if (markdownContent) {
        console.log(`[Cache Refresh] Standards file successfully downloaded. Parsing markdown...`);
        const parsed = await safeParseMarkdown(markdownContent);
        if (!parsed.success) {
          console.error(`[File Parsing Diagnostics] Failed to parse standards markdown.`);
          console.error(`[File Parsing Diagnostics] Exception:`, parsed.exception || parsed.error);
          console.error(`[File Parsing Diagnostics] Front Matter:`, parsed.rawFrontMatter || "No front matter found");

          throw new DiagnosticsError(
            `Failed to parse project standards markdown: ${parsed.error}`,
            "Parsing project standards markdown",
            { exception: parsed.exception, path: downloadedVariant }
          );
        }

        console.log(`[Project Parsing] Type: Project Standards`);
        console.log(`[Project Parsing] Filename: ${downloadedVariant}`);
        console.log(`[Project Parsing] Markdown Length: ${markdownContent.length} characters`);
        console.log(`[Project Parsing] Parsed Project Title: ${parsed.data?.title || "No Title"}`);

        result = {
          html: parsed.html!,
          metadata: parsed.data,
          source,
        };
      } else {
        console.warn(`[Cache Refresh] No standards file found on GitHub. Falling back to local...`);
        result = await this.loadLocalProjectIdStandard();
      }

      console.log(`[Cache Refresh] Refresh completed successfully for standards (Timestamp: ${timestamp})`);

      entry.data = result;
      entry.source = result.source;
      entry.commitSha = commitSha;
      entry.lastChecked = Date.now();

      return result;

    } catch (error: any) {
      console.warn(`[Cache Refresh Error] GitHub unavailable, serving stale cache. Error: ${error.message}`);

      if (entry.data) {
        return entry.data;
      }

      console.log(`[Cache Refresh Fallback] No cached standards available. Serving local standards (Timestamp: ${timestamp})`);
      const fallbackResult = await this.loadLocalProjectIdStandard();
      entry.data = fallbackResult;
      entry.source = fallbackResult.source;
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
    let foundPath = "";
    for (const lp of localVariants) {
      try {
        markdownContent = await fs.promises.readFile(lp, "utf-8");
        foundPath = lp;
        break;
      } catch {}
    }

    if (!markdownContent) {
      markdownContent = "# Project ID Standards\n\nNo standards file found in workspace.";
    }

    const parsed = await safeParseMarkdown(markdownContent);
    if (!parsed.success) {
      console.error(`[File Parsing Diagnostics] Failed to parse local standards markdown.`);
      return {
        html: `<h2>Parsing Error</h2><p>Failed to parse local standards markdown.</p>`,
        metadata: {},
        source: "local_error",
      };
    }

    console.log(`[Project Parsing] Type: Project Standards (Local fallback)`);
    console.log(`[Project Parsing] Filename: ${foundPath || "Fallback Template"}`);
    console.log(`[Project Parsing] Markdown Length: ${markdownContent.length} characters`);

    return {
      html: parsed.html!,
      metadata: parsed.data,
      source: "local",
    };
  }
}

export const gitHubContentCache = new GitHubContentCache();
