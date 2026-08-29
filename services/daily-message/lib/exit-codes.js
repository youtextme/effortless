/** Exit codes for CLI and scheduled runs. */
export const EXIT = {
  OK: 0,
  USAGE: 2,
  CONFIG: 3,
  OLLAMA_DOWN: 4,
  OLLAMA_FAIL: 5,
  WHATSAPP_NOT_LINKED: 6,
  WHATSAPP_FAIL: 7,
  CHAT_NOT_FOUND: 8,
  SCHEDULE_FAIL: 9,
  INTERNAL: 10,
};

export const EXIT_LABELS = {
  [EXIT.OK]: 'success',
  [EXIT.USAGE]: 'usage error',
  [EXIT.CONFIG]: 'config error',
  [EXIT.OLLAMA_DOWN]: 'ollama unreachable',
  [EXIT.OLLAMA_FAIL]: 'ollama generation failed',
  [EXIT.WHATSAPP_NOT_LINKED]: 'whatsapp not linked',
  [EXIT.WHATSAPP_FAIL]: 'whatsapp send failed',
  [EXIT.CHAT_NOT_FOUND]: 'chat not found',
  [EXIT.SCHEDULE_FAIL]: 'schedule install failed',
  [EXIT.INTERNAL]: 'internal error',
};

export function exitLabel(code) {
  return EXIT_LABELS[code] ?? `unknown (${code})`;
}
