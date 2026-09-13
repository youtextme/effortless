/**
 * Original worksheet pages. Quiet. One job.
 */
import { Page, LETTER } from '../../sight-words/scripts/pdf.mjs';

const INK = [0.12, 0.12, 0.12];
const MUTED = 0.45;
const CREAM = [0.98, 0.96, 0.93];

export function cover({ kicker, title, sub, foot }) {
  const p = new Page();
  p.fill(...CREAM);
  p.rect(0, 0, LETTER.w, LETTER.h, 'f');
  p.fill(...INK);
  p.rect(54, 54, LETTER.w - 108, LETTER.h - 108, 's');
  p.text('WordSpark', 72, 680, 12, { rgb: INK });
  p.text(kicker, 72, 650, 11, { gray: MUTED });
  p.text(title, 72, 600, 28, { rgb: INK });
  p.text(sub, 72, 560, 14, { rgb: INK });
  p.text(foot, 72, 120, 10, { gray: MUTED });
  p.text('Classroom or home use. Do not resell the file.', 72, 100, 10, { gray: MUTED });
  return p;
}

export function howTo(lines) {
  const p = new Page();
  p.text('How to use this pack', 72, 720, 20, { rgb: INK });
  lines.forEach((line, i) => p.text(line, 72, 670 - i * 22, 12, { rgb: INK }));
  return p;
}

function huntBoxes(p, items, correct) {
  const picks = [];
  let seed = correct.length * 19 + items.length * 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return items[seed % items.length];
  };
  picks.push(next(), next(), correct, next(), correct, next());
  picks.forEach((w, i) => {
    const x = 54 + (i % 3) * 170;
    const y = 300 - Math.floor(i / 3) * 40;
    p.stroke(...INK);
    p.rect(x, y - 8, 150, 28, 's');
    p.text(String(w), x + 12, y, 14, { rgb: INK });
  });
}

export function traceWriteFindRead({ header, giant, sentence, pool, kind }) {
  const p = new Page();
  p.text('WordSpark', 54, 750, 10, { gray: MUTED });
  p.text(header, 54, 734, 10, { gray: MUTED });
  p.line(54, 722, LETTER.w - 54, 722, 0.4);
  p.text(giant, 54, 640, 42, { rgb: INK });
  p.text('Trace', 54, 580, 11, { gray: MUTED });
  p.text(giant, 54, 540, 32, { gray: 0.72 });
  p.text('Write', 54, 490, 11, { gray: MUTED });
  [0, 1, 2].forEach((i) => {
    const y = 460 - i * 36;
    p.line(54, y, LETTER.w - 54, y, 0.6);
  });
  p.text('Find  ·  circle it', 54, 340, 11, { gray: MUTED });
  huntBoxes(p, pool, giant);
  p.text('Read', 54, 200, 11, { gray: MUTED });
  const blanked = sentence.replace(new RegExp(`\\b${giant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), '______');
  p.text(blanked, 54, 170, 13, { rgb: INK });
  p.line(54, 140, LETTER.w - 54, 140, 0.5);
  p.text(kind || 'Write the missing piece on the line.', 54, 122, 10, { gray: MUTED });
  p.text('One page. Five minutes.', 54, 54, 9, { gray: MUTED });
  return p;
}

export function numberPage(n, pool) {
  const p = new Page();
  p.text('WordSpark  ·  Numbers 0-20', 54, 750, 10, { gray: MUTED });
  p.text(`${n} of 20`, 54, 734, 10, { gray: MUTED });
  p.line(54, 722, LETTER.w - 54, 722, 0.4);
  p.text(String(n), 54, 640, 48, { rgb: INK });
  p.text('Trace', 54, 580, 11, { gray: MUTED });
  p.text(String(n), 54, 540, 36, { gray: 0.72 });
  p.text('Ten-frame', 54, 490, 11, { gray: MUTED });
  for (let i = 0; i < 20; i += 1) {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = 54 + col * 28;
    const y = 450 - row * 28;
    p.rect(x, y, 22, 22, 's');
    if (i < n) {
      p.fill(...INK);
      p.rect(x + 4, y + 4, 14, 14, 'f');
      p.fill(0, 0, 0);
    }
  }
  p.text('Write it three times', 54, 370, 11, { gray: MUTED });
  [0, 1, 2].forEach((i) => p.line(54, 340 - i * 36, LETTER.w - 54, 340 - i * 36, 0.6));
  p.text('Find  ·  circle the number', 54, 230, 11, { gray: MUTED });
  huntBoxes(p, pool, String(n));
  p.text('Count out loud. Stop at this number.', 54, 54, 9, { gray: MUTED });
  return p;
}

export function sentencePage(entry, i, total) {
  const p = new Page();
  p.text('WordSpark  ·  First sentences', 54, 750, 10, { gray: MUTED });
  p.text(`${i + 1} of ${total}`, 54, 734, 10, { gray: MUTED });
  p.line(54, 722, LETTER.w - 54, 722, 0.4);
  p.text(entry.line, 54, 620, 18, { rgb: INK });
  p.text('Trace the sentence', 54, 560, 11, { gray: MUTED });
  p.text(entry.line, 54, 530, 14, { gray: 0.7 });
  p.text('Write it', 54, 480, 11, { gray: MUTED });
  p.line(54, 450, LETTER.w - 54, 450, 0.6);
  p.line(54, 410, LETTER.w - 54, 410, 0.6);
  p.text('Draw what happened (keep it tiny)', 54, 360, 11, { gray: MUTED });
  p.rect(54, 180, LETTER.w - 108, 160, 's');
  p.text(entry.prompt, 54, 140, 11, { rgb: INK });
  p.text('Read it to someone. Then you are done.', 54, 54, 9, { gray: MUTED });
  return p;
}

export function trackerPages() {
  const pages = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  for (let week = 1; week <= 4; week += 1) {
    const p = new Page();
    p.text(`Week ${week}  ·  home tracker`, 54, 740, 18, { rgb: INK });
    p.text('One box a night. Sight word, letter, or number. Your pick.', 54, 712, 10, { gray: MUTED });
    days.forEach((d, i) => {
      const y = 650 - i * 90;
      p.text(d, 54, y, 14, { rgb: INK });
      p.rect(120, y - 8, 18, 18, 's');
      p.line(150, y, LETTER.w - 54, y, 0.5);
      p.text('What we printed:', 150, y - 22, 10, { gray: MUTED });
    });
    p.text('Parent note (optional)', 54, 180, 11, { gray: MUTED });
    p.rect(54, 70, LETTER.w - 108, 100, 's');
    pages.push(p);
  }
  return pages;
}
