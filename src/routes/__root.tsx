import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { LightboxProvider } from "@/components/mymind/LightboxContext";
import { auth as firebaseAuth, isAuthInitialized, waitUntilAuthInitialized } from "@/lib/firebase";
import { type User, onAuthStateChanged } from "firebase/auth";

import appCss from "../styles.css?url";

export interface RouterContext {
  queryClient: QueryClient;
  auth: {
    user: User | null;
    initialized: boolean;
    waitUntilInitialized: () => Promise<void>;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "mymind — Remember everything. Organize nothing." },
      {
        name: "description",
        content:
          "A private place to save your most precious notes, images, quotes and highlights. Enhanced with AI.",
      },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    if (!firebaseAuth) {
      router.update({
        context: {
          ...router.options.context,
          auth: {
            user: null,
            initialized: true,
            waitUntilInitialized: () => Promise.resolve(),
          },
        },
      });
      return;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      router.update({
        context: {
          ...router.options.context,
          auth: {
            user,
            initialized: true,
            waitUntilInitialized: () => Promise.resolve(),
          },
        },
      });
    });
    return unsubscribe;
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <LightboxProvider>
        <Outlet />
      </LightboxProvider>
    </QueryClientProvider>
  );
}
