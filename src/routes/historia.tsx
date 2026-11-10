import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHead } from "@/components/site/Layout";
import { HistoryCarousel } from "@/components/site/HistoryCarousel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/historia")({
  head: () => seo("Nossa História — Igreja Filadélfia da Paraíba", "Acervo histórico da Igreja Filadélfia da Paraíba: cultos, batismos, encontros e momentos que atravessam gerações.", "/historia"),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <section className="min-h-screen bg-ink py-20 text-ink-foreground lg:py-28">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <SectionHead dark eyebrow="Acervo histórico" title="Nossa história não está apenas nos livros. Está em cada vida." sub="Uma caminhada construída por gerações, encontros, fé e momentos que merecem ser lembrados." />
          <div className="mt-14"><HistoryCarousel withFilters /></div>
        </div>
      </section>
    </PageShell>
  );
}
