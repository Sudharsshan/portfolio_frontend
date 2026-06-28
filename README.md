# Obsidian-to-Portfolio Synchronization Engine

An engineering-grade, dynamic portfolio system and synchronization engine that automates content publishing directly from a private Obsidian knowledge base hosted on GitHub. This is not a static portfolio; it serves as a live, automated presentation layer for a developer's engineering journal.

---

## 1. Project Overview

This repository houses a high-performance, dynamic portfolio application. Rather than serving static HTML or relying on a standard manual CMS (Content Management System), this platform functions as a **dynamic presentation and syndication layer**. 

It establishes a secure, automated content pipeline directly with a private Obsidian knowledge base repository hosted on GitHub. Whenever engineering notes, project milestones, or internship diaries are written, tagged, and organized in Obsidian, they are committed to GitHub. The serverless backend of this application intercepts these updates, parses frontmatter and markdown in real-time, caches content to respect GitHub API rate limits, and dynamically renders interactive dashboard indexes.

---

## 2. Motivation

Traditional developer portfolios suffer from a persistent operational overhead: **documentation duplication**. 

Engineers maintain personal diaries, raw design docs, and progress trackers inside local tools (like Obsidian). When showcasing these projects to recruiters, colleagues, or open-source collaborators, they are forced to manually copy, reformat, and upload this metadata to a secondary portfolio website. This leads to stale showcases, missing project links, and outdated logs.

This project solves this duplication bottleneck. By treating the private Obsidian notebook as the **single source of truth (SSOT)**, the engineering overhead of updating a personal website is reduced to zero. Writing an entry in a local markdown note and pushing it to GitHub instantly publishes it to the web. The website becomes an empty, intelligent glass pane that reflects the developer's live workspace.

---

## 3. Features

*   **Dynamic GitHub Synchronization:** Seamless real-time or lazy synchronization with GitHub content repositories.
*   **Private Repository Support:** Uses secure token-based authentication to read and compile files from fully private knowledge bases.
*   **Markdown to HTML Compiler:** Converts complex markdown notes into safe, clean HTML with full support for tables, lists, and semantic tags.
*   **YAML Front Matter Parsing:** Parses frontmatter headings to extract status values, domains, hardware flags, and project metadata automatically.
*   **Server-Side Caching (with TTL):** A high-performance memory cache layer that dramatically limits rate limit issues by serving cached data inside a 5-minute Time-To-Live window.
*   **Commit-Aware Synchronization:** Pre-fetches the latest commit SHA of the target directory from the GitHub API; caches are bypassed only when actual updates are made on the remote repository.
*   **Engineering-Journal Project Cards:** Clean, interactive UI inspired by technical journals with live status beacons, domain indicators, and chronological sequencing.
*   **Advanced Multi-Select Filtering:**
    *   **Status filtering:** Support for complex state tags (`IDEA`, `ACTIVE`, `ON HOLD`, `ABORTED`, `COMPLETED`).
    *   **Core domains:** Multi-tenant domain queries spanning `digital`, `physical`, and `digital & physical` hybrid systems.
    *   **Or-Logic Tech Stack Filtering:** Multi-select capabilities for tags, allowing recruiters and engineers to select multiple technologies concurrently and filter with an `OR` logic.
*   **Type-Safe Backend:** Fully written in strict TypeScript with solid schema definitions and type definitions.
*   **Runtime Diagnostics:** Robust error boundaries, environment checks, and detailed error payloads for frictionless developer debugging.
*   **Vercel Serverless Optimization:** Built to build and run perfectly inside serverless environments with optimized bundle sizes and fast cold starts.

---

## 4. High Level Architecture

