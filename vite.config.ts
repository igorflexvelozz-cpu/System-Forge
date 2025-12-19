import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import http from 'http';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    hmr: {
      clientPort: 3000,
      port: 3000,
    },
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    // Allow configuring backend URL via environment (VITE_BACKEND_URL or BACKEND_URL).
    // If not set, default to http://localhost:8001 and warn during development.
    // The proxy rewrites `/api/*` to the backend root (drops the /api prefix).
    // Example to override when running vite: VITE_BACKEND_URL=http://localhost:8001 npm run dev
    // NOTE: ECONNREFUSED proxy errors mean the backend isn't running at the target URL.
    proxy: (() => {
      const backend = process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000";
      if (!process.env.VITE_BACKEND_URL && !process.env.BACKEND_URL && process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`[vite] VITE_BACKEND_URL not set — dev proxy will target ${backend}. Start backend or set VITE_BACKEND_URL to avoid ECONNREFUSED proxy errors.`);
      }

      return {
        '/api': {
          target: backend,
          changeOrigin: true,
          // No timeout limit
          timeout: 0,
          // No proxy timeout limit
          proxyTimeout: 0,
          followRedirects: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          // Increase payload limit to 50MB
          limit: '200mb',
          // Keep alive settings
          agent: new http.Agent({ keepAlive: true }),
          // Increase connection pool size
          maxSockets: 100,
          // Increase request timeout to 1 hour
          proxyReq: (proxyReq: http.ClientRequest) => {
            proxyReq.setTimeout(3600000);
          }
        },
      };
    })(),
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
