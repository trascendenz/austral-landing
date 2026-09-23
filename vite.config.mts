import { resolve } from "node:path";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      configPath: "./wrangler.jsonc"
    })
  ],

  input: {
    main: resolve(import.meta.dirname, "index.html"),
    en: resolve(import.meta.dirname, "en.html"),
    es: resolve(import.meta.dirname, "es.html"),
    fr: resolve(import.meta.dirname, "fr.html"),
    de: resolve(import.meta.dirname, "de.html"),
    it: resolve(import.meta.dirname, "it.html")
  }
});