# WhatsApp Send Bridge

Send WhatsApp messages from your own Windows PC — **free**, **personal**, **localhost only**.

This is a bridge, not a cloud API. One machine, one WhatsApp account, $0. It drives the **WhatsApp Desktop** app you already have logged in, using the same WebView2 CDP technique that has been proven with verified sends.

## What you need

- **Windows 10/11** with the **WhatsApp Desktop** app from the Microsoft Store (app id `5319275A.WhatsAppDesktop`)
- **Node.js 18+**
- WhatsApp Desktop **logged in** (scan QR once; keep the app open)

## Quick start

```powershell
cd services\whatsapp-send
npm install
```

### 1. Start WhatsApp with CDP (first time or if broken)

```powershell
powershell -File start-whatsapp-cdp.ps1
```

This restarts WhatsApp Desktop with remote debugging on port **9222**, waits until CDP is up, then clears the env var.

### 2. Start the HTTP service

```powershell
npm start
```

The service listens on **http://127.0.0.1:8765** only — not reachable from other machines.

### 3. Send a message from another program

```powershell
curl -X POST http://127.0.0.1:8765/send ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Mom\", \"message\": \"On my way!\"}"
```

Or by phone number:

```powershell
curl -X POST http://127.0.0.1:8765/send ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\": \"15551234567\", \"message\": \"Hello!\"}"
```

## HTTP endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | CDP and login status |
| `POST` | `/fix` | Restart WhatsApp Desktop with CDP |
| `POST` | `/send` | Send a message (JSON body) |
| `GET` | `/list` | List visible chat names |

### POST /send body

```json
{
  "name": "Contact Name",
  "message": "Your message here"
}
```

Or:

```json
{
  "phone": "15551234567",
  "message": "Your message here"
}
```

Provide **name** or **phone**, not both.

## CLI (alternative to HTTP)

```powershell
node cli.js send --name "Mom" --message "On my way!"
node cli.js send --phone 15551234567 --message "Hello!"
node cli.js status
node cli.js list
node cli.js health
node cli.js health --fix
```

## How verification works

After typing and clicking Send, the bridge:

1. Counts how many times your message text appears in the chat (`#main`) **before** and **after**
2. Checks that the composer input box cleared

A send is only marked **verified** when the count went up **and** the composer is empty. Screenshots and debug JSON are saved in `artifacts/` on failure.

## Exit codes (CLI)

| Code | Meaning |
|------|---------|
| 0 | Verified send |
| 2 | Usage error (bad arguments) |
| 3 | CDP down (run heal script or `health --fix`) |
| 4 | No WhatsApp page in CDP |
| 5 | Not logged in (QR visible) |
| 6 | Chat not found |
| 7 | Read-only chat |
| 8 | Send not verified |
| 9 | Internal error |

## Troubleshooting

- **CDP down** → run `start-whatsapp-cdp.ps1` or `node cli.js health --fix`
- **Needs login** → open WhatsApp Desktop and scan the QR code
- **Chat not found** → check the exact contact name in `node cli.js list`, or use phone number
- **Unverified** → check `artifacts/` screenshots; message may have failed to send

## What this is NOT

- Not Twilio, Sinch, Green API, or WhatsApp Business Cloud API
- Not a hosted Baileys service
- Not a web UI
- Not Docker
- Not reachable from the internet (127.0.0.1 only)

## Tests

```powershell
npm test
```

Tests cover input validation and verification logic only — no live WhatsApp connection in CI.
