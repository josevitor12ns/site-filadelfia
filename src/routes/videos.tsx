
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/Layout";
import { VideoGrid } from "@/components/site/Videos";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/videos")({
  head: () =>
    seo(
      "Cultos e mensagens | Igreja Filadélfia da Paraíba",
      "Assista aos cultos e mensagens da Igreja Filadélfia da Paraíba.",
      "/videos"
    ),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <main className="min-h-screen bg-[#08090b] text-white">
        {/* ABERTURA */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(255,255,255,0.07),transparent_45%)]"
          />

          <div className="relative mx-auto max-w-[1500px] px-5 pb-12 pt-14 md:px-10 md:pb-16 md:pt-20">
            <h1 className="max-w-4xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Cultos e
              <br />
              <em className="font-normal text-white/60">
                mensagens.
              </em>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 md:text-base">
              Acompanhe as pregações e assista aos cultos
              da Igreja Filadélfia da Paraíba.
            </p>

            <a
              href="https://www.youtube.com/@igfiladelfiapb"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-md border border-white/25 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              <span aria-hidden="true">▶</span>
              Visitar nosso canal
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        {/* VÍDEOS DA IGREJA */}
        <section className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/15 pb-5">
            <h2 className="font-serif text-2xl tracking-tight md:text-3xl">
              Assista às mensagens
            </h2>

            <span className="hidden text-xs text-white/40 sm:block">
              Canal oficial da igreja
            </span>
          </div>

          <VideoGrid />
        </section>

        {/* CHAMADA FINAL */}
        <section className="border-t border-white/10 bg-[#101114]">
          <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-5 py-12 md:flex-row md:items-center md:px-10">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl">
                Continue acompanhando.
              </h2>

              <p className="mt-3 text-sm text-white/55">
                Confira outras mensagens no nosso canal do YouTube.
              </p>
            </div>

            <a
              href="https://www.youtube.com/@igfiladelfiapb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex self-start items-center gap-3 border-b border-white pb-2 text-xs font-semibold uppercase tracking-wider transition hover:opacity-60"
            >
              Abrir YouTube ↗
            </a>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
