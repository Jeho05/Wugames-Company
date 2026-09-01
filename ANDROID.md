# Android — WUGAMS (PWA + TWA + Capacitor)

Ce projet Next.js est **déjà installable sur Android** en tant que PWA. Ce document explique les 3 niveaux pour le Play Store.

---

## Niveau 1 — PWA installable (0 min, déjà live)

- `public/manifest.json` + `public/sw.js` + `app/components/pwa-register.tsx` sont en place.
- Sur Android Chrome : menu ⋮ → **Installer l'application** → icône plein écran, offline, `theme_color #17294b`.
- Test : `https://wugams.vercel.app` → Lighthouse PWA 100.

---

## Niveau 2 — TWA (Trusted Web Activity) pour le Play Store (recommandé, 1–2 jours)

### Prérequis
- Compte Google Play Console ($25, une fois).
- Icônes `public/icon-192.png` + `public/icon-512.png` + `public/icon-512-maskable.png` (générées via `scripts/gen-icons.mjs`).

### Génération TWA via Bubblewrap / PWABuilder
```bash
# Option A : PWABuilder (le plus simple)
# 1. Va sur https://www.pwabuilder.com → entre https://wugams.vercel.app → Build → Android → Download

# Option B : Bubblewrap (CLI, reproductible)
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://wugams.vercel.app/manifest.json
# Réponds : host=wugams.vercel.app, packageId=com.wugams.erp, signingKey=./android.keystore (génère un keystore)
bubblewrap build
# → génère app-release-signed.apk + app-release-bundle.aab
```

### Keystore & SHA256
```bash
keytool -genkey -v -keystore android.keystore -alias wugams -keyalg RSA -keysize 2048 -validity 10000
keytool -list -v -keystore android.keystore -alias wugams | grep SHA256
# Copie le SHA256 dans public/.well-known/assetlinks.json
# Le fichier doit être servi à https://wugams.vercel.app/.well-known/assetlinks.json (déjà présent, à remplacer)
```

### Asset Links
- Le fichier `public/.well-known/assetlinks.json` est déjà créé avec le `package_name: com.wugams.erp`.
- Remplace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` par le vrai fingerprint, push, déploie sur Vercel, vérifie :
  ```
  curl https://wugams.vercel.app/.well-known/assetlinks.json
  ```
- TWA validée : la barre d'URL disparaît, l'app est en plein écran natif.

### Mise à jour
- Aucune review Play Store nécessaire : tu déploies sur Vercel, la TWA se met à jour instantanément (c'est le web).

---

## Niveau 3 — Capacitor hybride (si besoin natif : caméra, géoloc précise, push FCM)

### Quand l'utiliser ?
- Push natif fiable (FCM) au lieu de `Notification` web
- Géoloc en arrière-plan pour `pointages` (`app/lib/geo.ts`)
- Caméra native pour `worker-photo-uploader.tsx`

### Installation
```bash
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/geolocation @capacitor/camera @capacitor/push-notifications @capacitor/filesystem
npx cap init --web-dir=out
# capacitor.config.ts est déjà prêt (server.url=https://wugams.vercel.app)
npx cap add android
npx cap sync
npx cap open android  # ouvre Android Studio
# Dans Android Studio : Build → Generate Signed Bundle / APK
```

### Config déjà prête
- `capacitor.config.ts` pointe vers `https://wugams.vercel.app` (live updates) + `webDir: out`
- Plugins `Geolocation`, `Camera`, `PushNotifications` déclarés
- `android:backgroundColor #0a1420` pour le splash

### Permissions Android (`android/app/src/main/AndroidManifest.xml` généré)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Push FCM
1. Crée un projet Firebase → `google-services.json` dans `android/app/`
2. `npx cap sync` → les `PushNotifications` du `notification-toaster.tsx` basculeront automatiquement sur FCM si dispo.

---

## Checklist Play Store

- [ ] Icônes 512 générées (`scripts/gen-icons.mjs` fait)
- [ ] `public/.well-known/assetlinks.json` avec vrai SHA256
- [ ] `twa-manifest.json` renseigné
- [ ] Keystore sauvegardé (ne jamais le perdre)
- [ ] `versionCode` incrémenté à chaque release
- [ ] Screenshots 1080x1920 pour la fiche Play Store
- [ ] `privacy-policy` URL (à ajouter si collecte de données)

---

## Quelle voie choisir ?

| Besoin | Choisis |
|--------|---------|
| Juste être dans le Play Store, vite | **TWA** |
| Besoin caméra/geo/push natifs fiables | **Capacitor** |
| Perf maximale, offline total, sans serveur | `next export` + `webDir: out` (mais perd SSR) |

Le code actuel n'a besoin d'aucune réécriture pour les 3 voies.
