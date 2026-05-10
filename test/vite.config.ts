import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  plugins: [react()],

  optimizeDeps: {
    exclude: [
      "@content-editor/core",
      "@content-editor/editable",
      "@content-editor/utils",
    ],
  },
  resolve: {
    preserveSymlinks: true,
  },
}));
