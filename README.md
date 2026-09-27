# HomeSahay (Cooperative Gig Services Platform)

This is the frontend prototype for HomeSahay. It is built using React Native and Expo (SDK 51+) with Web and Native support.

## 3 Independent Apps in One Repository

Each role runs as its own standalone application on a dedicated port with its own branding, routes, and without any role switcher:

| App | Command (Web) | Native / Dev Server | Port | App Name & Bundle |
|---|---|---|---|---|
| **Customer App** | `npm run web:customer` | `npm run customer` | `8081` | **HomeSahay** (`com.homesahay.app`) |
| **Worker Partner** | `npm run web:worker` | `npm run worker` | `8082` | **HomeSahay Partner** (`com.homesahay.worker`) |
| **Cooperative Admin** | `npm run web:admin` | `npm run admin` | `8083` | **HomeSahay Admin** (`com.homesahay.admin`) |

### Running Locally

To launch any of the three apps independently, simply run:

```bash
# 1. Customer App (Port 8081)
npm run web:customer

# 2. Worker Partner App (Port 8082)
npm run web:worker

# 3. Cooperative Admin App (Port 8083)
npm run web:admin
```

### Combined / Hackathon Demo Mode
If you run `npm run web` (or `npx expo start --web`) without setting any role, it boots into **Demo Mode** featuring the Role Picker splash screen and floating Role Switcher for easy side-by-side presentation.

## Build Profiles (EAS)

The `eas.json` is configured to build distinct standalone binaries.
To build a specific variant, use the `--profile` flag:

```bash
eas build --profile production-worker --platform android
```
