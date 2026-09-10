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
    backgroundColor: "#090A0C",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      // Marque mobile = vrai logo officiel (fond #090A0C).
      // - Icône native : public/splash-icon.png (emblème exact livre+W, transparent)
      //   à copier dans android/app/src/main/res/drawable/splash_icon.png après `npx cap add android`
      // - Plein écran : public/splash-portrait-1080x1920.png (fichier exact 1600 centré)
      // - Launcher : public/icon-512.png (any) + public/icon-512-maskable.png (adaptive)
      //   → mipmap-anydpi-v26/ic_launcher.xml : background #090A0C + foreground @drawable/splash_icon
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#090A0C",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
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
