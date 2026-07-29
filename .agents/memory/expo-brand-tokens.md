---
name: Expo mobile brand tokens
description: Grand Auto Group color palette and font setup for the Expo mobile artifact.
---

The mobile app (`artifacts/booking-mobile`) syncs its design tokens from `artifacts/booking/src/index.css`.

**Colors (dark-only brand):**
- background: `#0d0d0d`, foreground: `#f5f5f5`
- primary (Grand Auto Red): `#D91A27`
- card: `#171717`, border: `#242424`
- muted: `#1c1c1c`, mutedForeground: `#8c8c8c`
- secondary/accent: `#212121`
- radius: 4 (sharp corners)

**Fonts:** `@expo-google-fonts/barlow` + `@expo-google-fonts/barlow-condensed`
- Headings: `BarlowCondensed_800ExtraBold` / `BarlowCondensed_700Bold`
- Body: `Barlow_400Regular` / `Barlow_500Medium` / `Barlow_600SemiBold`

**Why:** The web app uses Barlow Condensed for headers and Barlow for body — mobile must match.

**How to apply:** Import from `@expo-google-fonts/barlow` and `@expo-google-fonts/barlow-condensed` in `_layout.tsx`. Load both in a single `useFonts` call per package (two separate calls needed since each package exports its own hook).
