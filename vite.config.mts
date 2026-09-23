import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  appType: "mpa",

  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, "index.html"),
            en: resolve(__dirname, "en.html"),
            es: resolve(__dirname, "es.html"),
            fr: resolve(__dirname, "fr.html"),
            de: resolve(__dirname, "de.html"),
            it: resolve(__dirname, "it.html"),
            ptbr: resolve(__dirname, "pt-br.html"),
          },
        },
      },
    },
  },

  plugins: [
    cloudflare({
      configPath: "./wrangler.jsonc",
    }),
  ],
});