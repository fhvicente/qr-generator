# QRkit

Single-page QR code generator. Next.js 16 (App Router, Turbopack) + React 19 + Tailwind + next-intl 4.
Client-side generation — no data leaves the browser. No login, no friction.

## Features

- Types: URL, WiFi, email, phone, SMS, vCard
- Real-time preview (300ms debounce)
- Customize: colors, logo, error correction, margin
- Export: PNG / SVG / JPG / PDF (512 / 1024 / 2048 px) + copy to clipboard
- Dark mode (auto via `prefers-color-scheme`, manual toggle, no flash)
- i18n: English, Portuguese, Spanish, French
- AdSense slots ready (zero layout shift), SEO content below the fold

## Run

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /en
npm run build    # production build
npm start        # serve production build
```

Locales: `/en`, `/pt`, `/es`, `/fr`.

## Enable AdSense

1. `app/[locale]/layout.tsx` — uncomment the AdSense `<script>` in `<head>`, replace `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID.
2. `components/AdSlot.tsx` — replace `ca-pub-XXXXXXXXXXXXXXXX` (`data-ad-client`) and the `SLOT_IDS` placeholders with your real slot IDs.
3. After the `<ins>` mounts, push the ad. Simplest: add to `layout.tsx` after the loader script:
   ```tsx
   <Script id="ads-init" strategy="afterInteractive">
     {`(adsbygoogle = window.adsbygoogle || []).push({})`}
   </Script>
   ```
   (one push per slot; for multiple slots push inside each AdSlot via a client effect).

Slot heights are reserved in CSS, so ads never push the tool or cause CLS.

## Stack notes

- `qr-code-styling` and `jspdf` are dynamically imported (browser-only).
- Fonts: Bricolage Grotesque (display) + Manrope (body) via `next/font`.
- Theme tokens are CSS custom properties in `app/globals.css`.
- i18n config in `i18n/`, routing proxy in `proxy.ts` (Next 16 renamed `middleware` → `proxy`), strings in `messages/`.
