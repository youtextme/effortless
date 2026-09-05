# WordSpark — Master 1000 Words in 100 Days

A client-side PWA that helps students (up to 12th standard) learn **1000 advanced English words** through daily reading passages. Install on mobile or tablet, read, learn, and share certificates with parents on WhatsApp.

## Features

- **100 days × 10 words** — systematic vocabulary building
- **Daily reading passages** — each word appears ~10 times for natural repetition
- **Highlighted vocabulary** — words stand out as kids read
- **Shareable certificates** — PNG image with 10 learned words, meanings, and key takeaways
- **WhatsApp sharing** — Web Share API on mobile, download fallback
- **Progress tracking** — streaks, words learned, day completion (localStorage)
- **Offline PWA** — install and use without internet after first load

## Quick Start

```bash
cd wordspark
python3 -m http.server 8080
```

Open http://localhost:8080 on your phone or browser.

### Install as PWA

1. Open the site in Chrome (Android) or Safari (iOS)
2. Tap **Install App** or use browser menu → "Add to Home Screen"
3. Use offline after first visit

## How It Works

1. **Kid opens app** → sees today's lesson (Day 1–100)
2. **Reads the passage** → 10 advanced words highlighted, each repeated many times
3. **Finishes reading** → gets a certificate with words learned + parent takeaways
4. **Shares on WhatsApp** → parents see progress and vocabulary list
5. **Next day** → 10 new words. In 100 days = 1000 words mastered.

## Project Structure

```
wordspark/
├── index.html          # Main app
├── manifest.webmanifest
├── sw.js               # Service worker (offline cache)
├── css/app.css
├── js/
│   ├── app.js          # Main UI logic
│   ├── passage-generator.js
│   ├── certificate.js  # Canvas certificate + share
│   ├── storage.js      # localStorage progress
│   └── data/words.js   # 1000 words (generated)
├── icons/
└── scripts/generate-words.mjs
```

## Regenerate Word Data

```bash
node scripts/generate-words.mjs > js/data/words.js
```

## Deploy

Static hosting only — no backend required:

- GitHub Pages
- Netlify / Vercel
- Any static file server

Serve from the `wordspark/` directory root.
