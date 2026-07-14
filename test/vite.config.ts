import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  plugins: [react()],

  optimizeDeps: {
    exclude: ["@ce/editor", "@ce/editable", "@ce/common"],
  },
  resolve: {
    preserveSymlinks: true,
  },
}));
