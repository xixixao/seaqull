import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactSvgPlugin from "vite-plugin-react-svg";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/seaqull/",
  resolve: {
    alias: {
      js: path.resolve(__dirname, "./src/js"),
      graph: path.resolve(__dirname, "./src/graph"),
      editor: path.resolve(__dirname, "./src/editor"),
    },
  },
  plugins: [react(), reactSvgPlugin()],
});
