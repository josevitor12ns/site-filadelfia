
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, RefreshCw, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/site";
import { getChannelFeed } from "@/lib/youtube.functions";

type Video = {
  youtube_id: string;
  title: string | null;
  published_at: string | null;
  featured?: boolean | null;
  is_live?: boolean | null;
  hidden?: boolean | null;
};

type VideoGridProps = {
  limit?: number;
};

const OFFICIAL_CHANNEL =
  "https://www.youtube.com/@igfiladelfiapb";

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const CHANNEL_ID_PATTERN = /^UC[a-zA-Z0-9_-]{22}$/;

function useAllVideos() {
  const { data: settings } = useSettings();

  const channelId =
    settings?.youtube_channel_id?.trim() || "";

  const validChannelId =
    CHANNEL_ID_PATTERN.test(channelId);

  const manualQuery = useQuery({
    queryKey: ["videos"],
    queryFn: async (): Promise<Video[]> => {
      const { data, error } = await supabase
        .from("videos")
        .select(
          "youtube_id,title,published_at,featured,is_live,hidden"
        );

      if (error) {
        throw error;
      }

      return (data ?? []) as Video[];
    },
    staleTime: 60_000,
  });

  const feedQuery = useQuery({
    queryKey: ["youtube-channel-feed", channelId],
    queryFn: async () => {
      return getChannelFeed({
        data: {
          channelId,
        },
      });
    },
    enabled: validChannelId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });

  const automaticVideos: Video[] =
    feedQuery.data?.videos.map((video) => ({
      youtube_id: video.youtube_id,
      title: video.title,
      published_at: video.published_at,
      featured: false,
      is_live: false,
      hidden: false,
    })) ?? [];

  const manualVideos = manualQuery.data ?? [];

  const combined = new Map<string, Video>();

  for (const video of automaticVideos) {
    if (VIDEO_ID_PATTERN.test(video.youtube_id)) {
      combined.set(video.youtube_id, video);
    }
  }

  for (const video of manualVideos) {
    if (!VIDEO_ID_PATTERN.test(video.youtube_id)) {
      continue;
    }

    const existing = combined.get(video.youtube_id);

    combined.set(video.youtube_id, {
      ...existing,
      ...video,
      title: video.title || existing?.title || null,
      published_at:
        video.published_at ||
        existing?.published_at ||
        null,
    });
  }

  const videos = Array.from(combined.values())
    .filter((video) => !video.hidden)
    .sort((a, b) => {
      if (Boolean(a.is_live) !== Boolean(b.is_live)) {
        return a.is_live ? -1 : 1;
      }

      if (Boolean(a.featured) !== Boolean(b.featured)) {
        return a.featured ? -1 : 1;
      }

      const dateA = a.published_at
        ? new Date(a.published_at).getTime()
        : 0;

      const dateB = b.published_at
        ? new Date(b.published_at).getTime()
        : 0;

      return (
        (Number.isFinite(dateB) ? dateB : 0) -
        (Number.isFinite(dateA) ? dateA : 0)
      );
    });

  return {
    videos,
    loading:
      manualQuery.isPending ||
      (validChannelId && feedQuery.isPending),
    failed:
      manualQuery.isError ||
      (feedQuery.isError && manualVideos.length === 0),
    automaticFailed:
      validChannelId &&
      (feedQuery.isError ||
        feedQuery.data?.unavailable === true),
    channelUrl: OFFICIAL_CHANNEL,
    retry: () => {
      void manualQuery.refetch();

      if (validChannelId) {
        void feedQuery.refetch();
      }
    },
  };
}

function formatVideoDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function VideoGrid({ limit }: VideoGridProps) {
  const {
    videos,
    loading,
    failed,
    automaticFailed,
    channelUrl,
    retry,
  } = useAllVideos();

  const [selectedVideo, setSelectedVideo] =
    useState<Video | null>(null);

  const [visibleCount, setVisibleCount] =
    useState(limit ?? 9);

  const displayedVideos =
    typeof limit === "number"
      ? videos.slice(0, limit)
      : videos.slice(0, visibleCount);

  return (
    <div className="w-full">
      {loading && videos.length === 0 && (
        <div className="py-12 text-center text-sm text-white/60">
          Carregando vídeos...
        </div>
      )}

      {failed && videos.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-white/60">
            Não foi possível carregar os vídeos.
          </p>

          <button
            type="button"
            onClick={retry}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm text-white"
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      )}

      {!loading &&
        !failed &&
        videos.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-white/60">
              Os vídeos da igreja aparecerão aqui.
            </p>

            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-lg border border-white/30 px-5 py-3 text-sm text-white"
            >
              Visitar canal no YouTube
            </a>
          </div>
        )}

      {displayedVideos.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedVideos.map((video) => {
            const date = formatVideoDate(
              video.published_at
            );

            return (
              <button
                key={video.youtube_id}
                type="button"
                onClick={() =>
                  setSelectedVideo(video)
                }
                className="group overflow-hidden rounded-xl border border-white/10 bg-[#171717] text-left text-white transition hover:border-white/30"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
                    alt={
                      video.title ||
                      "Vídeo da Igreja Filadélfia"
                    }
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/40">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg">
                      <Play
                        size={23}
                        fill="currentColor"
                      />
                    </span>
                  </div>

                  {video.is_live && (
                    <span className="absolute left-3 top-3 rounded bg-red-600 px-3 py-1 text-xs font-semibold">
                      AO VIVO
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 min-h-12 font-semibold leading-snug">
                    {video.title ||
                      "Culto e mensagem"}
                  </h3>

                  {date && (
                    <p className="mt-3 text-xs text-white/50">
                      {date}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {typeof limit !== "number" &&
        visibleCount < videos.length && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((current) =>
                  current + 9
                )
              }
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black"
            >
              Carregar mais vídeos
            </button>
          </div>
        )}

      {automaticFailed && videos.length > 0 && (
        <p className="mt-6 text-center text-xs text-white/40">
          Os vídeos cadastrados continuam disponíveis.
          A atualização automática do canal está
          temporariamente indisponível.
        </p>
      )}

      {selectedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            selectedVideo.title ||
            "Assistir vídeo"
          }
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
        >
          <div className="w-full max-w-5xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="line-clamp-2 text-sm font-semibold text-white sm:text-lg">
                {selectedVideo.title ||
                  "Culto e mensagem"}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setSelectedVideo(null)
                }
                aria-label="Fechar vídeo"
                className="shrink-0 rounded-full border border-white/30 p-3 text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                key={selectedVideo.youtube_id}
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                title={
                  selectedVideo.title ||
                  "Vídeo da igreja"
                }
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoGrid;
