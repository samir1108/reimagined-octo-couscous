import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.consciousos.yogic-companion",
  appName: "ConsciousOS",
  webDir: "dist",
  server: {
    cleartext: true,
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    Health: {
      // Surfaces the Apple HealthKit / Android Health Connect prompts on first sync
    },
  },
};

export default config;
