# Daily Message

Every morning at **8:00 AM** (your local time), send a warm AI-written note to **Sigma Boy** on WhatsApp.

**Free. Personal. Your own account. $0.**

No paid APIs. No Twilio. No WhatsApp Cloud API. No clicking WhatsApp Desktop. This uses:

1. **Ollama** on your PC to write the message
2. **Baileys** (WhatsApp linked-device protocol) to send it — scan a QR code once
3. **Windows Task Scheduler** to run it every day at 8:00 AM

## What you need

- Windows 10/11
- Node.js 18+
- [Ollama](https://ollama.com) running on your PC
- Your phone with WhatsApp (to scan QR once)

## Setup

### 1. Install

Open PowerShell in this folder:

```powershell
cd services\daily-message
npm install
```

### 2. Check everything

```powershell
node cli.js doctor
```

You should see what's missing (Ollama, WhatsApp session, etc.).

### 3. Link WhatsApp (one time)

```powershell
node cli.js link-whatsapp
```

On your phone: **WhatsApp → Linked Devices → Link a Device** → scan the QR code.

The session is saved in `data/whatsapp-auth/`. You only do this once.

### 4. Edit the prompt (optional)

Open `config.json`. Change `prompt` to whatever you like. Defaults are set for Sigma Boy.

### 5. Test a send now

Make sure Ollama is running:

```powershell
node cli.js run-now
```

Sigma Boy should receive a message.

### 6. Install the daily 8:00 AM task

```powershell
node cli.js install-schedule
```

Creates a Windows task named `effortless-daily-message`.

## Config (`config.json`)

| Field | Default | Meaning |
|-------|---------|---------|
| `to` | `Sigma Boy` | WhatsApp chat name |
| `schedule` | `08:00` | Local time, 24-hour format |
| `model` | `qwen3.5:4b` | Primary Ollama model |
| `modelFallback` | `llama3.2:3b` | Fallback if primary unavailable |
| `ollamaUrls` | `11434`, then `8817` | Tries direct Ollama first, then your existing router (not modified) |
| `prompt` | (see file) | What Ollama should write |

## Commands

| Command | What it does |
|---------|-------------|
| `node cli.js doctor` | Check config, Ollama, session, recipient |
| `node cli.js link-whatsapp` | Scan QR, save session, find Sigma Boy |
| `node cli.js run-now` | Generate + send one message now |
| `node cli.js install-schedule` | Create daily Windows task at configured time |

### Optional HTTP (localhost only)

```powershell
npm start
```

- `GET http://127.0.0.1:8770/health` — same as `doctor`
- `POST http://127.0.0.1:8770/run-now` — trigger one send

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | Usage error (wrong command) |
| 3 | Config error |
| 4 | Ollama not reachable |
| 5 | Ollama generation failed |
| 6 | WhatsApp not linked |
| 7 | WhatsApp send failed |
| 8 | Chat not found |
| 9 | Schedule install failed |
| 10 | Internal error |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `doctor` shows Ollama FAIL | Start Ollama or run `ollama serve` |
| Model not found | `ollama pull qwen3.5:4b` |
| WhatsApp session FAIL | `node cli.js link-whatsapp` |
| Chat not found | Check exact chat name matches `config.json` `to` field |
| Task didn't run | Task Scheduler → `effortless-daily-message` → Last Run Result |

## Tests

```powershell
npm test
```

Tests config validation and Ollama client logic (mocked — no live WhatsApp or Ollama in CI).

## What this is NOT

- Not UI automation or Desktop clicking
- Not a cloud service or paid API
- Not modifying your Ollama router at port 8817
