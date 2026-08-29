/** Exit codes shared by CLI and HTTP responses. */
export const EXIT = {
  OK: 0,
  USAGE: 2,
  CDP_DOWN: 3,
  NO_PAGE: 4,
  NEEDS_LOGIN: 5,
  CHAT_NOT_FOUND: 6,
  READ_ONLY: 7,
  UNVERIFIED: 8,
  INTERNAL: 9,
};

export const EXIT_LABELS = {
  [EXIT.OK]: 'verified send',
  [EXIT.USAGE]: 'usage error',
  [EXIT.CDP_DOWN]: 'cdp down',
  [EXIT.NO_PAGE]: 'no whatsapp page',
  [EXIT.NEEDS_LOGIN]: 'needs login',
  [EXIT.CHAT_NOT_FOUND]: 'chat not found',
  [EXIT.READ_ONLY]: 'read-only chat',
  [EXIT.UNVERIFIED]: 'unverified send',
  [EXIT.INTERNAL]: 'internal error',
};

export function exitLabel(code) {
  return EXIT_LABELS[code] ?? `unknown (${code})`;
}