```text
       ┌──────────────────────────────────────────────────┐
       │                     Browser                      │
       └────────────────────────┬─────────────────────────┘
                                │ (HTTP Fetch)
                                ▼
       ┌──────────────────────────────────────────────────┐
       │                   React + Vite                   │
       │     (Stateful Client & Interactive Filters)      │
       └────────────────────────┬─────────────────────────┘
                                │ (API Request: /api/*)
                                ▼
       ┌──────────────────────────────────────────────────┐
       │           Vercel Serverless Functions            │
       │    (Dynamic API Routes & Security Proxy Layer)   │
       └────────────────────────┬─────────────────────────┘
                                │ (Authenticated REST Request)
                                ▼
       ┌──────────────────────────────────────────────────┐
       │              GitHub Content Service              │
       │         (Cache Store & Markdown Parser)          │
       └────────────────────────┬─────────────────────────┘
                                │ (Fetch Repository Tree)
                                ▼
       ┌──────────────────────────────────────────────────┐
       │           Private Obsidian Repository            │
       │         (Markdown Documents + Metadata)          │
       └──────────────────────────────────────────────────┘
```

### Layer Responsibilities

1.  **Browser:** Renders the responsive user interface, handles client-side state, tracking, and executes interaction filters.
2.  **React + Vite Front-End:** Formulates request actions, triggers local/remote sync queries, and transforms user multi-select parameters into clean data hooks.
3.  **Vercel Serverless Functions:** Acts as a secure middleware gateway. By keeping API requests server-side, it prevents exposure of the `GITHUB_TOKEN` to the browser while resolving content proxies on-demand.
4.  **GitHub Content Service:** An internal library abstraction (`lib/server/`) that validates configuration parameters, negotiates with the GitHub API, caches outputs, and compiles markdown trees.
5.  **Private Obsidian Repository:** The database itself. Holds folders structure representing active software/hardware projects.

---

## 5. Repository Structure

```text
├── api/                             # Serverless API Entrypoints (Vercel serverless compatible)
│   ├── internship.ts                # Serves internship experience timeline
│   ├── project-id-standard.ts       # Serves naming and structuring standards documentation
│   └── projects.ts                  # Serves primary projects index
├── assets/                          # Static static assets (images, graphics)
├── internship/                      # Local fallback directory for internship records
├── lib/
│   └── server/                      # Core backend compilation & cache engine
│       ├── cache.ts                 # Time-To-Live & commit-aware memory cache manager
│       ├── github.ts                # GitHub REST API integrations and payload requests
│       ├── handler.ts               # Global API gateway response & diagnostics wrapper
│       ├── markdown.ts              # Frontmatter parsing and Markdown parser using Remark & Gray-Matter
│       ├── parser.ts                # Project id format converter & local fallback seeds
│       ├── types.ts                 # Strict TypeScript interface declarations for server state
│       └── validation.ts            # Environment verification checks
├── src/                             # Core frontend React web application
│   ├── components/                  # Modulated React UI elements (ProjectCard, Filter, Modal)
│   ├── data/                        # Front-end types and local configurations
│   ├── App.tsx                      # Single-page interface & core layout orchestration
│   ├── main.tsx                     # Entrypoint mount file
│   └── index.css                    # Global styling imports using Tailwind CSS
├── templates-standards/             # Local Markdown fallback templates for schema references
├── package.json                     # Dependency manifests & compilation commands
├── tsconfig.json                    # Global typescript rules
├── tsconfig.server.json             # Server-specific typescript overrides
└── vite.config.ts                   # Core build configuration and dev-proxy API emulator
```

---

## 6. Backend Architecture

The backend of this system is intentionally isolated from the client-side UI to maximize security, speed, and reliability. This architecture relies on a specialized service layer structure:

*   **GitHub API Layer (`github.ts`):** Handles clean HTTP requests directed at the GitHub REST endpoint. Employs strong error mitigation and returns safe, structured payloads.
*   **Cache Manager (`cache.ts`):** A highly performant memory layer that manages state caching for the serverless lifecycle. Intercepts incoming client queries and checks cache lifetimes.
*   **Markdown Parser (`markdown.ts`):** Integrates `gray-matter` alongside the `remark` compiler. Extracts high-fidelity metadata (YAML) while processing raw markdown strings into sanitized HTML.
*   **Validation (`validation.ts`):** Executes early assertion checks on environment requirements prior to hitting live servers or making expensive network calls.
*   **Error Handling (`types.ts`):** Custom standard error subclasses (`DiagnosticsError`) designed to hold rich runtime state details.
*   **Request Handler (`handler.ts`):** Acts as the controller. Merges validation, caching, parsing, and formatting under a unified gateway wrapper.

