import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "~": "/app",
      assets: "/app/assets",
      components: "/app/components",
      modules: "/app/modules",
      types: "/app/types",
      routes: "/app/routes",
      styles: "/app/styles",
      config: "/app/config",
      utils: "/app/utils",
      models: "/app/models",
      providers: "/app/providers",
      api: "/app/api",
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router"],
  },
  server: {
    proxy: {
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
      },
    },
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        "!**/node_modules/@react-router/**/*",
        "!**/node_modules/@vitejs/**/*",
        "!**/node_modules/vite/**/*",
        "!**/node_modules/tailwindcss/**/*",
        "!**/node_modules/react/**/*",
        "!**/node_modules/react-dom/**/*",
      ],
    },
    port: 5173,
    host: true,
    cors: true,
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
});
