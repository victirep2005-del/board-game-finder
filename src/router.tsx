import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data in memory for a week so the PWA can restore it offline.
        gcTime: 1000 * 60 * 60 * 24 * 7,
        // Treat data as fresh for 5 minutes before re-fetching.
        staleTime: 1000 * 60 * 5,
        // Retry failed queries only when online.
        networkMode: "online",
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
