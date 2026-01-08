import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    nitro(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg}"],
      },
      manifest: {
        name: "Jamboree26",
        short_name: "J26",
        // theme_color: "#c61535",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-1.jpg",
            sizes: "1024x1365",
            type: "image/jpg",
            form_factor: "narrow",
            label: "Malcolm",
          },
          {
            src: "/screenshot-2.jpg",
            sizes: "1024x1365",
            type: "image/jpg",
            form_factor: "narrow",
            label: "Malcolm, igen",
          },
        ],
        // TODO: Generate the manifest in the backend so that we can localize it
        description: "Jamboree26-appen",
      },
    }),
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
  // dev server options
  server: {
    allowedHosts: [".ngrok-free.app"],
    proxy: {
      // "/_services/booking": {
      //   target: "http://localhost:8000",
      //   rewrite: (path) => path.replace(/^\/_services\/booking/, ""),
      // },
    },
  },
});
