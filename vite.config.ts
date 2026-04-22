import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
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
      registerType: "prompt",
      injectRegister: "script",
      devOptions: {
        // enabled: true,
      },
      outDir: "public",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg}", "index.html"],
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
        // screenshots: [
        //   {
        //     src: "/screenshot-1.jpg",
        //     sizes: "1024x1365",
        //     type: "image/jpg",
        //     form_factor: "narrow",
        //     label: "Malcolm",
        //   },
        //   {
        //     src: "/screenshot-2.jpg",
        //     sizes: "1024x1365",
        //     type: "image/jpg",
        //     form_factor: "narrow",
        //     label: "Malcolm, igen",
        //   },
        // ],
        // TODO: Generate the manifest in the backend so that we can localize it
        description: "Jamboree26-appen",
      },
    }),
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    babel({
      presets: [reactCompilerPreset()],
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
      publicAdditionalRootPaths: "",
      publicNotificationsTenant: "",
      publicDevBannerMessage: "",
      publicPayloadApiUrl: "",
      publicPayloadLocales: "",
    },
    devProxy: {
      "/auth/**": {
        target: "https://app.dev.j26.se/",
        changeOrigin: true,
      },
      "/notifications/**": {
        target: "https://app.dev.j26.se/",
        changeOrigin: true,
      },
      "/_services/signupinfo/**": {
        target: "https://app.dev.j26.se/",
        changeOrigin: true,
      },
    },
  },
  // dev server options
  server: {
    allowedHosts: ["local.j26.se"],
  },
});
