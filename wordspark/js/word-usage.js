/**
 * Teach words in context — pronunciation + real-life upgrade, not templates.
 */

const SIMPLE_ALTERNATIVES = {
  analyze: 'look at carefully',
  hypothesis: 'a guess',
  investigate: 'check',
  observe: 'watch',
  discover: 'find out',
  explore: 'look around',
  curious: 'interested',
  phenomenon: 'a strange thing',
  evidence: 'proof',
  conclude: 'decide',
  articulate: 'say clearly',
  persuade: 'convince',
  convey: 'show',
  communicate: 'talk',
  evaluate: 'judge',
  logical: 'sensible',
  ecosystem: 'nature system',
  democracy: 'people voting',
  resilience: 'bouncing back',
  influence: 'changing minds',
  chlorophyll: 'the green stuff in leaves',
  negotiate: 'work out a deal',
  empathize: 'understand how someone feels',
};

function simplerWord(word) {
  return SIMPLE_ALTERNATIVES[word.toLowerCase()] || 'something simpler';
}

const SCENARIO_POOL = [
  {
    who: 'With a friend',
    build(w, simple, data) {
      const setups = [
        `Your friend is upset after losing a match and says, "I don't know what went wrong."`,
        `At lunch, your friend says, "This topic is confusing — can you explain it?"`,
        `Your friend wants to convince the class to try a new idea but doesn't know how to start.`,
      ];
      const setup = setups[w.length % setups.length];
      return {
        setup,
        upgrade: `You could say "${simple}," but now you know "${w}" — it sounds more confident and grown-up.`,
        line: data.example || `"Let's ${w} this together before we give up."`,
      };
    },
  },
  {
    who: 'At home',
    build(w, simple, data) {
      const setups = [
        `Your parent asks what you learned at school today.`,
        `At dinner, someone mentions the news and asks what you think.`,
        `A younger sibling asks you a hard question and you want to answer well.`,
      ];
      const setup = setups[(w.length + 1) % setups.length];
      return {
        setup,
        upgrade: `Instead of "${simple}," you can say "${w}." It means: ${data.meaning}. Same idea — better word.`,
        line: data.example.replace(/^"/, '').replace(/"$/, '') || `"I want to ${w} this properly."`,
      };
    },
  },
];

export function generateUsageScenarios(wordData) {
  const w = wordData.word;
  const simple = simplerWord(w);
  return SCENARIO_POOL.map((pool) => ({
    who: pool.who,
    ...pool.build(w, simple, wordData),
  }));
}

export function usageToSpeech(word, scenarios) {
  const parts = [
    word,
    "Let's see how you can use this word in your daily life.",
  ];
  for (const s of scenarios) {
    parts.push(`${s.setup} ${s.upgrade} For example, you could say: ${s.line}`);
  }
  return parts;
}
