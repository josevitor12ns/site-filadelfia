
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// Versão dos ícones.
// Ajuda os navegadores a buscar os arquivos atualizados.
const ICON_VERSION = "7";

// Página não encontrada
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl text-foreground">
          404
        </h1>

        <h2 className="mt-4 text-xl text-foreground">
          Página não encontrada
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

// Página de erro
function ErrorComponent({
  error,
  reset,
}: ErrorComponentProps) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl text-foreground">
          Esta página não carregou
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Tentar novamente
          </button>

          <a
            href="/"
            className="border border-input px-4 py-2 text-sm"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

// Configuração principal do site
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Igreja Filadélfia da Paraíba",
      },
      {
        name: "description",
        content:
          "Site oficial da Igreja Filadélfia da Paraíba.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Igreja Filadélfia da Paraíba",
      },
      {
        property: "og:image",
        content:
          "https://igrejafiladelfiadaparaiba.com.br/images/logo-filadelfia.jpg",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:image",
        content:
          "https://igrejafiladelfiadaparaiba.com.br/images/logo-filadelfia.jpg",
      },
      {
        name: "theme-color",
        content: "#080808",
      },
    ],

    links: [
      // Fontes do site
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..500;1,9..144,300..500&family=Manrope:wght@400;500;600&display=swap",
      },

      // Estilos do site
      {
        rel: "stylesheet",
        href: appCss,
      },

      // Favicon PNG para navegadores
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: `/favicon.png?v=${ICON_VERSION}`,
      },

      // Favicon maior para Android
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: `/favicon-192.png?v=${ICON_VERSION}`,
      },

      // Formato tradicional ICO
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: `/favicon.ico?v=${ICON_VERSION}`,
      },

      // Ícone para iPhone e iPad
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: `/apple-touch-icon.png?v=${ICON_VERSION}`,
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Estrutura HTML principal
function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      translate="no"
      className="notranslate"
    >
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Componente principal
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const router = useRouter();

  useEffect(() => {
    const { data } =
      supabase.auth.onAuthStateChange((event) => {
        if (
          event !== "SIGNED_IN" &&
          event !== "SIGNED_OUT" &&
          event !== "USER_UPDATED"
        ) {
          return;
        }

        router.invalidate();

        if (event !== "SIGNED_OUT") {
          queryClient.invalidateQueries();
        }
      });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
