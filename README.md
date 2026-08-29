# effortless

A self-realization and effortless living platform.

## Daily message (first capability)

Every morning at **8:00 AM**, send a warm AI-written note to **Sigma Boy** on WhatsApp — free, personal, from your own account.

- **Local Ollama** writes the message (`qwen3.5:4b`)
- **Baileys** sends it via your WhatsApp (scan QR once)
- **Windows Task Scheduler** runs it daily

One machine, one account, **$0**. No Twilio, no cloud API keys, no paid services.

### Quick start

```powershell
cd services\daily-message
npm install
node cli.js link-whatsapp    # scan QR once
node cli.js run-now          # test a send
node cli.js install-schedule # 8:00 AM daily task
```

Edit `config.json` to change the prompt, recipient, or model.

Full guide: [services/daily-message/README.md](services/daily-message/README.md)

### Requirements

- Windows 10/11
- Node.js 18+
- Ollama running locally
- WhatsApp on your phone (for one-time QR link)

### Legacy: WhatsApp Desktop CDP bridge

An experimental Desktop CDP bridge exists at [services/whatsapp-send/](services/whatsapp-send/) but is **not recommended** for daily unattended sends. Use `daily-message` instead.
