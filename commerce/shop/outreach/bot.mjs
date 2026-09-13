/**
 * Unique outreach. Never 500 identical DMs.
 * Input: people already asking. Output: one reply that names them and their ask.
 */
const SAMPLE = 'https://textme.gumroad.com/l/sight-words-sample';
const SHOP = 'https://textme.gumroad.com';
const PAID = 'https://textme.gumroad.com/l/sight-words-220';

export function uniqueReply({ name, ask, place }) {
  const first = String(name || 'there').split(/\s+/)[0];
  const lower = String(ask || '').toLowerCase();
  let hook = 'A ten-page sample is free. One PDF. No Google Drive.';
  if (lower.includes('drive') || lower.includes('folder')) {
    hook = 'If the Drive folder is the pain, this is one PDF. Ten free pages first.';
  } else if (lower.includes('free')) {
    hook = 'You asked for free pages. Here are ten. Print tonight.';
  } else if (lower.includes('cheap') || lower.includes('budget')) {
    hook = 'The live TPT bundle is $11 this week. The full 220 here is $5.99 after the free sample.';
  } else if (lower.includes('homework') || lower.includes('dinner')) {
    hook = 'One page after dinner is the whole job. Sample first.';
  }
  const body = [
    `${first} — ${hook}`,
    `Sample: ${SAMPLE}`,
    `If the page fits, the 220-word pack is ${PAID} and the week bundle is on the shop: ${SHOP}`,
    `I will not DM a stack of links. This is the one reply in ${place}.`,
    `Custom list: youtextme@gmail.com`,
  ].join('\n');
  return { first, place, body, sample: SAMPLE };
}

export function plan(targets) {
  const seen = new Set();
  const unique = [];
  for (const t of targets) {
    const key = `${(t.name || '').toLowerCase()}|${(t.ask || '').slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ ...t, reply: uniqueReply(t) });
  }
  return unique;
}
