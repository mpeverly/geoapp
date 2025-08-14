import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    react(), 
    cloudflare({
      // Disable wrangler config validation during build
      // This separates frontend build from backend configuration
      wrangler: {
        configPath: undefined, // Don't validate wrangler config during build
      }
    })
  ],
});
