
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

import type { ReactNode } from "react";

export const Route = createRootRoute({
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
          "Site oficial da Igreja Filadélfia da Paraíba, em João Pessoa. Conheça nossa igreja, cultos, mensagens e memórias.",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/jpeg",
        href: "/images/logo-filadelfia.jpg",
      },
      {
        rel: "apple-touch-icon",
        href: "/images/logo-filadelfia.jpg",
      },
    ],
  }),

  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
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
