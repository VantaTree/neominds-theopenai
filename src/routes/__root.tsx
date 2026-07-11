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
      { title: "theOpenAI" },
      {
        name: "description",
        content:
          "theOpenAI",
      },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logos/logo_mini.png", type: "image/svg+xml" },
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
      if (!user) {
        // Clear __session cookie if user is logged out (e.g. session cleared or explicit signOut)
        document.cookie = `__session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
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
