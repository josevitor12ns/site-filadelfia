
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

type YouTubeItem = {
  snippet?: {
    title?: string;
    publishedAt?: string;
    resourceId?: {
      videoId?: string;
    };
  };
};

const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[a-zA-Z0-9_-]{22}$/;

function decodeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, number: string) =>
      String.fromCodePoint(parseInt(number, 10))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function extractTag(xml: string, tag: string): string {
  const escaped = tag.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const match = xml.match(
    new RegExp(
      `<${escaped}>([\\s\\S]*?)<\\/${escaped}>`
    )
  );

  return match?.[1]?.trim() ?? "";
}

async function fetchRss(
  channelId: string
): Promise<FeedVideo[] | null> {
  const url = new URL(
    "https://www.youtube.com/feeds/videos.xml"
  );

  url.searchParams.set("channel_id", channelId);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/atom+xml, application/xml",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    console.warn(
      "[YouTube RSS] HTTP",
      response.status
    );

    return null;
  }

  const xml = await response.text();

  if (!xml.includes("<feed")) {
    return null;
  }

  return xml
    .split(/<entry(?:\s[^>]*)?>/)
    .slice(1)
    .map((entry) => ({
      youtube_id: extractTag(entry, "yt:videoId"),
      title:
        decodeXml(extractTag(entry, "title")) ||
        "Vídeo da igreja",
      published_at: extractTag(entry, "published"),
    }))
    .filter((video) =>
      VIDEO_ID.test(video.youtube_id)
    );
}

async function fetchApi(
  channelId: string,
  apiKey: string
): Promise<FeedVideo[] | null> {
  // A playlist de uploads troca o prefixo UC por UU.
  const playlistId = `UU${channelId.slice(2)}`;

  const url = new URL(
    "https://www.googleapis.com/youtube/v3/playlistItems"
  );

  url.searchParams.set("part", "snippet");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    console.error(
      "[YouTube API] HTTP",
      response.status
    );

    return null;
  }

  const data = (await response.json()) as {
    items?: YouTubeItem[];
  };

  return (data.items ?? [])
    .map((item) => ({
      youtube_id:
        item.snippet?.resourceId?.videoId ?? "",
      title:
        item.snippet?.title ?? "Vídeo da igreja",
      published_at:
        item.snippet?.publishedAt ?? "",
    }))
    .filter(
      (video) =>
        VIDEO_ID.test(video.youtube_id) &&
        video.title !== "Private video" &&
        video.title !== "Deleted video"
    );
}

export const getChannelFeed = createServerFn({
  method: "GET",
})
  .inputValidator((input: { channelId: string }) => {
    const channelId = input.channelId.trim();

    if (!CHANNEL_ID.test(channelId)) {
      throw new Error("ID do canal inválido");
    }

    return { channelId };
  })
  .handler(
    async ({ data }): Promise<ChannelFeedResult> => {
      try {
        // Chave usada apenas no servidor.
        const apiKey =
          process.env["YOUTUBE_API_KEY"]?.trim();

        // Primeiro tenta a API oficial.
        if (apiKey) {
          const videos = await fetchApi(
            data.channelId,
            apiKey
          );

          if (videos !== null) {
            return {
              videos,
              unavailable: false,
            };
          }
        }

        // Se necessário, tenta o RSS.
        const videos = await fetchRss(
          data.channelId
        );

        if (videos !== null) {
          return {
            videos,
            unavailable: false,
          };
        }

        return {
          videos: [],
          unavailable: true,
        };
      } catch (error) {
        console.error(
          "[YouTube] Falha na consulta:",
          error
        );

        return {
          videos: [],
          unavailable: true,
        };
      }
    }
  );
