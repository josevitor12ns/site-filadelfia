
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/Layout";
import { useSettings, useSignedUrl } from "@/lib/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/igreja")({
  head: () =>
    seo(
      "A Igreja — Igreja Filadélfia da Paraíba",
      "Conheça a Igreja Filadélfia da Paraíba: uma comunidade de fé, comunhão e acolhimento.",
      "/igreja"
    ),
  component: Page,
});

function Page() {
  const { data: settings } = useSettings();

  const interior = useSignedUrl(settings?.interior_image);

  const aboutText =
    settings?.about_text ||
    "Um espaço para estar juntos, compartilhar momentos e fortalecer nossa fé.";

  return (
    <PageShell>
      <main className="min-h-screen bg-[#f5f5f5] text-black">
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-[900px] text-center">
            <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-black/45">
              A Igreja
            </p>

            <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Um lugar de fé, comunhão
              <br />
              e acolhimento.
            </h1>

            <p className="mx-auto mt-6 max-w-xl whitespace-pre-line text-sm leading-7 text-black/60">
              {aboutText}
            </p>
          </div>

          <div className="mx-auto mt-12 w-full max-w-[370px]">
            <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-[#e8e8e8] p-3">
              <img
                src="/images/fachada-igreja.jpg"
                alt="Fachada da Igreja Filadélfia da Paraíba"
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#101010] px-5 py-16 text-white md:px-10 md:py-20">
          <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-3">
            {[
              {
                title: "Fé",
                description:
                  "Uma vida firmada na Palavra e na presença de Deus.",
              },
              {
                title: "Comunhão",
                description:
                  "Famílias, jovens e crianças caminhando juntos.",
              },
              {
                title: "Acolhimento",
                description:
                  "Portas abertas para quem chega pela primeira vez.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-t border-white/20 pt-6"
              >
                <h2 className="font-serif text-3xl">
                  {item.title}
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-[900px]">
            <div className="mx-auto w-full max-w-[370px]">
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-[#e8e8e8] p-3">
                <img
                  src="/images/pastor-normando.png"
                  alt="Pastor Normando"
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="mt-6 text-center">
                <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-black/45">
                  Nossa liderança
                </p>

                <h2 className="font-serif text-3xl">
                  Pastor Normando
                </h2>
              </div>
            </div>

            {interior && (
              <div className="mx-auto mt-16 max-w-[650px]">
                <img
                  src={interior}
                  alt="Interior da igreja"
                  loading="lazy"
                  className="w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
