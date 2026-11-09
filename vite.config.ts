import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isGitHubPages ? "/yinghuo/" : "/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4310,
    watch: {
      usePolling: true,
      interval: 450,
      ignored: ["**/scripts/**", "**/shots/**", "**/dist/**", "**/node_modules/**"],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4310,
  },
});