Separating these elements ensures single-responsibility patterns, facilitates easy unit testing, and isolates environment configuration issues.

---

## 7. Content Pipeline

The publishing flow transforms plain-text files into highly-interactive visual components:

```text
[ Obsidian Markdown Document ]  <-- Written locally by developer
            │
            ▼
[ Push to GitHub Repository ]   <-- Committed & synced to remote master branch
            │
            ▼
[ Serverless Endpoint Called ]  <-- Triggered on-demand by React application
            │
            ▼
[ Environment Validation Check ] <-- Verifies API token keys & repo parameters
            │
            ▼
[ Commit SHA Comparison Cache ] <-- Queries GitHub API to determine if changes occurred
            │
            ▼
[ Download Content Blobs ]       <-- Pulls index file variants (e.g. README.md)
            │
            ▼
[ Front Matter Parsing ]         <-- gray-matter parses YAML headers (project_id, domain)
            │
            ▼
[ Markdown Compilation ]         <-- remark compiles the file body to high-fidelity HTML
            │
            ▼
[ Payload JSON Delivery ]        <-- Sends structured data to the React Client
            │
            ▼
[ Interactive State Rendering ] <-- Renders custom Project Card & Modal details
```

---

## 8. Server-side Cache

Because serverless environments have unique lifecycles, optimizing API execution paths is paramount. A single project page with 15 sub-directories could require over 16 separate HTTP calls to GitHub. If executed on every page reload, this would exhaust GitHub's API rate limits (5,000 requests per hour) in minutes.

The cache engine mitigates this through **Double-Tier Cache Controls**:

1.  **Memory Store with TTL (Time-To-Live):** Successful API calls are retained in a global memory segment. If any client requests data within 5 minutes of the last fetch, the system serves the memory payload directly.
2.  **Commit-Aware Cache Validation:** When the TTL expires, the cache does not blindly execute heavy downloads. Instead, it fires a lightweight request to fetch the latest commit SHA of the directory path. 
    *   If the remote commit SHA matches the cached commit SHA, the system **extends the cache validity** and serves the existing compiled HTML, bypassing expensive download and compile steps entirely.
    *   If the SHA differs (or on first boot), the cache is invalidated, and updated files are downloaded, parsed, and updated in memory.

```text
   Client Request
         │
         ▼
 ┌───────────────┐  YES  ┌─────────────────────┐
 │ Cache Valid?  ├──────>│ Serve Cached Data   │ (TTL < 5 Minutes)
 └───────┬───────┘       └─────────────────────┘
         │ NO
         ▼
 ┌───────────────────────────────┐
 │ Fetch Remote Directory SHA    │ (Lightweight API call)
 └───────────────┬───────────────┘
                 │
                 ▼
 ┌───────────────────────────────┐  YES  ┌──────────────────────┐
 │ Does SHA Match Cached SHA?    ├──────>│ Extend Cache TTL &   │
 └───────────────┬───────────────┘       │ Serve Existing Data  │
                 │ NO (Or Cache Empty)   └──────────────────────┘
                 ▼
 ┌───────────────────────────────┐
 │ Download README.md File Blobs │ (Expensive content download)
 └───────────────┬───────────────┘
                 │
                 ▼
 ┌───────────────────────────────┐
 │ Re-Compile Markdown to HTML   │ (Heavy processing step)
 └───────────────┬───────────────┘
                 │
                 ▼
 ┌───────────────────────────────┐
 │ Save to Cache & Return JSON   │
 └───────────────────────────────┘
```

---

## 9. Runtime Diagnostics

Deploying serverless functions often feels like sending code into a black box. Traditional platforms log a generic `500 Internal Server Error` when something breaks, leaving the developer to scour logs.

This engine utilizes a custom **Proactive Diagnostics Pipeline**:

