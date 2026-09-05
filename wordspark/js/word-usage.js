/**
 * Practical usage scenarios — how a kid actually uses each word.
 */

const FRIEND_SETUPS = [
  'Your friend asks what new word you learned today.',
  'Your friend says they don\'t understand something in class.',
  'Your friend asks you to explain something simply.',
  'Your friend is curious about a topic you just read about.',
];

const MOTHER_SETUPS = [
  'Your mother asks what you read today.',
  'Your mother asks you to tell her about your day at school.',
  'Your mother wants you to explain something from the news.',
  'Your mother asks what a difficult word means.',
];

const GRANDFATHER_SETUPS = [
  'Your grandfather asks you to share something interesting you learned.',
  'Your grandfather wants to hear you use a new word in a sentence.',
  'Your grandfather asks what you are studying these days.',
  'Your grandfather loves when you explain things clearly.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildSay(word, meaning, who) {
  const w = word.word;
  const m = meaning.toLowerCase();
  const templates = [
    `You can say: "I learned the word ${w} — it means ${m}."`,
    `You can say: "Let me ${w} this for you."`,
    `You can say: "The word ${w} means ${m}, and I used it in my reading today."`,
    `You can say: "When we ${w}, we understand things better."`,
    `You can say: "My passage taught me '${w}' — ${m}."`,
  ];
  if (who === 'friend') {
    return `You can say: "I just learned '${w}' — it means ${m}. Want me to explain?"`;
  }
  if (who === 'mother') {
    return `You can say: "Mom, I read about '${w}'. It means ${m}."`;
  }
  return `You can say: "Grandpa, listen to this word — '${w}'. It means ${m}."`;
}

export function generateUsageScenarios(wordData) {
  return [
    {
      who: 'Friend',
      setup: pick(FRIEND_SETUPS),
      say: buildSay(wordData, wordData.meaning, 'friend'),
    },
    {
      who: 'Mother',
      setup: pick(MOTHER_SETUPS),
      say: buildSay(wordData, wordData.meaning, 'mother'),
    },
  ];
}

export function scenariosToSpeech(word, scenarios) {
  const parts = [word];
  for (const s of scenarios) {
    parts.push(`${s.setup} ${s.say}`);
  }
  return parts.join('. ');
}
