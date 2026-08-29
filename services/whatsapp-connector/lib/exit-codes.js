/** Exit codes for CLI, HTTP, and scheduled runs. */
export const EXIT = {
  OK: 0,
  USAGE: 2,
  CONFIG: 3,
  JOB_NOT_FOUND: 4,
  OLLAMA_DOWN: 5,
  OLLAMA_FAIL: 6,
  WHATSAPP_NOT_LINKED: 7,
  WHATSAPP_FAIL: 8,
  CHAT_NOT_FOUND: 9,
  SCHEDULE_FAIL: 10,
  INTERNAL: 11,
};

export const EXIT_LABELS = {
  [EXIT.OK]: 'success',
  [EXIT.USAGE]: 'usage error',
  [EXIT.CONFIG]: 'config error',
  [EXIT.JOB_NOT_FOUND]: 'job not found',
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

export function fail(code, message) {
  const err = new Error(message);
  err.exitCode = code;
  return err;
}
