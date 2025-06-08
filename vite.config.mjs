import { fileURLToPath, URL } from "node:url";

import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import dotenv from "dotenv";
dotenv.config();

const apiUrl = process.env.VITE_BASE_URL;

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/micro-api": {
        target: "http://localhost:5100",
        changeOrigin: true,
        secure: false,
        credentials: true,
      },
      "/api/v1": {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
        credentials: true,
      },
      "/images": {
        target: "http://localhost:5100",
        changeOrigin: true,
        secure: false,
        credentials: true,
      },
    },
  },
});
