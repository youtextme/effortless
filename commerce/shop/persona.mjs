import { SKUS } from './catalog.mjs';

/**
 * Three taps. Returns the recommended SKU plus the full shelf.
 * Never hides the catalog — Maya still sees the $19.97 week.
 */
export function recommend(answers) {
  const who = answers.who || 'parent';
  const minutes = answers.minutes || '5';
  const grade = answers.grade || 'k';
  const scored = SKUS.map((sku) => {
    let score = 0;
    if (sku.personas.includes(who)) score += 3;
    if (sku.minutes.includes(minutes)) score += 2;
    if (sku.grades.includes(grade)) score += 2;
    if (minutes === '30' && sku.id === 'after-dinner') score += 5;
    if (minutes === '5' && sku.id === 'sample') score += 2;
    if (who === 'teacher' && sku.id === 'week-tracker') score += 1;
    if (grade === 'prek' && sku.id === 'alphabet-trace') score += 2;
    if (grade === 'g1' && sku.id === 'cvc-short') score += 2;
    return { sku, score };
  }).sort((a, b) => b.score - a.score);
  const hero = scored[0].sku;
  const rest = scored.slice(1).map((row) => row.sku);
  return { hero, rest, shelf: SKUS, answers: { who, minutes, grade } };
}

export function defaultAnswers() {
  return { who: 'parent', minutes: '15', grade: 'k' };
}
