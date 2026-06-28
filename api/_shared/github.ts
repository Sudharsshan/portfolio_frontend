import { DiagnosticsError } from "./types";

/**
 * Reusable helper that executes fetch, verifies response.ok, parses JSON,
 * logs request and failures, and throws highly descriptive errors.
 */
export async function safeFetchGitHub<T>(
  url: string,
  token: string,
  endpointName: string,
  step: string,
  allow404 = false
): Promise<T | null> {
  // Extract repository owner/name from URL for logging
  const repoMatch = url.match(/repos\/([^\/]+)\/([^\/]+)/);
  const repoString = repoMatch ? `${repoMatch[1]}/${repoMatch[2]}` : "Unknown Repo";

  console.log(`[GitHub Request] Initiating request to "${endpointName}"`);
  console.log(`[GitHub Request] Repository: ${repoString}`);
  console.log(`[GitHub Request] Requested URL: ${url}`);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Sudharsshan-Portfolio-App",
      },
    });
  } catch (err: any) {
    const errorMsg = `Connection error to GitHub at URL ${url}: ${err.message || err}`;
    console.error(`[GitHub Request Failed] ${errorMsg}`);
    throw new DiagnosticsError(errorMsg, step, {
      url,
      repository: repoString,
      endpoint: endpointName,
    });
  }

  console.log(`[GitHub Request] Returned status code: ${res.status}`);
  console.log(`[GitHub Request] Returned status text: ${res.statusText}`);

  if (!res.ok) {
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch (_) {}

    console.error(`[GitHub Request Error] Non-200 response:`);
    console.error(`  Endpoint: ${endpointName}`);
    console.error(`  Status: ${res.status}`);
    console.error(`  Body: ${bodyText}`);

    if (res.status === 404 && allow404) {
      console.log(`[GitHub Request] 404 allowed for "${endpointName}"`);
      return null;
    }

    throw new DiagnosticsError(
      `GitHub returned HTTP ${res.status} (${res.statusText}) while requesting ${endpointName}.`,
      step,
      {
        endpoint: endpointName,
        status: res.status,
        body: bodyText,
        repository: repoString,
        path: url,
      }
    );
  }

  try {
    const data = await res.json() as T;
    return data;
  } catch (err: any) {
    const errorMsg = `Failed to parse JSON response from GitHub for ${endpointName}: ${err.message || err}`;
    console.error(`[GitHub Request Error] ${errorMsg}`);
    throw new DiagnosticsError(errorMsg, step, {
      url,
      repository: repoString,
      endpoint: endpointName,
    });
  }
}

export async function fetchLatestCommitSha(
  owner: string,
  repo: string,
  pathStr: string,
  token: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(pathStr)}&per_page=1`;
  const data = await safeFetchGitHub<Array<{ sha: string }>>(
    url,
    token,
    `Commit SHA for path: ${pathStr}`,
    "Fetching latest commit SHA"
  );
  if (data && data.length > 0) {
    return data[0].sha;
  }
  return null;
}

export async function fetchDirectoryContents(
  owner: string,
  repo: string,
  pathStr: string,
  token: string
): Promise<Array<{ name: string; type: string }> | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${pathStr}`;
  const data = await safeFetchGitHub<Array<{ name: string; type: string }>>(
    url,
    token,
    `Directory contents for: ${pathStr}`,
    "Fetching directory contents"
  );
  return data;
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  pathStr: string,
  token: string,
  allow404 = false
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${pathStr}`;
  const data = await safeFetchGitHub<{ content: string }>(
    url,
    token,
    `File content for: ${pathStr}`,
    "Downloading file content",
    allow404
  );
  if (data && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}
