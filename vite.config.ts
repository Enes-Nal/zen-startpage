// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  cloudflare: isGitHubPages ? false : undefined,
  vite: {
    base: isGitHubPages ? "/zen-startpage/" : "/",
  },
  tanstackStart: isGitHubPages
    ? {
        router: {
          basepath: "/zen-startpage",
        },
        spa: {
          enabled: true,
          prerender: {
            enabled: true,
            outputPath: "/index.html",
          },
        },
      }
    : undefined,
});
