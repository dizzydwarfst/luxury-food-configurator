# AR Launch Runbook

## Scope

- Primary supported:
  - Android + Chrome -> Scene Viewer AR camera mode.
  - iPhone + Safari -> Quick Look AR.
- Secondary fallback:
  - Other mobile browsers/devices -> model export/download + guidance in UI.

## Required setup

- Android:
  - Use latest Chrome.
  - Install/update Google app and Google Play Services for AR (ARCore).
  - Camera permissions granted.
- iPhone:
  - Use Safari (not in-app browser, not Chrome iOS).
  - Camera access allowed for Safari.
- Environment:
  - Test on deployed HTTPS URL.
  - Keep stable network connection.

## Test URLs

- Product test page:
  - `https://luxury-food-configurator.vercel.app/configurator/pizza`
- Optional diagnostics mode:
  - `https://luxury-food-configurator.vercel.app/configurator/pizza?arDebug=1`

## Platform test steps

- Android Chrome:
  - Open product page.
  - Tap `View in AR`.
  - Expected pass: Scene Viewer opens directly to camera AR.
  - If fallback occurs, verify guidance text is shown.
- iPhone Safari:
  - Open product page in Safari.
  - Tap `View in AR`.
  - Expected pass: Quick Look opens and allows AR camera placement.
  - If blocked, verify fallback guidance is shown.

## Non-supported/secondary paths

- Android non-Chrome:
  - Expected: "AR requires Chrome on Android" guidance.
- iPhone non-Safari:
  - Expected: "Open in Safari for iPhone AR" guidance.
- Other desktop/mobile:
  - Expected: GLB export/download fallback with instructions.

## Acceptance gates

- Gate 1: Deploy and assets
  - Production deploy succeeds on Vercel from authorized contributor.
  - `/pizza.glb` returns HTTP 200.
- Gate 2: Android AR
  - Android Chrome opens Scene Viewer camera AR.
- Gate 3: iPhone AR
  - iPhone Safari opens Quick Look AR.
- Gate 4: Fallback UX
  - Unsupported contexts show deterministic guidance without broken flow.
- Gate 5: Core app stability
  - Menu, configurator, cart, order success, and kitchen flows remain functional.

## Current validation snapshot (2026-02-10)

- Verified:
  - Vercel project exists and production URL is stable.
  - `https://luxury-food-configurator.vercel.app/pizza.glb` reachable (HTTP 200).
  - Local build passes.
  - Core local routes pass (`/menu`, `/configurator/pizza`, `/kitchen`, `/order-success/:id` fallback handling).
- User test input:
  - Android Chrome: browser fallback observed (camera AR did not open).
  - iPhone Safari: not tested yet.
- Blocking risk:
  - Current Vercel deployment is blocked by team permission mismatch for git author.
  - Until deploy permission is fixed, latest AR hardening changes cannot be promoted to production.
