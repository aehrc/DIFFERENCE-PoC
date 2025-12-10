import path from "path";
import { defineConfig } from "vite";
import fs from "fs";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    https: {
      key: fs.readFileSync(path.resolve(__dirname, ".local/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, ".local/cert.pem")),
    },
    port: 5173,
  },
});
