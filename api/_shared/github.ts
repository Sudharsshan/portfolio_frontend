export async function fetchLatestCommitSha(
  owner: string,
  repo: string,
  pathStr: string,
  token: string
): Promise<string | null> {
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
      const commits = (await res.json()) as Array<{ sha: string }>;
      if (commits && commits.length > 0) {
        return commits[0].sha;
      }
    }
  } catch (err: any) {
    console.warn(`[Cache] Failed to fetch latest commit SHA for path "${pathStr}":`, err.message);
  }
  return null;
}

export async function fetchDirectoryContents(
  owner: string,
  repo: string,
  pathStr: string,
  token: string
): Promise<Array<{ name: string; type: string }> | null> {
  try {
    const folderUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathStr}`;
    const res = await fetch(folderUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Sudharsshan-Portfolio-App",
      },
    });

    if (res.ok) {
      return (await res.json()) as Array<{ name: string; type: string }>;
    }
  } catch (err: any) {
    console.warn(`[Cache] Failed to fetch directory contents for "${pathStr}":`, err.message);
  }
  return null;
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  pathStr: string,
  token: string
): Promise<string | null> {
  try {
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathStr}`;
    const res = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Sudharsshan-Portfolio-App",
      },
    });

    if (res.ok) {
      const fileData = (await res.json()) as { content: string };
      return Buffer.from(fileData.content, "base64").toString("utf-8");
    }
  } catch (err: any) {
    // Soft error / variant checking
  }
  return null;
}
