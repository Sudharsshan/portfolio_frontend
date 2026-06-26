import fs from "fs";
import path from "path";
import { CacheStore, ProjectsResponse, MarkdownResponse } from "./types";
import { fallbackProjects, parseProjectMarkdown } from "./parser";
import { fetchLatestCommitSha, fetchDirectoryContents, fetchFileContent } from "./github";
import { parseMarkdownToHtml } from "./markdown";

// Since serverless environments can re-initialize modules, we'll store the cache instance
// in a module-scoped variable that persists across warm invocations.
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
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes safety fallback TTL

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

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "fallback") {
        console.log("[Cache] Serving cached response.");
        return entry.data;
      }
      return this.refreshProjects();
    }

    // Safety TTL check
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
    const store = this.getCache();
    const entry = store.internship;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "local") {
        console.log("[Cache] Serving cached response.");
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
    const store = this.getCache();
    const entry = store.standard;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      if (entry.data && entry.source === "local") {
        console.log("[Cache] Serving cached response.");
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
    const store = this.getCache();
    const entry = store.projects;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_REPO_OWNER || "Sudharsshan";
    const REPO = process.env.GITHUB_REPO_NAME || "Obsidian_notes";
    const PROJECTS_PATH = process.env.GITHUB_PROJECTS_PATH || "Projects";

    if (!GITHUB_TOKEN) {
      console.log("[Cache] Cold start. No GITHUB_TOKEN configured. Serving fallback projects.");
      const result = { projects: fallbackProjects, source: "fallback" };
      entry.data = result;
      entry.source = "fallback";
      entry.lastChecked = Date.now();
      return result;
    }

    try {
      // 1. Freshness verification using latest commit SHA
      const commitSha = await fetchLatestCommitSha(OWNER, REPO, PROJECTS_PATH, GITHUB_TOKEN);
      
      if (commitSha && entry.commitSha === commitSha && entry.data) {
        console.log("[Cache] Repository unchanged.");
        console.log("[Cache] Serving cached response.");
        entry.lastChecked = Date.now();
        return entry.data;
      }

      if (entry.data) {
        console.log("[Cache] Repository updated.");
      } else {
        console.log("[Cache] Cold start.");
      }

      // 2. Fetch folder directory contents
      const folderData = await fetchDirectoryContents(OWNER, REPO, PROJECTS_PATH, GITHUB_TOKEN);
      if (!folderData) {
        throw new Error("Could not fetch directory contents from GitHub.");
      }

      const directories = folderData.filter((item) => item.type === "dir").map((item) => item.name);
      const projects: any[] = [];

      await Promise.all(
        directories.map(async (folder) => {
          const fileVariants = ["ReadMe.md", "README.md", "Readme.md", "readme.md"];
          let readmeContent: string | null = null;

          for (const variant of fileVariants) {
            const pathStr = `${PROJECTS_PATH}/${encodeURIComponent(folder)}/${variant}`;
            readmeContent = await fetchFileContent(OWNER, REPO, pathStr, GITHUB_TOKEN);
            if (readmeContent) break;
          }

          if (readmeContent) {
            const parsed = await parseProjectMarkdown(folder, readmeContent);
            if (parsed) {
              projects.push(parsed);
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

      entry.data = finalData;
      entry.source = finalSource;
      entry.commitSha = commitSha;
      entry.lastChecked = Date.now();

      return finalData;

    } catch (error: any) {
      console.warn(`[Cache] GitHub unavailable, serving stale cache. Error: ${error.message}`);
      
      if (entry.data) {
        return entry.data;
      }

      console.log("[Cache] No cached projects available. Serving fallback projects.");
      const fallbackResult = { projects: fallbackProjects, source: "fallback_error" };
      entry.data = fallbackResult;
      entry.source = "fallback_error";
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

    if (!GITHUB_TOKEN) {
      console.log("[Cache] Cold start. No GITHUB_TOKEN configured. Serving local internship.");
      const result = await this.loadLocalInternship();
      entry.data = result;
      entry.source = result.source;
      entry.lastChecked = Date.now();
      return result;
    }

    try {
      // 1. Check repo freshness
      const commitSha = await fetchLatestCommitSha(OWNER, REPO, INTERNSHIP_PATH, GITHUB_TOKEN) ||
                        await fetchLatestCommitSha(OWNER, REPO, "internship", GITHUB_TOKEN);

      if (commitSha && entry.commitSha === commitSha && entry.data) {
        console.log("[Cache] Repository unchanged.");
        console.log("[Cache] Serving cached response.");
        entry.lastChecked = Date.now();
        return entry.data;
      }

      if (entry.data) {
        console.log("[Cache] Repository updated.");
      } else {
        console.log("[Cache] Cold start.");
      }

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
        const fileData = await fetchFileContent(OWNER, REPO, variant, GITHUB_TOKEN);
        if (fileData) {
          markdownContent = fileData;
          source = "github";
          break;
        }
      }

      let result: MarkdownResponse;

      if (markdownContent) {
        const parsed = await parseMarkdownToHtml(markdownContent);
        result = {
          html: parsed.html,
          metadata: parsed.data,
          source,
        };
      } else {
        result = await this.loadLocalInternship();
      }

      console.log("[Cache] Refresh completed.");

      entry.data = result;
      entry.source = result.source;
      entry.commitSha = commitSha;
      entry.lastChecked = Date.now();

      return result;

    } catch (error: any) {
      console.warn(`[Cache] GitHub unavailable, serving stale cache. Error: ${error.message}`);

      if (entry.data) {
        return entry.data;
      }

      console.log("[Cache] No cached internship available. Serving local internship.");
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

    const parsed = await parseMarkdownToHtml(markdownContent);
    return {
      html: parsed.html,
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

    if (!GITHUB_TOKEN) {
      console.log("[Cache] Cold start. No GITHUB_TOKEN configured. Serving local project standards.");
      const result = await this.loadLocalProjectIdStandard();
      entry.data = result;
      entry.source = result.source;
      entry.lastChecked = Date.now();
      return result;
    }

    try {
      const commitSha = await fetchLatestCommitSha(OWNER, REPO, STANDARD_PATH, GITHUB_TOKEN);

      if (commitSha && entry.commitSha === commitSha && entry.data) {
        console.log("[Cache] Repository unchanged.");
        console.log("[Cache] Serving cached response.");
        entry.lastChecked = Date.now();
        return entry.data;
      }

      if (entry.data) {
        console.log("[Cache] Repository updated.");
      } else {
        console.log("[Cache] Cold start.");
      }

      const fileVariants = [
        "templates-standards/PROJECT_ID_STANDARD.md",
        "templates-standards/project_id_standard.md",
      ];

      let markdownContent = "";
      let source = "local";

      for (const variant of fileVariants) {
        const fileData = await fetchFileContent(OWNER, REPO, variant, GITHUB_TOKEN);
        if (fileData) {
          markdownContent = fileData;
          source = "github";
          break;
        }
      }

      let result: MarkdownResponse;

      if (markdownContent) {
        const parsed = await parseMarkdownToHtml(markdownContent);
        result = {
          html: parsed.html,
          metadata: parsed.data,
          source,
        };
      } else {
        result = await this.loadLocalProjectIdStandard();
      }

      console.log("[Cache] Refresh completed.");

      entry.data = result;
      entry.source = result.source;
      entry.commitSha = commitSha;
      entry.lastChecked = Date.now();

      return result;

    } catch (error: any) {
      console.warn(`[Cache] GitHub unavailable, serving stale cache. Error: ${error.message}`);

      if (entry.data) {
        return entry.data;
      }

      console.log("[Cache] No cached standards available. Serving local standards.");
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
    for (const lp of localVariants) {
      try {
        markdownContent = await fs.promises.readFile(lp, "utf-8");
        break;
      } catch {}
    }

    if (!markdownContent) {
      markdownContent = "# Project ID Standards\n\nNo standards file found in workspace.";
    }

    const parsed = await parseMarkdownToHtml(markdownContent);
    return {
      html: parsed.html,
      metadata: parsed.data,
      source: "local",
    };
  }
}

export const gitHubContentCache = new GitHubContentCache();
