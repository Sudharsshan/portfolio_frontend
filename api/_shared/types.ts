export interface ProjectsResponse {
  projects: any[];
  source: string;
}

export interface MarkdownResponse {
  html: string;
  metadata: any;
  source: string;
}

export interface CacheEntry<T> {
  data: T | null;
  commitSha: string | null;
  lastChecked: number;
  source: string;
  pendingRefresh: Promise<T> | null;
}

export interface CacheStore {
  projects: CacheEntry<ProjectsResponse>;
  internship: CacheEntry<MarkdownResponse>;
  standard: CacheEntry<MarkdownResponse>;
}
