import { Button } from "@/components/ui/button";
import { QueryError } from "./QueryStatus";
import { useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { useEvents, useSignedUrls } from "@/lib/site";

export function EventList({ limit, upcomingOnly = true }: { limit?: number; upcomingOnly?: boolean }) {
  const { data = [], isLoading, isError, refetch } = useEvents(upcomingOnly);
  const list = limit ? data.slice(0, limit) : data;
  const { data: urls = {} } = useSignedUrls(list.map((e) => e.cover_path));
  const [open, setOpen] = useState<string | null>(null);

  if (isError) return <QueryError retry={() => { void refetch(); }} />;
  if (isLoading) return <p className="text-muted-foreground">Carregando programação…</p>;
  if (!list.length) return <p className="border-t border-border pt-8 text-muted-foreground">Nenhum evento cadastrado no momento. Novas programações serão publicadas em breve.</p>;

  return (
    <ul className="border-t border-border">
      {list.map((e) => {
        const d = new Date(e.starts_at);
        const isOpen = open === e.id;
        const cover = e.cover_path ? urls[e.cover_path] : undefined;
        return (
          <li key={e.id} className="border-b border-border">
            <div className="grid gap-6 py-8 md:grid-cols-[140px_1fr_auto] md:items-center">
              <div className="flex items-baseline gap-3 md:block">
                <span className="font-display text-6xl leading-none text-gold">{Number.isFinite(d.getTime()) ? d.getDate().toString().padStart(2, "0") : "—"}</span>
                <span className="eyebrow md:mt-2 md:block !text-muted-foreground">{d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
              </div>
              <div>
                <h3 className="text-3xl">{e.title}</h3>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  {e.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{e.location}</span>}
                </div>
              </div>
              <Button variant="outline" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen} aria-controls={`event-${e.id}`} className="justify-self-start border border-foreground/20 px-5 py-2.5 text-sm transition hover:border-gold hover:text-gold">
                {isOpen ? "Fechar" : "Mais informações"}
              </Button>
            </div>
            {isOpen && (
              <div id={`event-${e.id}`} className="rise grid gap-8 pb-10 md:grid-cols-[140px_1fr_1fr]">
                <div className="hidden md:block" />
                <div>
                  {e.description && <p className="whitespace-pre-line text-muted-foreground">{e.description}</p>}
                  {e.info_url && <a href={e.info_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-gold">Saiba mais ↗</a>}
                </div>
                {cover && <img src={cover} alt={e.title} className="w-full rounded-sm object-cover" loading="lazy" />}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
