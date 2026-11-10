import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHead } from "@/components/site/Layout";
import { ContactBlock } from "@/components/site/Contact";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => seo("Contato — Igreja Filadélfia da Paraíba", "Endereço, horários dos cultos, WhatsApp e redes sociais da Igreja Filadélfia da Paraíba.", "/contato"),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <section className="mx-auto min-h-screen max-w-[1500px] px-5 py-20 md:px-10 lg:py-28">
        <SectionHead eyebrow="Contato e localização" title="Sua presença faz parte desta história." />
        <div className="mt-14"><ContactBlock /></div>
      </section>
    </PageShell>
  );
}
