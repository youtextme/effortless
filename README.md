# effortless

A self-realization and effortless living platform.

## WhatsApp send (first capability)

Send a WhatsApp message from your own computer, for free, using the WhatsApp Desktop app already logged in on your Windows PC.

This is a **personal bridge**: one machine, one account, $0. No Twilio, no cloud API keys, no paid services. It drives WhatsApp Desktop over localhost CDP — the same technique already proven with verified sends.

### Quick start

1. Open PowerShell in `services/whatsapp-send`
2. Run `npm install`
3. Run `powershell -File start-whatsapp-cdp.ps1` (starts WhatsApp with debugging)
4. Run `npm start` (HTTP service on http://127.0.0.1:8765)
5. POST a message:

```json
POST http://127.0.0.1:8765/send
{ "name": "Contact Name", "message": "Hello!" }
```

See [services/whatsapp-send/README.md](services/whatsapp-send/README.md) for full setup, CLI usage, troubleshooting, and exit codes.

### Requirements

- Windows 10/11
- WhatsApp Desktop (Microsoft Store) logged in
- Node.js 18+
