import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QueryError } from "./QueryStatus";
import { useCategories, usePhotos, useSignedUrls, type Photo } from "@/lib/site";
import { historicalPhotos } from "@/lib/historical-photos";

const INTERVAL = 6000;


export function HistoryCarousel({ withFilters = false, dark = true }: { withFilters?: boolean; dark?: boolean }) {
  const { data: all = [], isLoading, isError, refetch } = usePhotos();
  const { data: cats = [] } = useCategories();
  const [cat, setCat] = useState<string | null>(null);
  const photos = useMemo(() => historicalPhotos.length ? historicalPhotos : (cat ? all.filter((p) => p.category_id === cat) : all), [all, cat]);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(false);
  const zoomTrigger = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const sync = () => setReduced(media.matches); sync(); media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }, []);
  const n = photos.length;

  useEffect(() => setI(0), [cat]);

  // Only sign a small window around the current photo
  const windowPaths = useMemo(() => {
    if (!n) return [];
    const out: string[] = [];
    for (let d = -2; d <= 3; d++) { const photo = photos[(i + d + n) % n]; if (photo) out.push(photo.storage_path); }
    return Array.from(new Set(out));
  }, [photos, i, n]);
  const { data: urls = {}, isError: imageError, refetch: retryImages } = useSignedUrls(windowPaths);

  const interact = useCallback(() => setPaused(true), []);
  const go = useCallback((d: number) => { if (n) setI((v) => (v + d + n) % n); }, [n]);

  useEffect(() => {
    if (paused || hovered || zoom || reduced || n < 2) return;
    const t = window.setInterval(() => go(1), INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, hovered, zoom, reduced, n, go]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (zoom && e.key === "Escape") setZoom(false); if (zoom && e.key === "ArrowRight") go(1); if (zoom && e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [zoom, go]);

  const cur: Photo | undefined = photos[i];
  const curUrl = cur ? (cur.storage_path.startsWith("/") ? cur.storage_path : urls[cur.storage_path]) : undefined;
  const tone = dark ? "text-ink-foreground" : "text-foreground";
  const muted = dark ? "text-ink-muted" : "text-muted-foreground";

  if (isError && historicalPhotos.length === 0) return <QueryError retry={() => { void refetch(); }} />;
  return (
    <div className={tone}>
      {withFilters && historicalPhotos.length === 0 && cats.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar acervo">
          {[{ id: null as string | null, name: "Todo o acervo", period: null as string | null }, ...cats].map((c) => (
            <Button variant="ghost" key={c.id ?? "all"} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${cat === c.id ? "border-gold bg-gold text-ink" : `border-current/20 ${muted} hover:border-gold`}`}>
              {c.name}{c.period ? ` · ${c.period}` : ""}
            </Button>
          ))}
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-sm bg-ink"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; interact(); }}
        onTouchEnd={(e) => { if (touchX.current === null) return; const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touchX.current = null; }}
        aria-roledescription="carrossel" aria-label="Acervo histórico"
      >
        <div className="relative aspect-[4/3] w-full md:aspect-[16/9]">
          {n === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center border border-dashed border-gold/40 text-center">
              <p className="max-w-sm px-6 text-sm text-ink-muted">{isLoading ? "Carregando acervo…" : "As fotografias históricas da igreja aparecerão aqui assim que forem enviadas pelo painel administrativo."}</p>
            </div>
          ) : curUrl ? (
            <img key={cur?.id} src={curUrl} alt={cur?.description ?? cur?.title ?? "Fotografia histórica da igreja"} loading="lazy" decoding="async" className="rise absolute inset-0 h-full w-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-ink">{imageError ? <QueryError retry={() => { void retryImages(); }} /> : <span className="text-sm text-ink-muted">Carregando fotografia…</span>}</div>
          )}
          {n > 0 && (
            <>
              <Button variant="ghost" onClick={() => { interact(); go(-1); }} aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/60 p-3 text-ink-foreground backdrop-blur transition hover:bg-gold hover:text-ink"><ChevronLeft className="h-5 w-5" /></Button>
              <Button variant="ghost" onClick={() => { interact(); go(1); }} aria-label="Próxima foto" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/60 p-3 text-ink-foreground backdrop-blur transition hover:bg-gold hover:text-ink"><ChevronRight className="h-5 w-5" /></Button>
              <Button variant="ghost" ref={zoomTrigger} onClick={() => { interact(); setZoom(true); }} aria-label="Ampliar foto" className="absolute right-3 top-3 rounded-full bg-ink/60 p-2.5 text-ink-foreground backdrop-blur transition hover:bg-gold hover:text-ink"><Expand className="h-4 w-4" /></Button>
            </>
          )}
        </div>
      </div>

      {n > 0 && cur && (
        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="min-h-[3.5rem] max-w-2xl" aria-live="polite">
            {cur.title && <p className="font-display text-2xl">{cur.title}</p>}
            {(cur.description || cur.taken_on) && <p className={`mt-1 text-sm ${muted}`}>{[cur.taken_on, cur.description].filter(Boolean).join(" — ")}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" title={paused ? "Reproduzir apresentação" : "Pausar apresentação"} aria-label={paused ? "Reproduzir apresentação" : "Pausar apresentação"} onClick={() => setPaused(!paused)}>{paused || reduced ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
            <span className={`font-display text-lg tabular-nums ${muted}`}><span className="text-gold">{String(i + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}</span>
            <div className="h-px w-32 bg-current/20 md:w-48" aria-hidden>
              <div className="h-px bg-gold transition-all duration-500" style={{ width: `${((i + 1) / n) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent aria-describedby={undefined} onCloseAutoFocus={(event) => { event.preventDefault(); zoomTrigger.current?.focus(); }} className="max-w-6xl border-ink-muted/20 bg-ink p-4 text-ink-foreground">
          <DialogTitle className="sr-only">Foto ampliada</DialogTitle>
          {curUrl && <img src={curUrl} alt={cur?.description ?? cur?.title ?? "Fotografia histórica da igreja"} className="h-[70vh] w-full object-contain" />}
          <div className="flex items-center justify-center gap-5"><Button variant="ghost" size="icon" onClick={() => go(-1)} aria-label="Foto anterior"><ChevronLeft /></Button><span className="text-sm tabular-nums">{i + 1} / {n}</span><Button variant="ghost" size="icon" onClick={() => go(1)} aria-label="Próxima foto"><ChevronRight /></Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
