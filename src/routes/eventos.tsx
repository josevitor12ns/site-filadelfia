import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHead } from "@/components/site/Layout";
import { EventList } from "@/components/site/Events";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/eventos")({
  head: () => seo("Eventos — Igreja Filadélfia da Paraíba", "Cultos especiais, congressos, encontros de jovens, programações infantis e batismos da Igreja Filadélfia da Paraíba.", "/eventos"),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <section className="mx-auto min-h-screen max-w-[1500px] px-5 py-20 md:px-10 lg:py-28">
        <SectionHead eyebrow="Eventos e programação" title="Momentos que nos aproximam." sub="Cultos especiais, aniversário da igreja, congressos, encontros de jovens, programações infantis e batismos." />
        <div className="mt-14"><EventList /></div>
      </section>
    </PageShell>
  );
}
