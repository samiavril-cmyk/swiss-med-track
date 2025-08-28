import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Use repo subpath as base on GitHub Pages; fallback to './' locally
  base: process.env.GITHUB_PAGES === 'true' ? '/swiss-med-track/' : './',
  build: {
    // Output to docs/ so GitHub Pages (Deploy from branch) can serve it
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
