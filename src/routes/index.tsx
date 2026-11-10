
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/Layout";
import { MemoryCarouselDemo } from "@/components/site/MemoryCarouselDemo";
import { VideoGrid } from "@/components/site/Videos";
import { seo } from "@/lib/seo";

import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Play,
  MapPin,
  Phone,
  Navigation,
} from "lucide-react";

const CHURCH_ADDRESS =
  "Rua Maria da Conceição Cunha Nóbrega, 216 - Mangabeira, João Pessoa - PB, 58055-770, Brasil";

const CHURCH_PHONE = "(83) 9894-1104";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(CHURCH_ADDRESS);

const MAPS_EMBED =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(CHURCH_ADDRESS) +
  "&output=embed";

const navigation = [
  {
    number: "01",
    title: "Nossa história",
    description: "Fotografias e memórias",
    href: "#memorias",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Cultos e mensagens",
    description: "Assista às pregações",
    href: "#cultos",
    icon: Play,
  },
  {
    number: "03",
    title: "Visite-nos",
    description: "Contato e localização",
    href: "#contato",
    icon: MapPin,
  },
];

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "Igreja Filadélfia da Paraíba | João Pessoa",
      "Conheça nossa igreja, cultos, mensagens e memórias.",
      "/"
    ),
  component: Home,
});

function Home() {
  const [vooContinuo, setVooContinuo] = useState(false);

  return (
    <PageShell>
      <main className="min-w-0 overflow-x-hidden bg-[#080808] text-white">

        {/* VÍDEO DE ABERTURA */}

        <section
          id="inicio"
          className="scroll-mt-24 bg-black"
        >
          <div className="relative w-full overflow-hidden">
            <video
              key={vooContinuo ? "voo" : "abertura"}
              src={
                vooContinuo
                  ? "/video/filadelfia-voo-continuo.mp4"
                  : "/video/filadelfia-abertura.mp4"
              }
              autoPlay
              muted
              playsInline
              loop={vooContinuo}
              preload="metadata"
              controls={false}
              disablePictureInPicture
              onEnded={() => {
                if (!vooContinuo) {
                  setVooContinuo(true);
                }
              }}
              aria-label="Bíblia aberta, fogo e pomba branca"
              className="block aspect-video w-full object-cover"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent"
            />
          </div>
        </section>

        {/* CARDS DE NAVEGAÇÃO */}

        <section
          aria-label="Explore nosso site"
          className="border-y border-white/10 bg-[#101010]"
        >
          <div className="mx-auto grid max-w-[1500px] grid-cols-1 sm:grid-cols-3">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.number}
                  href={item.href}
                  className="group flex min-h-[118px] flex-col justify-between border-b border-white/10 p-5 transition-colors duration-300 hover:bg-white hover:text-black sm:min-h-[150px] sm:border-b-0 sm:border-r sm:border-white/10 md:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40 group-hover:text-black/40">
                      {item.number}
                    </span>

                    <Icon
                      size={19}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl">
                        {item.title}
                      </h2>

                      <p className="mt-2 text-xs text-white/45 group-hover:text-black/55">
                        {item.description}
                      </p>
                    </div>

                    <ArrowDownRight
                      size={19}
                      className="shrink-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
                      aria-hidden="true"
                    />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* A IGREJA */}

        <section
          id="igreja"
          className="scroll-mt-24 bg-[#f5f5f5] py-14 text-black md:py-20"
        >
          <div className="mx-auto max-w-[900px] px-5 md:px-10">

            {/* FACHADA */}

            <div className="mx-auto w-full max-w-[370px]">
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-[#e8e8e8] p-3">
                <img
                  src="/images/fachada-igreja.jpg"
                  alt="Fachada da Igreja Filadélfia da Paraíba"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="mt-6 text-center">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-black/45">
                  Nossa casa
                </p>

                <h2 className="font-serif text-2xl leading-snug tracking-tight sm:text-3xl">
                  Um lugar de fé, comunhão
                  <br />
                  e acolhimento.
                </h2>

                <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-black/55">
                  Um espaço para estar juntos, compartilhar
                  momentos e fortalecer nossa fé.
                </p>
              </div>
            </div>

            {/* DIVISÓRIA */}

            <div className="mx-auto my-14 h-px w-16 bg-black/15 md:my-20" />

            {/* PASTOR */}

            <div className="mx-auto w-full max-w-[370px]">
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-[#e8e8e8] p-3">
                <img
                  src="/images/pastor-normando.png"
                  alt="Pastor Normando"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="mt-6 text-center">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-black/45">
                  Nossa liderança
                </p>

                <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
                  Pastor Normando
                </h2>

                <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-black/55">
                  Conheça nossa comunidade e os momentos
                  que fazem parte da nossa caminhada.
                </p>

                <a
                  href="#memorias"
                  className="mt-6 inline-flex items-center gap-2 border-b border-black pb-2 text-xs font-semibold uppercase tracking-wider transition hover:opacity-60"
                >
                  Ver nossas memórias
                  <ArrowDownRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CULTOS E MENSAGENS */}

        <section
          id="cultos"
          className="scroll-mt-24 bg-[#0b0b0b] py-14 text-white md:py-20"
        >
          <div className="mx-auto max-w-[1500px] px-5 md:px-10">
            <div className="mb-9 flex flex-col justify-between gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end">
              <div>
                <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40">
                  Mensagens da igreja
                </p>

                <h2 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  Cultos e mensagens.
                </h2>
              </div>

              <a
                href="https://www.youtube.com/@igfiladelfiapb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex self-start items-center gap-2 border-b border-white pb-2 text-xs font-semibold uppercase tracking-wider transition hover:opacity-60"
              >
                Canal no YouTube
                <ArrowUpRight size={16} />
              </a>
            </div>

            <VideoGrid limit={6} />
          </div>
        </section>

        {/* MEMÓRIAS */}

        <section
          id="memorias"
          className="scroll-mt-24 bg-[#080808] text-white"
        >
          <MemoryCarouselDemo />
        </section>

        {/* CONTATO E LOCALIZAÇÃO */}

        <section
          id="contato"
          className="scroll-mt-24 border-t border-white/10 bg-[#111111] py-14 text-white md:py-20"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-10">
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-white/40">
              Contato e localização
            </p>

            <h2 className="mb-10 font-serif text-3xl tracking-tight sm:text-4xl">
              Venha nos visitar.
            </h2>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

              {/* INFORMAÇÕES */}

              <div className="flex flex-col justify-center gap-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold">
                      Endereço
                    </h3>

                    <p className="max-w-sm text-sm leading-7 text-white/60">
                      Rua Maria da Conceição Cunha Nóbrega, 216
                      <br />
                      Mangabeira, João Pessoa – PB
                      <br />
                      CEP 58055-770
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15">
                    <Phone size={20} />
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold">
                      Telefone da igreja
                    </h3>

                    <a
                      href="tel:+558398941104"
                      className="text-sm text-white/65 transition hover:text-white"
                    >
                      {CHURCH_PHONE}
                    </a>
                  </div>
                </div>

                <div>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-md bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-white/85"
                  >
                    <Navigation size={17} />
                    Como chegar
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>

              {/* MAPA */}

              <div className="overflow-hidden rounded-lg border border-white/15 bg-[#202020]">
                <iframe
                  title="Localização da Igreja Filadélfia da Paraíba"
                  src={MAPS_EMBED}
                  width="100%"
                  height="340"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block w-full"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
