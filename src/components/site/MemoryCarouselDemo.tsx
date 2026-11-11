
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Play,
  X,
} from "lucide-react";

import { usePhotos, useSignedUrls } from "@/lib/site";

type Memory = {
  id: string;
  storage_path: string;
  title: string | null;
  description: string | null;
  taken_on: string | null;
};

const VIDEO_PATTERN = /\.(mp4|webm|mov|m4v|ogv)$/i;

function isVideo(path: string) {
  return VIDEO_PATTERN.test(path.split("?")[0] ?? "");
}

function formatOptionalDate(date: string | null) {
  if (!date) return null;

  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function MemoryCarouselDemo() {
  const track = useRef<HTMLDivElement>(null);

  const [selectedId, setSelectedId] = useState<string | null>(
    null
  );

  const { data: photos = [], isPending, isError } = usePhotos();

  const memories = photos as Memory[];

  const paths = memories.map((memory) => memory.storage_path);

  const { data: signed = {} } = useSignedUrls(paths);

  const selectedIndex = memories.findIndex(
    (memory) => memory.id === selectedId
  );

  const selected =
    selectedIndex >= 0
      ? memories[selectedIndex]
      : undefined;

  const selectedUrl = selected
    ? signed[selected.storage_path]
    : undefined;

  function move(direction: number) {
    const element = track.current;

    if (!element) return;

    const card = element.querySelector<HTMLElement>(
      "[data-memory-card]"
    );

    element.scrollBy({
      left: direction * ((card?.offsetWidth ?? 280) + 16),
      behavior: "smooth",
    });
  }

  function changeSelected(direction: number) {
    if (memories.length === 0 || selectedIndex < 0) {
      return;
    }

    const nextIndex =
      (selectedIndex + direction + memories.length) %
      memories.length;

    const next = memories[nextIndex];

    if (next) {
      setSelectedId(next.id);
    }
  }

  useEffect(() => {
    if (!selectedId) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedId]);

  return (
    <section className="bg-[#080808] py-10 text-white md:py-16">
      <div className="mx-auto max-w-[1500px] px-4 md:px-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/45">
              Acervo digital
            </p>

            <h2 className="font-serif text-3xl md:text-5xl">
              Nossas memórias.
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Voltar"
              className="rounded-full border border-white/25 p-3 transition hover:bg-white hover:text-black"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Avançar"
              className="rounded-full border border-white/25 p-3 transition hover:bg-white hover:text-black"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {isPending && (
          <p className="py-8 text-sm text-white/50">
            Carregando memórias...
          </p>
        )}

        {isError && (
          <p className="py-8 text-sm text-white/50">
            Não foi possível carregar a galeria.
          </p>
        )}

        {!isPending && !isError && memories.length === 0 && (
          <p className="py-8 text-sm text-white/50">
            As fotos e os vídeos da igreja aparecerão aqui.
          </p>
        )}

        <div
          ref={track}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {memories.map((memory) => {
            const url = signed[memory.storage_path];
            const video = isVideo(memory.storage_path);

            const title = memory.title?.trim() || null;
            const description =
              memory.description?.trim() || null;

            const date = formatOptionalDate(
              memory.taken_on
            );

            const hasText = Boolean(
              title || description || date
            );

            return (
              <button
                key={memory.id}
                type="button"
                data-memory-card
                onClick={() => setSelectedId(memory.id)}
                className="group w-[72%] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-[#161616] text-left sm:w-[43%] lg:w-[24%]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#252525]">
                  {url ? (
                    video ? (
                      <video
                        src={url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={url}
                        alt={title || "Memória da igreja"}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/40">
                      Carregando...
                    </div>
                  )}

                  <span className="absolute right-3 top-3 rounded-full bg-black/65 p-2 text-white">
                    {video ? (
                      <Play size={17} />
                    ) : (
                      <Expand size={17} />
                    )}
                  </span>
                </div>

                {hasText && (
                  <div className="space-y-2 p-4">
                    {title && (
                      <h3 className="break-words text-sm font-semibold text-white">
                        {title}
                      </h3>
                    )}

                    {description && (
                      <p className="line-clamp-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-white/65">
                        {description}
                      </p>
                    )}

                    {date && (
                      <p className="text-xs text-white/40">
                        {date}
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {memories.length > 1 && (
          <p className="mt-3 text-xs text-white/40">
            Deslize para explorar o acervo da igreja.
          </p>
        )}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title || "Memória da igreja"}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4 text-white"
        >
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label="Fechar"
            className="absolute right-4 top-4 z-20 rounded-full border border-white/30 bg-black/80 p-3"
          >
            <X size={20} />
          </button>

          {memories.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => changeSelected(-1)}
                aria-label="Foto ou vídeo anterior"
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/80 p-3 sm:left-5"
              >
                <ArrowLeft size={20} />
              </button>

              <button
                type="button"
                onClick={() => changeSelected(1)}
                aria-label="Próxima foto ou vídeo"
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/80 p-3 sm:right-5"
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}

          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col items-center overflow-y-auto px-8 sm:px-14">
            {selectedUrl ? (
              isVideo(selected.storage_path) ? (
                <video
                  key={selected.id}
                  src={selectedUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[65vh] w-full object-contain"
                />
              ) : (
                <img
                  key={selected.id}
                  src={selectedUrl}
                  alt={
                    selected.title ||
                    "Foto da Igreja Filadélfia"
                  }
                  className="max-h-[65vh] max-w-full object-contain"
                />
              )
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-white/50">
                Carregando arquivo...
              </div>
            )}

            {(selected.title?.trim() ||
              selected.description?.trim() ||
              selected.taken_on) && (
              <div className="mt-5 w-full max-w-2xl text-center">
                {selected.title?.trim() && (
                  <h3 className="font-serif text-xl sm:text-2xl">
                    {selected.title}
                  </h3>
                )}

                {selected.description?.trim() && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/70">
                    {selected.description}
                  </p>
                )}

                {formatOptionalDate(selected.taken_on) && (
                  <p className="mt-3 text-xs text-white/45">
                    {formatOptionalDate(selected.taken_on)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
