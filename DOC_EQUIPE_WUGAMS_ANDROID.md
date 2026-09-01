# DOC ÉQUIPE WUGAMS — Android, Sécurité, Vitrine & Déploiement — TOUT SANS EXCEPTION

> **À lire par toute l'équipe (dev, PDG, secrétariat, managers).** Ce document est la source de vérité pour l'app Android, la vitrine dynamique, la sécurité et les mises à jour. Dernière mise à jour : 2026-09-01 — WUGAMS Holding Inc.

---

## 1. CE QUE TU DOIS GARDER JALOUSEMENT (NE JAMAIS PARTAGER EN CLAIR)

| Secret | Où il est | Qui y a accès | Comment le partager |
|--------|-----------|---------------|---------------------|
| **`android.keystore`** (fichier binaire 2557 bytes, PKCS#12) | Racine du projet `android.keystore` **+** 2 backups hors git (voir §2) | **Toi seul** (puis PDG en main propre) | **Jamais** par email/Slack/WhatsApp. Remise en main propre sur clé USB chiffrée + coffre 1Password/Dashlane |
| **Mot de passe keystore** `WugamsJJH@2026Jésus` (storepass = keypass) | Dans ta tête + 1Password | Toi + PDG | 1Password “WUGAMS Android Keystore” (accès PDG uniquement) |
| **Alias** `wugams` | Dans le keystore | Toi + PDG | Avec le keystore |
| **Fichier `android-sha256.txt`** (empreinte, même si publique, garde-le avec la clé) | Généré à côté du keystore puis supprimé du git | Toi | Avec le keystore |
| **Compte Google Play Console** (owner) | https://play.google.com/console | PDG (owner) + toi (admin) | Invitation par email, 2FA obligatoire |

**Ce qui N'EST PAS secret (peut être partagé en clair) :**
- `SHA256` `95:FF:DE:0C:A6:FD:34:B3:16:7D:58:9F:BA:37:22:9D:A2:B4:B0:88:8C:BC:6E:A2:00:41:B9:91:A1:BF:63:C5` — il est public dans `public/.well-known/assetlinks.json:8` et dans le Play Console, tout le monde peut le voir. Pas grave.
- `package_name` `com.wugams.erp`
- `public/manifest.json`, `twa-manifest.json`, `capacitor.config.ts`

**Règle d'or :** si tu perds `android.keystore` **ou** son mot de passe, **tu ne pourras plus jamais mettre à jour l'app sur le Play Store** (Google exige la même clé pour chaque `versionCode` supérieur). Il faudra créer une nouvelle app `com.wugams.erp2` et perdre les avis/installations.

---

## 2. OÙ SONT TES BACKUPS (FAIS-LES MAINTENANT SI CE N'EST PAS FAIT)

1. **Projet local** : `D:\Taf\Wugames-Company\android.keystore` (gitignore, non poussé)
2. **Backup 1 — 1Password** : coffre “WUGAMS Prod” → pièce jointe `android.keystore` + champ mot de passe `WugamsJJH@2026Jésus` + note `alias=wugams, SHA256=95:FF...`
3. **Backup 2 — Clé USB chiffrée** (VeraCrypt ou BitLocker) remise au PDG en main propre
4. **Backup 3 — Drive chiffré** (Google Drive “WUGAMS-Coffre” avec chiffrement côté client, ex: Cryptomator)

Vérifie : `git check-ignore -v android.keystore` doit afficher `.gitignore:49:android.keystore`.

---

## 3. QUOI FAIRE PARVENIR À QUI

### Au PDG (en main propre, pas par WhatsApp)
- Une **clé USB chiffrée** contenant `android.keystore`
- Une enveloppe scellée avec le mot de passe `WugamsJJH@2026Jésus` + `alias=wugams`
- Une page imprimée de ce doc §1-2 + le SHA256
- L'accès **Owner** au Play Console (tu l'invites, il active la 2FA)

### À l'équipe WUGAMS (dev, secrétaires, managers)
- **Ce doc complet** (`DOC_EQUIPE_WUGAMS_ANDROID.md`) via Notion/Drive (pas le mot de passe)
- Le lien du Play Console en **Test interne** (pas besoin du keystore)
- Le guide `ANDROID.md` pour builder la TWA
- Le `SPEC-VITRINE.md` pour la vitrine dynamique

**Ne jamais envoyer à l'équipe :** le `android.keystore` ni son mot de passe.

---

## 4. ANDROID — LES 3 NIVEAUX (RAPPEL)

| Niveau | Quoi | Quand | Effort |
|--------|------|-------|--------|
| **PWA** | Déjà live : `manifest.json` + `sw.js` + `pwa-register.tsx` → Chrome → Installer | Maintenant (0j) | 0 |
| **TWA** | PWA emballée pour le Play Store (`twa-manifest.json`, `assetlinks.json`) | Cette semaine (1-2j) | `bubblewrap build` |
| **Capacitor** | Vrai natif si besoin caméra/géoloc/push FCM (`capacitor.config.ts`) | Si besoin natif | 1-2 sem |

---

## 5. GÉNÉRER LE KEYSTORE (DÉJÀ FAIT, À REFAIRE SEULEMENT SI PERTE)

