import { createServerFn } from "@tanstack/react-start";

export type FeedVideo = { youtube_id: string; title: string; published_at: string };

/** Reads the channel's official public RSS feed (latest ~15 uploads). No credentials needed. */
export const getChannelFeed = createServerFn({ method: "GET" })
  .inputValidator((input: { channelId: string }) => {
    if (!/^UC[\w-]{22}$/.test(input.channelId)) throw new Error("Canal inválido");
    return input;
  })
  .handler(async ({ data }): Promise<{ videos: FeedVideo[]; unavailable: boolean }> => {
    try {
      const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${data.channelId}`);
      if (!res.ok) return { videos: [], unavailable: true };
      const xml = await res.text();
      const entries = xml.split("<entry>").slice(1);
      const videos = entries.map((e) => ({
        youtube_id: e.match(/<yt:videoId>([^<]+)</)?.[1] ?? "",
        title: (e.match(/<title>([^<]*)</)?.[1] ?? "")
          .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        published_at: e.match(/<published>([^<]+)</)?.[1] ?? "",
      })).filter((v) => v.youtube_id);
      return { videos, unavailable: false };
    } catch {
      return { videos: [], unavailable: true };
    }
  });
