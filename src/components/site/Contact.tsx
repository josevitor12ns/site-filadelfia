import { Button } from "@/components/ui/button";
import { QueryError } from "./QueryStatus";
import { useSettings, useSignedUrl } from "@/lib/site";

export function ContactBlock() {
  const { data: s, isError, refetch } = useSettings();
  const facade = useSignedUrl(s?.hero_image);
  const address = s?.address?.trim();
  const mapSrc = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : null;
  const wa = s?.whatsapp?.replace(/\D/g, "");
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="border-b border-border py-5">
      <p className="eyebrow mb-2">{label}</p>
      <div className="text-lg">{children}</div>
    </div>
  );
  const pending = <span className="text-sm text-muted-foreground">A ser informado pela igreja</span>;
  if (isError) return <QueryError retry={() => { void refetch(); }} />;
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <Row label="Endereço">{address || pending}</Row>
        <Row label="Horários dos cultos">{s?.schedule ? <p className="whitespace-pre-line">{s.schedule}</p> : pending}</Row>
        <Row label="WhatsApp">{wa ? <a className="hover:text-gold" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">{s?.whatsapp}</a> : pending}</Row>
        {s?.email && <Row label="E-mail"><a href={`mailto:${s.email}`} className="break-all hover:text-gold">{s.email}</a></Row>}
        <Row label="Redes sociais">
          <div className="flex flex-wrap gap-5 text-base">
            {s?.youtube_url && <a className="hover:text-gold" href={s.youtube_url} target="_blank" rel="noreferrer">YouTube ↗</a>}
            {s?.instagram && <a className="hover:text-gold" href={s.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>}
            {s?.facebook && <a className="hover:text-gold" href={s.facebook} target="_blank" rel="noreferrer">Facebook ↗</a>}
          </div>
        </Row>
        {address && (
          <Button asChild className="mt-8"><a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="mt-8 inline-block bg-primary px-7 py-3.5 text-sm text-primary-foreground transition hover:bg-gold hover:text-ink">Como chegar</a></Button>
        )}
      </div>
      <div className="space-y-5">
        {facade && <img src={facade} alt="Fachada da Igreja Filadélfia — entrada do templo" className="block aspect-[1013/1064] w-full rounded-sm object-contain" loading="lazy" />}
        <div className="min-h-[300px] overflow-hidden rounded-sm bg-sand">
          {mapSrc ? <iframe title="Mapa da igreja" src={mapSrc} className="h-[300px] w-full border-0 grayscale-[40%]" loading="lazy" /> :
            <div className="flex min-h-[300px] items-center justify-center border border-dashed border-gold/60 p-6 text-center text-sm text-muted-foreground">O mapa aparecerá aqui quando o endereço oficial for cadastrado.</div>}
        </div>
      </div>
    </div>
  );
}
