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
    },
  },
});
