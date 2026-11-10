
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, Play, X } from "lucide-react";

type Memory = {
  title: string;
  type: "photo" | "video";
  image: string;
  videoUrl?: string;
};

const memories: Memory[] = [
  {
    title: "Nossa história",
    type: "photo",
    image: "/demo/memoria-1.jpg",
  },
  {
    title: "Cultos e celebrações",
    type: "video",
    image: "/demo/memoria-2.jpg",
    videoUrl: "https://www.youtube.com/@igfiladelfiapb",
  },
  {
    title: "Momentos especiais",
    type: "photo",
    image: "/demo/memoria-3.jpg",
  },
  {
    title: "Nossa comunidade",
    type: "photo",
    image: "/demo/memoria-4.jpg",
  },
];

export function MemoryCarouselDemo() {
  const track = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Memory | null>(null);

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
              className="rounded-full border border-white/25 p-3 hover:bg-white hover:text-black"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Avançar"
              className="rounded-full border border-white/25 p-3 hover:bg-white hover:text-black"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={track}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {memories.map((memory, index) => (
            <button
              key={index}
              type="button"
              data-memory-card
              onClick={() => {
                if (memory.type === "video" && memory.videoUrl) {
                  window.open(
                    memory.videoUrl,
                    "_blank",
                    "noopener,noreferrer"
                  );
                } else {
                  setSelected(memory);
                }
              }}
              className="group w-[72%] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-[#161616] text-left sm:w-[43%] lg:w-[24%]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#252525]">
                <img
                  src={memory.image}
                  alt={memory.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

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

                <h3 className="mt-2 text-sm font-medium">
                  {memory.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

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
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Fechar"
            className="absolute right-5 top-5 rounded-full border border-white/30 p-3"
          >
            <X size={20} />
          </button>

          <img
            src={selected.image}
            alt={selected.title}
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
