export const SITE_URL = "https://igrejafiladelfiadaparaiba.com.br";

export const seo = (title: string, description: string, path?: string) => {
  const url = path !== undefined ? `${SITE_URL}${path}` : undefined;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(url ? [{ property: "og:url", content: url }] : []),
    ],
    links: url ? [{ rel: "canonical", href: url }] : [],
  };
};
