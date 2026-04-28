// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
const isStaticHost = isGitHubPages || isVercel;

export default defineConfig({
  cloudflare: isStaticHost ? false : undefined,
  vite: {
    base: isGitHubPages ? "/zen-startpage/" : "/",
  },
  tanstackStart: isStaticHost
    ? {
        router: {
          basepath: isGitHubPages ? "/zen-startpage" : "/",
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
