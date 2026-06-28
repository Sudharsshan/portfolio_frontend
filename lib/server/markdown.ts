import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export interface ParseResult {
  success: boolean;
  data?: any;
  html?: string;
  error?: string;
  exception?: any;
  rawFrontMatter?: string;
}

/**
 * Parses markdown with frontmatter and converts body to HTML.
 */
export async function parseMarkdownToHtml(markdownContent: string): Promise<{ data: any; html: string }> {
  const { data, content } = matter(markdownContent);
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);

  return {
    data,
    html: String(processed),
  };
}

/**
 * Safe markdown wrapper that catches parsing failures and returns descriptive error information.
 */
export async function safeParseMarkdown(markdownContent: string): Promise<ParseResult> {
  let rawFrontMatter = "";
  try {
    // Attempt to extract front matter block for logging purposes if parsing fails
    const match = markdownContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (match) {
      rawFrontMatter = match[1];
    }

    const { data, html } = await parseMarkdownToHtml(markdownContent);
    return {
      success: true,
      data,
      html
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
      exception: err,
      rawFrontMatter
    };
  }
}
