import { describe, expect, it } from "vitest";
import { sitemapResponse } from "@/lib/sitemap-response";
import { seo } from "@/lib/seo";

describe("Public SEO configuration", () => {
  it("serves the six real public pages as XML, excluding administration", async () => {
    const response = sitemapResponse(new Request("https://igrejafiladelfiadaparaiba.com.br/sitemap.xml"));
    expect(response?.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
    const xml = new DOMParser().parseFromString(await response?.text() ?? "", "application/xml");
    expect(xml.querySelector("parsererror")).toBeNull();
    expect(Array.from(xml.querySelectorAll("loc"), node => node.textContent)).toEqual(
      ["/", "/igreja", "/historia", "/videos", "/eventos", "/contato"].map(path => `https://igrejafiladelfiadaparaiba.com.br${path}`),
    );
  });
  it("sets a self-referencing canonical homepage URL", () => {
    expect(seo("Igreja Filadélfia da Paraíba | João Pessoa", "Descrição", "/").links).toEqual([
      { rel: "canonical", href: "https://igrejafiladelfiadaparaiba.com.br/" },
    ]);
  });
  it("handles HEAD without HTML or a response body", async () => {
    const response = sitemapResponse(new Request("https://igrejafiladelfiadaparaiba.com.br/sitemap.xml", { method: "HEAD" }));
    expect(response?.status).toBe(200);
    expect(await response?.text()).toBe("");
  });
});