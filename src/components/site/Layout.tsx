
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Lock,
  MapPin,
  Menu,
  X,
  Youtube,
  ImageIcon,
} from "lucide-react";
import { useSettings } from "@/lib/site";

const siteLinks = [
  { href: "/#inicio", label: "Início" },
  { href: "/#igreja", label: "A igreja" },
  { href: "/#memorias", label: "Memórias" },
  { href: "/#cultos", label: "Cultos" },
  { href: "/#contato", label: "Contato" },
];

function scrollToSection(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string
) {
  const id = href.split("#")[1];

  if (!id || window.location.pathname !== "/") return;

  const section = document.getElementById(id);

  if (!section) return;

  event.preventDefault();

  window.history.replaceState(null, "", href);

  section.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function Logo({
  className = "h-12",
}: {
  className?: string;
}) {
  return (
    <img
      src="/images/logo-filadelfia.jpg"
      alt="Logo C.G.F.B. da Igreja Filadélfia da Paraíba"
      className={`${className} w-auto max-w-[110px] object-contain`}
    />
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 text-white transition-all duration-300 ${
        scrolled
          ? "bg-[#080808]/95 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "bg-[#080808]/90 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 md:h-[84px] md:px-10">
        <a
          href="/#inicio"
          onClick={(event) => {
            setMenuOpen(false);
            scrollToSection(event, "/#inicio");
          }}
          className="flex min-w-0 items-center gap-3"
          aria-label="Ir para o início"
        >
          <Logo className="h-11 md:h-12" />

          <div className="min-w-0 leading-tight">
            <span className="block truncate font-serif text-[17px] font-semibold tracking-tight sm:text-xl">
              Igreja Filadélfia
            </span>

            <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.24em] text-white/45">
              Da Paraíba
            </span>
          </div>
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-7 lg:flex"
        >
          {siteLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) =>
                scrollToSection(event, link.href)
              }
              className="py-3 text-[13px] font-medium text-white/65 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/#contato"
            onClick={(event) =>
              scrollToSection(event, "/#contato")
            }
            className="hidden items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/85 sm:inline-flex"
          >
            Visite-nos
            <ArrowUpRight size={15} />
          </a>

          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 bg-white/5 transition hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegação móvel"
          className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-white/10 bg-[#0b0b0b] px-5 pb-6 pt-3 lg:hidden"
        >
          {siteLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => {
                setMenuOpen(false);
                scrollToSection(event, link.href);
              }}
              className="flex items-center justify-between border-b border-white/10 py-4 text-base text-white/85"
            >
              <span className="flex items-center gap-4">
                <span className="text-[11px] text-white/35">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {link.label}
              </span>

              <ArrowUpRight
                size={17}
                className="text-white/45"
              />
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { data: settings } = useSettings();

  return (
    <footer className="border-t border-white/10 bg-[#080808] text-white">
      <div className="mx-auto max-w-[1500px] px-5 pt-12 md:px-10 md:pt-14">
        <div className="grid gap-10 pb-12 md:grid-cols-[1.5fr_0.8fr_1fr] md:gap-14">
          <div>
            <p className="font-serif text-2xl font-semibold tracking-tight">
              Igreja Filadélfia
            </p>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
              Da Paraíba
            </p>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">
              Uma comunidade de fé, comunhão e histórias
              que permanecem.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-white/50 hover:text-white"
                >
                  <Instagram size={17} />
                </a>
              )}

              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-white/50 hover:text-white"
                >
                  <Facebook size={17} />
                </a>
              )}

              <a
                href={
                  settings?.youtube_url ||
                  "https://www.youtube.com/@igfiladelfiapb"
                }
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/65 transition hover:border-white/50 hover:text-white"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Navegação
            </h2>

            <nav
              aria-label="Navegação do rodapé"
              className="flex flex-col items-start gap-3"
            >
              {siteLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) =>
                    scrollToSection(event, link.href)
                  }
                  className="text-sm text-white/65 transition hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Contato
            </h2>

            <div className="space-y-4 text-sm leading-6 text-white/60">
              {settings?.address && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={17}
                    className="mt-1 shrink-0 text-white/50"
                  />
                  <span>{settings.address}</span>
                </div>
              )}

              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="block break-all transition hover:text-white"
                >
                  {settings.email}
                </a>
              )}

              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition hover:text-white"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              )}

              <a
                href="/#contato"
                onClick={(event) =>
                  scrollToSection(event, "/#contato")
                }
                className="inline-flex items-center gap-2 border-b border-white/40 pb-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:border-white"
              >
                Como chegar
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Igreja Filadélfia da Paraíba.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <span>João Pessoa · PB</span>

            <Link
              to="/auth"
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <Lock size={13} />
              Painel administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const scrollToHash = () => {
      const id = decodeURIComponent(
        window.location.hash.slice(1)
      );

      if (!id) return;

      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    const frame = window.requestAnimationFrame(scrollToHash);

    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[110] rounded-md bg-white p-3 text-black focus:not-sr-only"
      >
        Ir ao conteúdo
      </a>

      <SiteHeader />

      <div
        id="main-content"
        className="min-h-screen pt-[76px] md:pt-[84px]"
      >
        {children}
      </div>

      <SiteFooter />
    </>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  dark,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] ${
          dark ? "text-white/45" : "text-black/45"
        }`}
      >
        {eyebrow}
      </p>

      <h2 className="font-serif text-3xl leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>

      {sub && (
        <p
          className={`mt-6 max-w-2xl text-base leading-7 ${
            dark ? "text-white/60" : "text-black/60"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function ImageSlot({
  url,
  alt,
  label,
  className = "",
}: {
  url?: string;
  alt: string;
  label: string;
  className?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-black/20 bg-[#e9e9e9] p-6 text-center text-black/55 ${className}`}
    >
      <ImageIcon size={28} strokeWidth={1.4} />

      <p className="text-sm font-medium">{label}</p>

      <p className="max-w-[220px] text-xs leading-5">
        Imagem ainda não cadastrada.
      </p>
    </div>
  );
}
