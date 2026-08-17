// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: {
          enabled: false,
        },
        workbox: {
          // Cache the app shell and navigation routes.
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/api\//, /^\/\~oauth/],
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname === "/",
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
            {
              urlPattern: /\.(?:js|css)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "assets",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "images",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],
        },
        manifest: false,
      }),
    ],
  },
});
