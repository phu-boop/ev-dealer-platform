import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    // host: '0.0.0.0', // Dùng cho host public chung vlan
  },
  define: {
    global: "globalThis",
  },
});

