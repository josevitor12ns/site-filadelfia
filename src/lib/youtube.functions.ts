
import { createServerFn } from "@tanstack/react-start";

export type FeedVideo = {
  youtube_id: string;
  title: string;
  published_at: string;
};

export type ChannelFeedResult = {
  videos: FeedVideo[];
  unavailable: boolean;
};

function decodeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(parseInt(decimal, 10))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function extractTag(xml: string, tag: string): string {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(
    new RegExp(`<${escaped}>([\\s\\S]*?)<\\/${escaped}>`)
  );

  return match?.[1]?.trim() ?? "";
}

export const getChannelFeed = createServerFn({
  method: "GET",
})
  .inputValidator((input: { channelId: string }) => {
    const channelId = input.channelId.trim();

    if (!/^UC[\w-]{22}$/.test(channelId)) {
      throw new Error(
        "ID do canal inválido. Informe o ID iniciado por UC."
      );
    }

    return { channelId };
  })
  .handler(async ({ data }): Promise<ChannelFeedResult> => {
    try {
      const url = new URL(
        "https://www.youtube.com/feeds/videos.xml"
      );

      url.searchParams.set("channel_id", data.channelId);

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/atom+xml, application/xml, text/xml",
          "User-Agent": "Mozilla/5.0",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        console.error(
          "[YouTube RSS] Erro HTTP:",
          response.status,
          data.channelId
        );

        return {
          videos: [],
          unavailable: true,
        };
      }

      const xml = await response.text();

      if (!xml.includes("<feed") || !xml.includes("</feed>")) {
        console.error(
          "[YouTube RSS] Resposta XML inválida."
        );

        return {
          videos: [],
          unavailable: true,
        };
      }

      const entries = xml
        .split(/<entry(?:\s[^>]*)?>/)
        .slice(1);

      const videos: FeedVideo[] = entries
        .map((entry) => {
          const youtube_id = extractTag(
            entry,
            "yt:videoId"
          );

          const title = decodeXml(
            extractTag(entry, "title")
          );

          const published_at = extractTag(
            entry,
            "published"
          );

          return {
            youtube_id,
            title: title || "Vídeo da igreja",
            published_at:
              published_at || new Date().toISOString(),
          };
        })
        .filter((video) =>
          /^[\w-]{11}$/.test(video.youtube_id)
        );

      return {
        videos,
        unavailable: false,
      };
    } catch (error) {
      console.error(
        "[YouTube RSS] Falha ao consultar canal:",
        error
      );

      return {
        videos: [],
        unavailable: true,
      };
    }
  });