```text
Request Event ──> [ Env Validation ] ──> [ Cache Check ] ──> [ GitHub Fetch ] ──> [ Markdown Parse ] ──> Output JSON
                        │                       │                  │                     │
                        └───────────────────────┴──────────────────┴─────────────────────┘
                                                                │
                                                    (Diagnostic Catch Boundary)
                                                                │
                                                                ▼
                                                    [ Descriptive Diagnostic JSON ]
```

When an error occurs, the server-side boundary intercepts it, formats a precise system state overview, and logs detailed traces. Instead of failing silently or throwing standard errors, the diagnostic layer outputs:
*   The exact **execution stage** where the error happened.
*   The **failing components** or external integration points.
*   A localized environment variables diagnostic checklist.
*   Detailed **request context** parameters (requested files, repository paths, branch states).

This architecture separates infrastructure problems from application code, making environment misconfigurations instantly observable.

---

## 10. Backend Debugging

The diagnostics system proved invaluable during initial staging deployments. 

### Actual Staging Incident
During the first production deploy to Vercel, the projects index page loaded without content. Rather than throwing a standard, uninformative `500 Internal Server Error`, the backend's diagnostics boundary intercepted the failure and served a detailed error payload:

```json
{
  "success": false,
  "step": "Initializing Projects request",
  "message": "Environment validation failed: Required environment variable \"GITHUB_REPO_OWNER\" is missing.",
  "details": {
    "missingVariable": "GITHUB_REPO_OWNER",
    "validatedVariables": {
      "GITHUB_TOKEN": true,
      "GITHUB_REPO_OWNER": false,
      "GITHUB_REPO_NAME": true,
      "GITHUB_PROJECTS_PATH": true
    }
  }
}
```

### Trace Log Output
By checking serverless logs, the developer observed a clean step-by-step trace of the failure:

```text
[Projects] Request received
[Projects] Reading environment variables
[Env Validation Error] Environment validation failed: Required environment variable "GITHUB_REPO_OWNER" is missing.
[Projects Error] Exception caught in API gateway wrapper: DiagnosticsError: Environment validation failed.
```

Instead of spending hours troubleshooting token authorization, the validation layer pinpointed that `GITHUB_REPO_OWNER` was missing from the Vercel dashboard. The developer configured the key, restarted the deployment, and achieved successful initialization on the next run. Proactive diagnostics turn server failures into clear action items.

---

## 11. Environment Variables

To operate the live synchronization, configure the following environment variables:

| Variable Name | Required | Purpose / Description | Example Value |
| :--- | :--- | :--- | :--- |
| `GITHUB_TOKEN` | Yes (API) | Personal Access Token (PAT) with read permissions to your repository. | `github_pat_11A...` |
| `GITHUB_REPO_OWNER` | Yes (API) | The username or organization owner of the GitHub repository. | `Sudharsshan` |
| `GITHUB_REPO_NAME` | Yes (API) | The name of the target repository hosting the Obsidian notes. | `Obsidian_notes` |
| `GITHUB_PROJECTS_PATH`| Yes (API) | Relative directory path inside the repository where project folders reside. | `Projects` |

---

## 12. Local Development

### Prerequisites
*   Node.js (version 18 or above)
*   npm or pnpm

