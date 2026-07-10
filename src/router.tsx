import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { isAuthInitialized, waitUntilAuthInitialized, auth } from "@/lib/firebase";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      auth: {
        get user() {
          return auth?.currentUser || null;
        },
        get initialized() {
          return isAuthInitialized();
        },
        waitUntilInitialized: () => waitUntilAuthInitialized(),
      },
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
