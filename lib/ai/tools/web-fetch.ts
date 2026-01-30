import { tool } from "ai";
import { z } from "zod";

export const webFetch = tool({
  description:
    "Fetch and extract content from a specific URL. Use this to read articles, documentation, web pages, or any online content. Returns the main text content from the page.",
  inputSchema: z.object({
    url: z
      .string()
      .url()
      .describe(
        "The full URL to fetch (must include http:// or https://)"
      ),
    includeLinks: z
      .boolean()
      .default(false)
      .describe("Whether to include links found in the content"),
  }),
  needsApproval: false,
  execute: async ({ url, includeLinks = false }) => {
    try {
      // Validate URL format
      const urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return {
          error: "Only HTTP and HTTPS URLs are supported",
          url,
        };
      }

      // Fetch the page
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        return {
          error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
          url,
        };
      }

      const contentType = response.headers.get("content-type") || "";

      // Check if it's HTML content
      if (!contentType.includes("text/html")) {
        return {
          error: `URL does not return HTML content (got: ${contentType})`,
          url,
          suggestion: "This tool only works with HTML web pages",
        };
      }

      const html = await response.text();

      // Basic HTML parsing to extract text content
      // Remove script and style tags
      let cleanedHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

      // Extract text content from HTML tags
      const textContent = cleanedHtml
        .replace(/<[^>]+>/g, " ") // Remove HTML tags
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract meta description
      const descMatch = html.match(
        /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
      );
      const description = descMatch ? descMatch[1].trim() : null;

      // Extract links if requested
      let links: string[] = [];
      if (includeLinks) {
        const linkMatches = html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi);
        links = Array.from(linkMatches, (match) => match[1])
          .filter((link) => link.startsWith("http"))
          .slice(0, 20); // Limit to 20 links
      }

      // Limit content length to avoid overwhelming the context
      const maxLength = 8000;
      const truncatedContent =
        textContent.length > maxLength
          ? textContent.substring(0, maxLength) + "... (content truncated)"
          : textContent;

      return {
        url,
        title,
        description,
        content: truncatedContent,
        contentLength: textContent.length,
        truncated: textContent.length > maxLength,
        links: includeLinks ? links : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            error: "Request timed out after 10 seconds",
            url,
          };
        }
        return {
          error: `Failed to fetch content: ${error.message}`,
          url,
        };
      }
      return {
        error: "An unknown error occurred while fetching the URL",
        url,
      };
    }
  },
});
