
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Radio,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { supabase } from "@/integrations/supabase/client";
import { formatDate, useSettings } from "@/lib/site";

type Video = {
  youtube_id: string;
  title: string | null;
  published_at: string | null;
  featured: boolean | null;
  is_live: boolean | null;
  hidden: boolean | null;
};

const OFFICIAL_CHANNEL =
  "https://www.youtube.com/@igfiladelfiapb";

export function useAllVideos() {
  const { data: settings } = useSettings();

  const query = useQuery({
    queryKey: ["videos"],
    queryFn: async (): Promise<Video[]> => {
      const { data, error } = await supabase
        .from("videos")
        .select(
          "youtube_id,title,published_at,featured,is_live,hidden",
        )
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        });

      if (error) {
        console.error(
          "Erro ao carregar vídeos do Supabase:",
          error,
        );

        throw error;
      }

      return (data ?? []) as Video[];
    },
    staleTime: 1000 * 60 * 2,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const videos = (query.data ?? [])
    .filter((video) => !video.hidden)
    .filter((video) =>
      /^[a-zA-Z0-9_-]{11}$/.test(video.youtube_id),
    )
    .sort(
      (a, b) =>
        Number(Boolean(b.is_live)) -
          Number(Boolean(a.is_live)) ||
        Number(Boolean(b.featured)) -
          Number(Boolean(a.featured)) ||
        (b.published_at ?? "").localeCompare(
          a.published_at ?? "",
        ),
    );

  return {
    videos,
    loading: query.isLoading,
    failed: query.isError,
    retry: () => void query.refetch(),
    channelUrl:
      settings?.youtube_url?.trim() ||
      OFFICIAL_CHANNEL,
  };
}

export function VideoGrid({
  limit,
}: {
  limit?: number;
}) {
  const {
    videos,
    loading,
    failed,
    retry,
    channelUrl,
  } = useAllVideos();

  const [shown, setShown] = useState(limit ?? 9);
  const [playing, setPlaying] = useState<string | null>(
    null,
  );

  const playTrigger =
    useRef<HTMLButtonElement | null>(null);

  const list = videos.slice(0, limit ?? shown);

  const selectedVideo = videos.find(
    (video) => video.youtube_id === playing,
  );

  return (
    <div className="w-full text-white">
      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({
            length: limit ?? 6,
          }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-[#151515]"
            >
              <div className="aspect-video bg-white/10" />

              <div className="space-y-3 p-4">
                <div className="h-4 w-4/5 rounded bg-white/10" />
                <div className="h-3 w-2/5 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {failed && (
        <div className="rounded-xl border border-white/10 bg-[#141414] px-6 py-10 text-center">
          <p className="text-base font-medium text-white">
            Não conseguimos carregar os vídeos agora.
          </p>

          <p className="mt-3 text-sm text-white/55">
            Tente novamente ou acesse o canal
            oficial da igreja.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>

            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Abrir YouTube
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {!loading && !failed && videos.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[#141414] p-8 text-center">
          <p className="text-white/70">
            Nenhum vídeo cadastrado no momento.
          </p>

          <p className="mt-2 text-sm text-white/45">
            Os vídeos adicionados na aba
            Canal do YouTube do painel administrativo
            aparecerão aqui.
          </p>

          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm text-white underline underline-offset-4"
          >
            Acessar canal oficial
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {!loading && !failed && list.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((video) => (
            <article
              key={video.youtube_id}
              className="group overflow-hidden rounded-xl border border-white/10 bg-[#141414] transition duration-300 hover:-translate-y-1 hover:border-white/30"
            >
              <button
                type="button"
                onClick={(event) => {
                  playTrigger.current =
                    event.currentTarget;

                  setPlaying(video.youtube_id);
                }}
                aria-label={`Assistir: ${
                  video.title ?? "vídeo"
                }`}
                className="relative block aspect-video w-full overflow-hidden bg-[#202020]"
              >
                <img
                  src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
                  alt={video.title ?? "Vídeo da igreja"}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                />

                <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/65 text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                    <Play className="ml-1 h-6 w-6" />
                  </span>
                </span>

                {video.is_live && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black">
                    <Radio className="h-3.5 w-3.5" />
                    Ao vivo
                  </span>
                )}

                {video.featured && !video.is_live && (
                  <span className="absolute left-3 top-3 rounded-md border border-white/30 bg-black/75 px-3 py-1.5 text-xs text-white">
                    Destaque
                  </span>
                )}
              </button>

              <div className="p-5">
                <h3 className="line-clamp-2 min-h-[3rem] font-serif text-lg leading-snug text-white md:text-xl">
                  {video.title || "Culto e mensagem"}
                </h3>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className="text-xs text-white/45">
                    {video.published_at
                      ? formatDate(video.published_at)
                      : "Igreja Filadélfia"}
                  </span>

                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-white/80 transition hover:text-white"
                  >
                    YouTube
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!limit && shown < videos.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setShown((current) => current + 9)
            }
            className="rounded-md border border-white/25 px-7 py-3 text-sm transition hover:bg-white hover:text-black"
          >
            Carregar mais vídeos
          </button>
        </div>
      )}

      <Dialog
        open={Boolean(playing)}
        onOpenChange={(open) => {
          if (!open) setPlaying(null);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            playTrigger.current?.focus();
          }}
          className="max-w-5xl border border-white/15 bg-[#0b0b0b] p-4 pt-12 text-white sm:p-6 sm:pt-12"
        >
          <DialogTitle className="sr-only">
            {selectedVideo?.title ??
              "Culto no YouTube"}
          </DialogTitle>

          {playing && (
            <iframe
              key={playing}
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/${playing}?autoplay=1`}
              title={
                selectedVideo?.title ??
                "Culto no YouTube"
              }
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
