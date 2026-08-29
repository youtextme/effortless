# effortless

A self-realization and effortless living platform.

## WhatsApp connector

A pluggable service: define **jobs** (prompt + model + destination + schedule), local **Ollama** writes the message, **Baileys** sends it on WhatsApp. Scan QR once per machine. Run on a schedule or on demand.

One machine, one account, **$0**. No Twilio, no Cloud API, no Desktop UI clicking.

### Quick start

```powershell
cd services\whatsapp-connector
npm install
node cli.js doctor
node cli.js link-whatsapp
node cli.js run-now sigma-boy-morning
node cli.js install-schedule
```

Jobs live in `jobs.json`. An example **Sigma Boy @ 08:00** job is included.

Full guide: [services/whatsapp-connector/README.md](services/whatsapp-connector/README.md)

### Requirements

- Windows 10/11 (or Linux/macOS with cron)
- Node.js 18+
- Ollama running locally
- WhatsApp on your phone (one-time QR link)
