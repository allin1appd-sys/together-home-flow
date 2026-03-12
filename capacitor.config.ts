import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.homehub.app",
  appName: "HomeHub",
  webDir: "dist",
  server: {
    url: "https://2fc7b9e2-e7d0-41b3-9b05-178a47f441b8.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
};

export default config;
