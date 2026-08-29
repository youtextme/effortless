# Daily Message

Every morning at **8:00 AM**, send a warm, AI-written note to **Sigma Boy** on WhatsApp — free, personal, from your own account.

No paid APIs. No Twilio. No WhatsApp Cloud API. No driving WhatsApp Desktop with a browser. This uses:

- **Local Ollama** on your PC to write the message (`qwen3.5:4b`, fallback `llama3.2:3b`)
- **Baileys** (WhatsApp Web protocol) to send it — scan a QR code once, session stays on disk

One machine, one account, **$0**.

## What you need

- **Windows 10/11**
- **Node.js 18+**
- **Ollama** running locally (`http://127.0.0.1:11434`) with `qwen3.5:4b` pulled
- Your phone with WhatsApp (to scan QR once)

## Setup (5 steps)

### 1. Install

Open PowerShell in this folder:

```powershell
cd services\daily-message
npm install
```

### 2. Edit the prompt (optional)

Open `config.json`. The defaults are already set for Sigma Boy at 8:00 AM. Change the `prompt` field to whatever you like — topics, tone, length.

### 3. Link WhatsApp (one time)

```powershell
node cli.js link-whatsapp
```

Scan the QR code with your phone: **WhatsApp → Linked Devices → Link a Device**.

The session is saved in `data/whatsapp-auth/`. You only do this once (unless you log out).

### 4. Test a send now

Make sure Ollama is running, then:

```powershell
node cli.js run-now
```

You should see Ollama generate a message and send it to Sigma Boy.

### 5. Install the 8:00 AM daily task

```powershell
node cli.js install-schedule
```

This creates a Windows Scheduled Task named `effortless-daily-message` that runs every day at 8:00 AM local time.

## Config file (`config.json`)

| Field | What it does |
|-------|-------------|
| `to` | WhatsApp chat name (default: `Sigma Boy`) |
| `schedule` | Human-readable schedule (default: `daily at 8:00 AM`) |
| `hour` / `minute` | Backup time if schedule text can't be parsed |
| `model` | Primary Ollama model (default: `qwen3.5:4b`) |
| `modelFallback` | Fallback model (default: `llama3.2:3b`) |
| `ollamaUrls` | Try `11434` first, then `8817` (your existing router — not modified) |
| `prompt` | Instructions for what Ollama should write |

## Commands

| Command | What it does |
|---------|-------------|
| `node cli.js link-whatsapp` | Scan QR, save session, find Sigma Boy chat |
| `node cli.js run-now` | Generate + send one message right now |
| `node cli.js install-schedule` | Create Windows daily 8 AM task |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Ollama not reachable | Start Ollama app or run `ollama serve` |
| Model not found | Run `ollama pull qwen3.5:4b` |
| Chat not found | Make sure "Sigma Boy" matches the exact WhatsApp chat name, then re-run `link-whatsapp` |
| Session expired | Run `link-whatsapp` again and scan QR |
| Task didn't run | Open Task Scheduler → `effortless-daily-message` → check Last Run Result |

## How it works

```
8:00 AM Task Scheduler
        ↓
   run-now (cli.js)
        ↓
   Ollama (local) writes message from prompt
        ↓
   Baileys sends to Sigma Boy via saved session
```

## Tests

```powershell
npm test
```

Tests cover config validation and Ollama client logic (mocked — no live Ollama or WhatsApp in CI).

## What this is NOT

- Not a cloud service
- Not WhatsApp Business API
- Not driving WhatsApp Desktop UI
- Not modifying your Ollama router at port 8817 (only calls it as fallback)
