# WhatsApp Connector

Send AI-written messages on WhatsApp from your own computer — **free**, **personal**, **$0**.

Define **jobs** in one file: each job has a prompt, a local AI model, a WhatsApp destination, and a daily schedule. The connector calls **Ollama** on your PC, then sends the result via a **linked-device** WhatsApp session (scan QR once).

No paid APIs. No Twilio. No WhatsApp Cloud API. No clicking WhatsApp Desktop.

## What you need

- Windows 10/11 (or Linux/macOS with cron)
- Node.js 18+
- [Ollama](https://ollama.com) running locally
- Your phone with WhatsApp (one-time QR link)

## Setup

### 1. Install

```powershell
cd services\whatsapp-connector
npm install
```

### 2. Check health

```powershell
node cli.js doctor
```

### 3. Link WhatsApp (once per computer)

```powershell
node cli.js link-whatsapp
```

On your phone: **WhatsApp → Linked Devices → Link a Device** → scan the QR code.

### 4. See example jobs

`jobs.json` ships with one example: **sigma-boy-morning** at **08:00** to **Sigma Boy**.

```powershell
node cli.js list-jobs
```

### 5. Test a send

```powershell
node cli.js run-now sigma-boy-morning
```

### 6. Install daily schedules

```powershell
node cli.js install-schedule
```

On Windows this creates one Task Scheduler entry per enabled job. On Linux/macOS it installs cron lines (or writes a fragment file if `crontab` is unavailable).

## Add your own job

### Option A: Edit `jobs.json`

Add an object to the `"jobs"` array:

```json
{
  "id": "mom-birthday",
  "enabled": true,
  "to": "Mom",
  "schedule": "09:00",
  "model": "qwen3.5:4b",
  "prompt": "Write a short cheerful good-morning message."
}
```

Use `"phone": "15551234567"` instead of `"to"` for a phone number.

### Option B: CLI

```powershell
node cli.js add-job --id mom-morning --to "Mom" --schedule 09:00 --prompt "Write a cheerful good morning."
```

Then re-run `install-schedule` to register the new time.

### Remove a job

```powershell
node cli.js remove-job mom-morning
```

## Commands

| Command | What it does |
|---------|-------------|
| `link-whatsapp` | Scan QR, save session on this machine |
| `add-job` | Add/update a job (`--id`, `--to` or `--phone`, `--schedule`, `--prompt`) |
| `list-jobs` | Show all jobs |
| `remove-job <id>` | Delete a job |
| `run-now <id>` | Generate with Ollama + send now |
| `install-schedule` | Register every **enabled** job |
| `doctor` | Health check |

## HTTP (localhost only)

```powershell
npm start
```

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Same as `doctor` |
| `GET` | `/jobs` | List jobs |
| `POST` | `/jobs` | Add/update job (JSON body) |
| `POST` | `/jobs/:id/run` | Run one job now |

Example from another program:

```powershell
curl -X POST http://127.0.0.1:8770/jobs/sigma-boy-morning/run
```

## Settings (`jobs.json` → `settings`)

| Field | Default | Meaning |
|-------|---------|---------|
| `ollamaUrls` | `11434`, then `8817` | Tries direct Ollama first, then your existing router (not modified) |
| `defaultModel` | `qwen3.5:4b` | Used when a job omits `model` |
| `defaultModelFallback` | `llama3.2:3b` | Fallback model |

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | Usage error |
| 3 | Config error |
| 4 | Job not found |
| 5 | Ollama unreachable |
| 6 | Ollama generation failed |
| 7 | WhatsApp not linked |
| 8 | WhatsApp send failed |
| 9 | Chat not found |
| 10 | Schedule install failed |
| 11 | Internal error |

## Tests

```powershell
npm test
```

## What this is NOT

- Not UI automation or Desktop clicking
- Not a cloud or paid WhatsApp API
- Not modifying your Ollama router at port 8817