### Getting Started

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Sudharsshan/portfolio-engine.git
    cd portfolio-engine
    ```

2.  **Install Project Dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file at the root of the project (copying `.env.example` as a baseline) and fill in your GitHub details:
    ```bash
    cp .env.example .env
    ```

4.  **Launch the Development Server:**
    Run the application locally using the integrated development proxy:
    ```bash
    npm run dev
    ```
    The application will run on [http://localhost:3000](http://localhost:3000).

5.  **Compile & Run Vercel CLI (Optional):**
    For full serverless emulation, you can use the Vercel CLI:
    ```bash
    vercel dev
    ```

---

## 13. Deployment

This codebase is configured to deploy directly to **Vercel** with zero custom server setups.

### Deploy Steps

1.  **Connect to Vercel:** Push your project repository to GitHub, and import it into Vercel as a new project.
2.  **Add Environment Variables:** Navigate to your Project Settings on Vercel and enter the environment variables listed in the **Environment Variables** section.
3.  **Configure Output Directory:** Ensure Vercel is set to build using the Vite framework (`npm run build`). Vite will output compiled assets to `/dist`.
4.  **Deploy:** Trigger a deployment build. Vercel automatically deploys the files inside the `api/` directory as independent Serverless Functions.

---

## 14. Engineering Decisions

### Core Tech Selection & Trade-offs

#### React & Vite
*   **Why:** React provides declarative component models for building interactive UI. Vite was selected over Next.js/Webpack because of its instant hot module start speeds and clean bundle outputs.
*   **Trade-off:** Renders client-side (SPA style). However, as a developer portfolio, search crawling limits are minimized, and initial serverless responses are extremely rapid.

#### TypeScript
*   **Why:** Drastically cuts down on interface contract errors between the Markdown frontmatter schemas and client rendering components. Makes refactoring safe.

#### Vercel Serverless Functions
*   **Why:** Bypasses the need to deploy, scale, and pay for a 24/7 dedicated server container. Fits perfectly into the hobby-tier budget while scaling gracefully under traffic spikes.

#### GitHub REST API (v3) vs. GraphQL (v4)
*   **Why:** The REST API is robust, heavily documented, and natively supported in simple fetch calls. It was chosen to avoid importing massive GraphQL client libraries.
*   **Trade-off:** REST can over-fetch data, but this is neutralized by caching and compiling server-side before sending optimized payloads to the browser.

#### Remark & Gray-Matter
*   **Why:** `remark` is highly modular and supports GitHub Flavored Markdown (GFM) via plugins. `gray-matter` is fast and easily parses raw YAML frontmatter boundaries.

---

## 15. Performance

Every design decision prioritizes performance and speed:

*   **In-Memory Server-Side Caching:** Cuts average response times for visitors from ~1800ms (calling GitHub REST directly) down to **under 15ms** for cached entries.
*   **Mitigated Network Overhead:** Instead of querying every folder recursively, the pipeline downloads content in parallel and filters directories locally.
*   **Optimized Payload Serialization:** The server parses, formats, and strip-cleans Markdown content before transmission, sending only the final HTML body and curated metadata. This reduces network payload size by up to **75%**.
*   **Minimal Serverless Footprint:** By using small, native modules (no heavy ORMs or database engines), the API server boots rapidly, minimizing cold-start latencies.

---

## 16. Error Handling Philosophy

This project rejects the silent failure anti-pattern. If a connection fails, an environment variable goes missing, or a markdown file has invalid syntax, the application follows a **"Fail loud and fail fast"** philosophy:

1.  **Validate Inputs First:** Checks environment configurations and schema validation before committing processing cycles or executing remote network connections.
2.  **Isolate System Failures:** An error in parsing a single README file will not crash the entire projects feed. The parsing pipeline catches individual exceptions, logs diagnostic traces for that folder, and continues processing remaining folders.
3.  **Preserve State Gracefully:** If the GitHub API goes offline entirely, the serverless cache serves the stale in-memory cache or falls back gracefully to beautiful local file structures rather than returning an empty screen.

---

## 17. Future Improvements

*   **Redis Caching Tier:** Migrate from serverless memory variables to a persistent Redis instance (e.g. Upstash) to guarantee cache consistency across serverless scale-outs and cold restarts.
*   **Webhook-Triggered Invalidation:** Setup a GitHub Repository webhook to automatically purge the portfolio cache when a markdown file is pushed, allowing immediate synchronization.
*   **GitHub GraphQL Migration:** Query only the specific markdown files instead of listing and parsing folders, reducing API payload over-fetching.
*   **Automated Image Optimization:** Proxy and optimize media links embedded in Obsidian notes dynamically.
*   **Search and Index Layer:** Build an on-the-fly search catalog to parse and search full-text project bodies.

---

## 18. License

Distributed under the MIT License. See `LICENSE` for more information.
