import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
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
  server: {
    proxy: {
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
      },
    },
    port: 5173,
    host: true,
    cors: true,
  },
  build: {
    rollupOptions: {
      input: {
        server: "app/server.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "server"
            ? "server/[name].js"
            : "client/[name].[hash].js";
        },
      },
    },
  },
});
