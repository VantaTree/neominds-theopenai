// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    externals: {
      external: [
        "firebase-admin",
        "firebase-admin/auth",
        "firebase-admin/firestore",
        "@google-cloud/firestore"
      ]
    }
  } as any,
  vite: {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["talented-albacore-utterly.ngrok-free.app"],
    },
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      external: [
        "firebase-admin",
        "firebase-admin/auth",
        "firebase-admin/firestore",
        "@google-cloud/firestore"
      ],
      noExternal: ['firebase', '@firebase/*'],
    }
  },
});
