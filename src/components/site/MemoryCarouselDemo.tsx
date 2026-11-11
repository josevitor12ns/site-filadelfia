
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Play,
  X,
} from "lucide-react";

import {
  usePhotos,
  useSignedUrls,
} from "@/lib/site";

function isVideo(path: string) {
  return /\.(mp4|webm|mov|m4v|ogv)(?:$|\?)/i.test(path);
}

export function MemoryCarouselDemo() {
  const track = useRef<HTMLDivElement>(null);

  const {
    data: photos = [],
    isLoading,
    isError,
  } = usePhotos();

  const paths = photos.map((photo) => photo.storage_path);

  const {
    data: signedUrls = {},
    isLoading: loadingUrls,
    isError: urlsError,
  } = useSignedUrls(paths);

  const memories = photos
    .map((photo) => {
      const url = signedUrls[photo.storage_path];

      if (!url) return null;

      return {
        id: photo.id,
        title:
          photo.title?.trim() ||
          "Memória da Igreja Filadélfia",
        type: isVideo(photo.storage_path)
          ? ("video" as const)
          : ("photo" as const),
        url,
      };
    })
    .filter(
      (
        memory,
      ): memory is {
        id: string;
        title: string;
        type: "photo" | "video";
        url: string;
      } => memory !== null,
    );

  const [selectedIndex, setSelectedIndex] = useState<
    number | null
  >(null);

  const selected =
    selectedIndex !== null
      ? memories[selectedIndex]
      : undefined;

  function move(direction: number) {
    const element = track.current;

    if (!element) return;

    const card =
      element.querySelector<HTMLElement>(
        "[data-memory-card]",
      );

    element.scrollBy({
      left:
        direction *
        ((card?.offsetWidth ?? 280) + 16),
      behavior: "smooth",
    });
  }

  function changeSelected(direction: number) {
    if (memories.length === 0) return;

    setSelectedIndex((current) => {
      if (current === null) return 0;

      return (
        (current + direction + memories.length) %
        memories.length
      );
    });
  }

  useEffect(() => {
    if (selectedIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowLeft") {
        changeSelected(-1);
      }

      if (event.key === "ArrowRight") {
        changeSelected(1);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedIndex, memories.length]);

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
              disabled={memories.length < 2}
              className="rounded-full border border-white/25 p-3 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Avançar"
              disabled={memories.length < 2}
              className="rounded-full border border-white/25 p-3 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {(isLoading || loadingUrls) && (
          <div className="py-12 text-center text-sm text-white/50">
            Carregando fotos e vídeos da igreja...
          </div>
        )}

        {(isError || urlsError) && (
          <div className="rounded-xl border border-white/15 bg-white/5 p-6 text-center text-sm text-white/70">
            Não foi possível carregar a galeria.
            Tente atualizar a página.
          </div>
        )}

        {!isLoading &&
          !loadingUrls &&
          !isError &&
          !urlsError &&
          memories.length === 0 && (
            <div className="rounded-xl border border-white/15 bg-white/5 px-6 py-12 text-center">
              <p className="text-lg">
                Nossa galeria está começando.
              </p>

              <p className="mt-2 text-sm text-white/50">
                Em breve, fotos e vídeos dos
                momentos especiais da igreja
                aparecerão aqui.
              </p>
            </div>
          )}

        {memories.length > 0 && (
          <div
            ref={track}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {memories.map((memory, index) => (
              <button
                key={memory.id}
                type="button"
                data-memory-card
                onClick={() =>
                  setSelectedIndex(index)
                }
                className="group w-[72%] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-[#161616] text-left sm:w-[43%] lg:w-[24%]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#252525]">
                  {memory.type === "video" ? (
                    <video
                      src={memory.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={memory.url}
                      alt={memory.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}

                  <span className="absolute right-3 top-3 rounded-full bg-black/65 p-2">
                    {memory.type === "video" ? (
                      <Play size={17} />
                    ) : (
                      <Expand size={17} />
                    )}
                  </span>
                </div>

                <div className="p-4">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    {memory.type === "video"
                      ? "Vídeo"
                      : "Fotografia"}
                  </span>

                  <h3 className="mt-2 truncate text-sm font-medium">
                    {memory.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-white/40">
          Deslize para explorar o acervo da igreja.
        </p>
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() =>
            setSelectedIndex(null)
          }
        >
          <button
            type="button"
            onClick={() =>
              setSelectedIndex(null)
            }
            aria-label="Fechar"
            className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-black/60 p-3 text-white hover:bg-white hover:text-black"
          >
            <X size={20} />
          </button>

          {memories.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={(event) => {
                  event.stopPropagation();
                  changeSelected(-1);
                }}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/60 p-3 text-white hover:bg-white hover:text-black md:left-6"
              >
                <ArrowLeft size={22} />
              </button>

              <button
                type="button"
                aria-label="Próxima foto"
                onClick={(event) => {
                  event.stopPropagation();
                  changeSelected(1);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/60 p-3 text-white hover:bg-white hover:text-black md:right-6"
              >
                <ArrowRight size={22} />
              </button>
            </>
          )}

          <div
            className="flex max-h-[85vh] w-full max-w-5xl flex-col items-center justify-center gap-4 px-8 md:px-16"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {selected.type === "video" ? (
              <video
                key={selected.id}
                src={selected.url}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="max-h-[75vh] max-w-full rounded-lg object-contain"
              />
            ) : (
              <img
                src={selected.url}
                alt={selected.title}
                className="max-h-[75vh] max-w-full rounded-lg object-contain"
              />
            )}

            <p className="text-center text-sm text-white/80">
              {selected.title}
            </p>

            <p className="text-xs text-white/40">
              {selectedIndex !== null
                ? selectedIndex + 1
                : 1}{" "}
              de {memories.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
