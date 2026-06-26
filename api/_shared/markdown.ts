import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

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