```powershell
# PowerShell — ne refais cette commande QUE si tu veux une NOUVELLE clé (incompatible avec l'actuelle)
node scripts/gen-keystore.mjs
# ou manuel :
keytool -genkey -v -keystore android.keystore -alias wugams -keyalg RSA -keysize 2048 -validity 10000 -storepass 'WugamsJJH@2026Jésus' -keypass 'WugamsJJH@2026Jésus' -dname "CN=WUGAMS Holding Inc., OU=Mobile, O=WUGAMS, L=Porto-Novo, S=Oueme, C=BJ"
keytool -list -v -keystore android.keystore -alias wugams -storepass 'WugamsJJH@2026Jésus' | Select-String SHA256
```

Actuel SHA256 : `95:FF:DE:0C:A6:FD:34:B3:16:7D:58:9F:BA:37:22:9D:A2:B4:B0:88:8C:BC:6E:A2:00:41:B9:91:A1:BF:63:C5`

---

## 6. PUBLIER / METTRE À JOUR SUR LE PLAY STORE (TWA)

```powershell
# 1. Met à jour l'empreinte si tu as régénéré la clé
# Édite public/.well-known/assetlinks.json → colle le nouveau SHA256 → git push (Vercel déploie en 2 min) → vérifie :
Invoke-RestMethod https://wugams.vercel.app/.well-known/assetlinks.json

# 2. Incrémente la version à chaque release
# Édite twa-manifest.json : "appVersionCode": 1 → 2 → 3 ...

# 3. Build
npm i -g @bubblewrap/cli
bubblewrap build
# → android/app-release-bundle.aab

# 4. Upload sur https://play.google.com/console → WUGAMS → Production → Créer une version → dépose le .aab
```

**Mises à jour suivantes :** tu déploies juste sur Vercel (`git push`), la TWA se met à jour instantanément (c'est le web). Nouvelle `.aab` seulement si tu changes `twa-manifest.json` (icône, nom, permissions).

---

## 7. CAPACITOR (NIVEAU 3, QUAND TU EN AURAS BESOIN)

```powershell
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/geolocation @capacitor/camera @capacitor/push-notifications
npx cap init --web-dir=out
npx cap add android
# capacitor.config.ts pointe déjà vers https://wugams.vercel.app (live updates)
npx cap sync
npx cap open android # → Android Studio → Build → Generate Signed Bundle
# Place google-services.json (Firebase) dans android/app/ pour le push FCM
```

Permissions ajoutées : `ACCESS_FINE_LOCATION`, `CAMERA`, `POST_NOTIFICATIONS` (pour `pointages` et `worker-photo-uploader.tsx`).

---

## 8. VITRINE DYNAMIQUE — QUI FAIT QUOI

- **Public** (`/`, `/boutique`, `/blog`, `/realisations`) : 100% dynamique via `app/lib/api/vitrine.ts` (`?published=true` obligatoire, fallback `localStorage` si API down). Si vide → section masquée sauf `5 filiales` (en dur + dynamique) et témoignages (`Pas de témoignages pour l'instant`).
- **Gérant** : seul à créer/éditer via `/espace/vitrine` (6 onglets : Témoignages/Services/Garanties/Réalisations/Blog/Marquee). Boutons `+` → `POST /vitrine/*`.
- **Délégation** : `/espace/vitrine` → onglet **Permissions** → toggle par utilisateur → `POST /vitrine/permissions {user_id}` (Gérant uniquement, sinon fallback local). `BackOfficeShell` affiche le menu `Vitrine` à tout `canManageVitrine`.

---

## 9. SÉCURITÉ — CE QUI EST EN PLACE

- `proxy.ts` : gate `/espace/*` via cookie `wugams_session` httpOnly (`SameSite=Strict`, `Secure`, 7j) + JWT `exp`/`role` + rate-limit `5 req/60s` sur `/api/v1/auth/*` + redirect `/espace/administration` si non `GERANT/DEV`.
- `app/api/session/route.ts` : `POST` pose le cookie httpOnly, `DELETE` le supprime. `app/lib/api-client.ts` miroir `localStorage` → `fetch("/api/session")` + `isValidSession()` + `cacheKey` avec `token.slice(-12)` (anti poisoning).
- `next.config.ts` : CSP, `X-Frame DENY`, `HSTS`, `COOP/CORP`, `optimizePackageImports` (recharts/gsap/three/motion/lenis), `avif/webp`.
- `cinematic-landing-hero.tsx` : `dangerouslySetInnerHTML` → `<style>`, `innerHTML` snap → `textContent`.
- Mots de passe : jauge `Faible→Très fort` sur `register-form.tsx`, bannière **2FA** pour `GERANT/DEV` dans `back-office-shell.tsx`.

---

## 10. CHECKLIST AVANT CHAQUE RELEASE ANDROID

- [ ] `public/.well-known/assetlinks.json` sert le bon SHA256 (`curl https://wugams.vercel.app/.well-known/assetlinks.json`)
- [ ] `twa-manifest.json:appVersionCode` incrémenté
- [ ] `android.keystore` présent en local (`Test-Path android.keystore`) et **non** dans `git status`
- [ ] `npm run build` OK (20 routes)
- [ ] Screenshots 1080x1920 à jour pour Play Store
- [ ] `privacy-policy` URL renseignée dans Play Console

---

## 11. EN CAS DE PERTE OU FUITE

- **Perte du keystore/mdp** → nouvelle app `com.wugams.erp2`, perte des installs/avis. D'où les 3 backups §2.
- **Fuite du mdp** → régénère un nouveau keystore **et** révoque l'ancien dans Play Console → nouvelle empreinte → nouveau `assetlinks.json`.
- **Fuite du keystore** → idem, considère-le compromis, régénère.

---

*Fin du doc — garde-le dans Notion “WUGAMS — Coffre” + 1 impression papier chez le PDG.*
