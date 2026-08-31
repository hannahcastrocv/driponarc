import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes every asset path relative, so the build works everywhere
// with no per-repository edits:
//   - local dev and preview
//   - GitHub Pages project sites served from https://<user>.github.io/<repo>/
//   - a root custom domain later
// No repository name is hard-coded anywhere. If you ever switch to a router with
// deep links, change this to "/<your-repo>/" instead. This SPA uses in-page
// navigation, so relative base is the simplest correct choice.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
