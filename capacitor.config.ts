// @ts-ignore - @capacitor/cli not required for web build, only for `npx cap` CLI
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wugams.erp",
  appName: "WUGAMS",
  webDir: "out",
  // En dev on pointe vers la prod (live updates). En build natif on sert depuis webDir si offline.
  server: {
    url: "https://wugams.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#0a1420",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0a1420",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Geolocation: {
      // iOS/Android permissions handled at runtime
    },
  },
};

export default config;
