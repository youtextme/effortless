#!/usr/bin/env node
/**
 * Generate a kid-safe Blog snack JSON via local Ollama.
 *
 * Usage:
 *   node scripts/generate-blog-snack.mjs "Why do stars twinkle?"
 *   node scripts/generate-blog-snack.mjs --topic "Growth mindset" --out web/snack-blog/content/generated.json
 *   node scripts/generate-blog-snack.mjs --help
 *
 * Requires: Ollama running at http://127.0.0.1:11434 with a chat-capable model pulled.
 * Default model: llama3.2 (override with OLLAMA_MODEL env var).
 */

const DEFAULT_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const MAX_WORDS = 80;
const MIN_SCREENS = 6;
const MAX_SCREENS = 8;

function printHelp() {
  console.log(`Generate Blog snack JSON via Ollama

Usage:
  node scripts/generate-blog-snack.mjs "<topic>"
  node scripts/generate-blog-snack.mjs --topic "<topic>" [--out path] [--model name]

Options:
  --topic   Subject for the snack (required)
  --out     Write JSON to file (default: stdout)
  --model   Ollama model tag (default: ${DEFAULT_MODEL})
  --host    Ollama base URL (default: ${DEFAULT_HOST})
  --help    Show this message

Environment:
  OLLAMA_HOST   Same as --host
  OLLAMA_MODEL  Same as --model

Example:
  ollama pull llama3.2
  ollama serve
  node scripts/generate-blog-snack.mjs "Curiosity and asking questions" --out web/snack-blog/content/my-snack.json
`);
}

function parseArgs(argv) {
  const args = { topic: "", out: "", model: DEFAULT_MODEL, host: DEFAULT_HOST, help: false };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--topic") {
      args.topic = argv[++i] || "";
    } else if (arg === "--out") {
      args.out = argv[++i] || "";
    } else if (arg === "--model") {
      args.model = argv[++i] || DEFAULT_MODEL;
    } else if (arg === "--host") {
      args.host = argv[++i] || DEFAULT_HOST;
    } else if (!arg.startsWith("-") && !args.topic) {
      args.topic = arg;
    }
  }

  return args;
}

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function validateSnack(snack) {
  if (!snack || typeof snack !== "object") {
    throw new Error("Response is not an object");
  }
  if (!snack.title || !Array.isArray(snack.screens)) {
    throw new Error("JSON must include title and screens[]");
  }
  const n = snack.screens.length;
  if (n < MIN_SCREENS || n > MAX_SCREENS) {
    throw new Error(`Expected ${MIN_SCREENS}-${MAX_SCREENS} screens, got ${n}`);
  }
  for (let i = 0; i < n; i += 1) {
    const screen = snack.screens[i];
    if (!screen.heading || !screen.body) {
      throw new Error(`Screen ${i + 1} missing heading or body`);
    }
    const words = countWords(screen.body);
    if (words > MAX_WORDS) {
      throw new Error(`Screen ${i + 1} has ${words} words (max ${MAX_WORDS})`);
    }
  }
}

function buildPrompt(topic) {
  return `You write kid-safe blog snacks for a ~10 year old reader.
Topic: ${topic}

Return ONLY valid JSON with this shape (no markdown fences):
{
  "title": "short catchy title",
  "topic": "${topic.replace(/"/g, '\\"')}",
  "audience": "kid ~10",
  "screens": [
    { "heading": "3-6 words", "body": "one idea, max 80 words, calm encouraging tone" }
  ]
}

Rules:
- Exactly ${MIN_SCREENS} to ${MAX_SCREENS} screens
- One idea per screen, ≤80 words each
- Growth mindset, curiosity, no shopping, no scary content
- Plain English, short sentences`;
}

async function generate(topic, host, model) {
  const url = `${host.replace(/\/$/, "")}/api/generate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: buildPrompt(topic),
      stream: false,
      format: "json",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const snack = JSON.parse(data.response);
  validateSnack(snack);
  return snack;
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.topic.trim()) {
    console.error("Error: provide a topic string or --topic");
    printHelp();
    process.exit(1);
  }

  try {
    const snack = await generate(args.topic.trim(), args.host, args.model);
    const json = `${JSON.stringify(snack, null, 2)}\n`;

    if (args.out) {
      const fs = await import("node:fs/promises");
      await fs.writeFile(args.out, json, "utf8");
      console.error(`Wrote ${args.out} (${snack.screens.length} screens)`);
    } else {
      process.stdout.write(json);
    }
  } catch (err) {
    console.error(`Failed: ${err.message}`);
    console.error("\nEnsure Ollama is running: ollama serve");
    console.error(`Ensure model is pulled: ollama pull ${args.model}`);
    process.exit(1);
  }
}

main();
