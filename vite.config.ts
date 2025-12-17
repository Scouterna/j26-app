import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    nitro(),
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  nitro: {
    serverDir: "./server",
    runtimeConfig: {
      publicTolgeeApiUrl: "",
      publicTolgeeApiKey: "",
      publicTolgeeProjectId: "",
      publicTolgeeBackendFetchPrefix: "",
      publicAppConfigs: "",
      publicBottomNavItems: "",
    },
  },
});
