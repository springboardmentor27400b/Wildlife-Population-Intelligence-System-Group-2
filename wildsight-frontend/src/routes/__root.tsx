import {
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import type { ReactNode } from "react";

import appCss from "../styles.css?url";

import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import { AppRoot } from "@/AppRoot";


// ============================================================
// ROOT ROUTE
// ============================================================

export const Route = createRootRoute({

  // ==========================================================
  // HEAD
  // ==========================================================

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
        title:
          "WildSight — AI Wildlife Biodiversity Monitoring",
      },

      {
        name: "description",
        content:
          "Enterprise dashboard for wildlife surveys, species tracking, habitat monitoring and biodiversity analytics.",
      },

      {
        property: "og:title",
        content:
          "WildSight — AI Wildlife Biodiversity Monitoring",
      },

      {
        property: "og:description",
        content:
          "Enterprise dashboard for wildlife surveys, species tracking, habitat monitoring and biodiversity analytics.",
      },

      {
        property: "og:type",
        content: "website",
      },

      {
        name: "twitter:card",
        content: "summary_large_image",
      },

      {
        name: "twitter:title",
        content:
          "WildSight — AI Wildlife Biodiversity Monitoring",
      },

      {
        name: "twitter:description",
        content:
          "Enterprise dashboard for wildlife surveys, species tracking, habitat monitoring and biodiversity analytics.",
      },

      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/31c16ddb-2630-4f04-b849-ac33560a39d9/id-preview-e22bfa34--cccfaca3-e145-433f-a7d9-15890b3087ee.lovable.app-1783173484903.png",
      },

      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/31c16ddb-2630-4f04-b849-ac33560a39d9/id-preview-e22bfa34--cccfaca3-e145-433f-a7d9-15890b3087ee.lovable.app-1783173484903.png",
      },

    ],

    links: [

      {
        rel: "stylesheet",
        href: appCss,
      },

      {
        rel: "icon",
        href: "/favicon.ico",
        type: "image/x-icon",
      },

    ],

  }),


  // ==========================================================
  // DOCUMENT SHELL
  // ==========================================================

  shellComponent: RootShell,


  // ==========================================================
  // APPLICATION
  // ==========================================================

  component: AppRoot,


  // ==========================================================
  // NOT FOUND
  // ==========================================================

  notFoundComponent: AppRoot,

});


// ============================================================
// ROOT SHELL
// ============================================================

function RootShell({
  children,
}: {
  children: ReactNode;
}) {

  return (

    <html
      lang="en"
      suppressHydrationWarning
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