import sitemapXML from "../../public/sitemap.xml?raw";

// Keep the requested static file as the single source of sitemap entries.
export function sitemapResponse(request: Request): Response | undefined {
  if (new URL(request.url).pathname !== "/sitemap.xml") return undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  return new Response(request.method === "HEAD" ? null : sitemapXML, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}