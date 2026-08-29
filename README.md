# effortless

A self-realization and effortless living platform.

## Daily message

Every morning at **8:00 AM**, send a warm AI-written note to **Sigma Boy** on WhatsApp — free, personal, from your own account.

| Piece | What |
|-------|------|
| **Ollama** | Writes the message locally (`qwen3.5:4b`) |
| **Baileys** | Sends via your WhatsApp (scan QR once) |
| **Task Scheduler** | Runs daily at 8:00 AM |

One machine, one account, **$0**. No Twilio, no Cloud API, no Desktop UI clicking.

### Quick start

```powershell
cd services\daily-message
npm install
node cli.js doctor           # see what's missing
node cli.js link-whatsapp    # scan QR once
node cli.js run-now          # test a send
node cli.js install-schedule # 8:00 AM daily task
```

Edit `config.json` to change the prompt, recipient, or schedule.

Full guide: [services/daily-message/README.md](services/daily-message/README.md)

### Requirements

- Windows 10/11
- Node.js 18+
- Ollama running locally
- WhatsApp on your phone (one-time QR link)
