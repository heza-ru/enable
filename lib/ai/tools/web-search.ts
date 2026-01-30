import { tool } from "ai";
import { z } from "zod";

export const webSearch = tool({
  description:
    "Search the internet for current information, news, data, research, or any topic. Use this when you need up-to-date information that you might not have in your training data.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "The search query. Be specific and include relevant keywords for better results."
      ),
    maxResults: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe("Maximum number of search results to return (1-10)"),
  }),
  needsApproval: false,
  execute: async ({ query, maxResults = 5 }) => {
    try {
      console.log("[WebSearch] Searching for:", query);

      // Try SearXNG first (most reliable)
      try {
        const searxResponse = await fetch(
          `https://searx.be/search?q=${encodeURIComponent(query)}&format=json&pageno=1`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (searxResponse.ok) {
          const searxData = await searxResponse.json();
          console.log("[WebSearch] SearXNG returned:", searxData.results?.length || 0, "results");

          if (searxData.results && searxData.results.length > 0) {
            const results = searxData.results
              .slice(0, maxResults)
              .map((result: any) => ({
                title: result.title || "Untitled",
                url: result.url || "",
                content: result.content || result.description || "",
                engine: result.engine || "unknown",
              }))
              .filter((r: any) => r.url); // Filter out results without URLs

            if (results.length > 0) {
              return {
                query,
                results,
                count: results.length,
                source: "searx",
              };
            }
          }
        }
      } catch (searxError) {
        console.warn("[WebSearch] SearXNG failed:", searxError);
      }

      // Fallback 1: Try DuckDuckGo HTML API
      try {
        const ddgResponse = await fetch(
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (ddgResponse.ok) {
          const html = await ddgResponse.text();
          
          // Simple HTML parsing for DuckDuckGo results
          const results = [];
          const resultRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
          const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g;
          
          let match;
          let snippetMatch;
          const urls = [];
          const titles = [];
          const snippets = [];
          
          while ((match = resultRegex.exec(html)) !== null && urls.length < maxResults) {
            urls.push(match[1]);
            titles.push(match[2]);
          }
          
          while ((snippetMatch = snippetRegex.exec(html)) !== null && snippets.length < maxResults) {
            snippets.push(snippetMatch[1]);
          }
          
          for (let i = 0; i < Math.min(urls.length, maxResults); i++) {
            results.push({
              title: titles[i] || "Result",
              url: urls[i],
              content: snippets[i] || "",
            });
          }

          if (results.length > 0) {
            console.log("[WebSearch] DuckDuckGo returned:", results.length, "results");
            return {
              query,
              results,
              count: results.length,
              source: "duckduckgo",
            };
          }
        }
      } catch (ddgError) {
        console.warn("[WebSearch] DuckDuckGo failed:", ddgError);
      }

      // Fallback 2: Try alternative SearXNG instance
      try {
        const altSearxResponse = await fetch(
          `https://searx.work/search?q=${encodeURIComponent(query)}&format=json&pageno=1`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; EnableAI/1.0)",
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (altSearxResponse.ok) {
          const altSearxData = await altSearxResponse.json();
          
          if (altSearxData.results && altSearxData.results.length > 0) {
            const results = altSearxData.results
              .slice(0, maxResults)
              .map((result: any) => ({
                title: result.title || "Untitled",
                url: result.url || "",
                content: result.content || result.description || "",
              }))
              .filter((r: any) => r.url);

            if (results.length > 0) {
              console.log("[WebSearch] Alternative SearXNG returned:", results.length, "results");
              return {
                query,
                results,
                count: results.length,
                source: "searx-alt",
              };
            }
          }
        }
      } catch (altError) {
        console.warn("[WebSearch] Alternative SearXNG failed:", altError);
      }

      // If all attempts failed, return a helpful message
      console.error("[WebSearch] All search attempts failed for query:", query);
      return {
        query,
        results: [],
        error: "Unable to perform web search at this time. All search providers are unavailable.",
        suggestion: "Try using webFetch with a specific URL if you know the source, or rephrase your query and try again.",
        count: 0,
      };
    } catch (error) {
      console.error("[WebSearch] Unexpected error:", error);
      return {
        query,
        results: [],
        error: `Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        suggestion: "The search service may be temporarily unavailable. Try again in a moment.",
        count: 0,
      };
    }
  },
});
