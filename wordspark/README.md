# WordSpark — Master 1000 Words in 100 Days

A client-side PWA that helps students (up to 12th standard) learn **1000 advanced English words** through daily reading passages. Install on mobile or tablet, read, learn, and share certificates with parents on WhatsApp.

## Live App

**https://youtextme.github.io/effortless/**

(Free hosting via GitHub Pages — works offline after first visit)

## Features

- **100 days × 10 words** — systematic vocabulary building
- **10 Life Agents** — MECE curriculum covering whole-person growth
- **Daily reading passages** — each word appears ~10 times for natural repetition
- **One-button progress** — mark any day done, track everything locally
- **All 1000 words list** — linear view: black = learned, grey = upcoming
- **Certificates gallery** — all completed days in one place, re-share anytime
- **Journey page** — explains grit, growth mindset, and why 100 days is complete
- **WhatsApp sharing** — certificate images for parents
- **Offline PWA** — install and use without internet

## Quick Start (Local)

```bash
cd wordspark
python3 -m http.server 8080
```

Open http://localhost:8080

### Install as PWA

1. Open the site in Chrome (Android) or Safari (iOS)
2. Tap **Install App** or browser menu → "Add to Home Screen"
3. All progress saves on your device — no account needed

## The 10 Life Agents (MECE)

| Agent | Days | Focus |
|-------|------|-------|
| 🔍 Investigator | 1–10 | Curiosity, evidence, scientific thinking |
| 🗣️ Communicator | 11–20 | Speaking, listening, persuasion |
| 🧠 Analyst | 21–30 | Logic, evaluation, judgment |
| 🌍 Naturalist | 31–40 | Science, nature, systems |
| 🏛️ Historian | 41–50 | Society, culture, citizenship |
| 🎨 Creator | 51–60 | Arts, imagination, innovation |
| 👑 Leader | 61–70 | Grit, growth mindset, influence |
| ♟️ Strategist | 71–80 | Street smarts, strategy, negotiation |
| 🤖 Technologist | 81–90 | AI awareness, digital literacy |
| 🧘 Sage | 91–100 | EQ, reading the room, self-sufficiency |

Each day teaches **2–3 crucial skills** + **10 vocabulary words** + a parent-friendly takeaway.

## How It Works

1. Kid opens app → sees today's lesson with Life Agent
2. Reads passage with highlighted vocabulary
3. Taps **Mark as Done** → certificate generated, progress saved
4. Shares certificate on WhatsApp → parents see words + takeaways
5. Browse **Words** tab for full 1000-word linear list
6. Browse **Certs** tab for all earned certificates
7. Browse **Journey** tab for the full 100-day MECE map

## Deploy

Automatically deploys to GitHub Pages on push to `main` via `.github/workflows/wordspark-pages.yml`.

Manual static hosting: serve the `wordspark/` folder from any static host.

## Project Structure

```
wordspark/
├── index.html
├── manifest.webmanifest
├── sw.js
├── css/app.css
├── js/
│   ├── app.js
│   ├── passage-generator.js
│   ├── certificate.js
│   ├── storage.js
│   └── data/
│       ├── words.js       # 1000 words
│       └── curriculum.js  # 10 agents, MECE framework
└── icons/
```
