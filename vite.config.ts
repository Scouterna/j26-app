import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const J26_PREFIX = "J26_PUBLIC_";

function buildConfig(env: Record<string, string>): Record<string, string> {
  const config: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(J26_PREFIX)) continue;
    const stripped = key.slice(J26_PREFIX.length);
    const camel = stripped
      .toLowerCase()
      .replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    config[camel] = value;
  }
  return config;
}

function serveConfig(
  middlewares: {
    use: (
      path: string,
      handler: (req: unknown, res: import("node:http").ServerResponse) => void,
    ) => void;
  },
  env: Record<string, string>,
) {
  middlewares.use("/config.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(buildConfig(env)));
  });
}

function runtimeConfigPlugin(): Plugin {
  let env: Record<string, string> = {};
  return {
    name: "runtime-config",
    configResolved(config) {
      env = loadEnv(config.mode, config.root, "");
    },
    configureServer: (server) => serveConfig(server.middlewares, env),
    configurePreviewServer: (server) => serveConfig(server.middlewares, env),
  };
}

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    plugins: [
      runtimeConfigPlugin(),
      VitePWA({
        registerType: "prompt",
        injectRegister: "script",
        strategies: "injectManifest",
        devOptions: {
          // enabled: true,
        },
        srcDir: "src",
        filename: "sw.ts",
        injectManifest: {
          globDirectory: "dist",
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
    server: {
      allowedHosts: ["local.j26.se"],
    },
  };
});
