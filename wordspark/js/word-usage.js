/**
 * Word-sheet copy: say the word twice, a plain meaning, then 3 daily-life lines.
 */

import { WORD_EXPLANATIONS } from './data/word-explanations.js';

const ADJ_SUFFIX = /ous$|ive$|ful$|less$|ish$|able$|ible$|ical$|ial$|ual$|ary$|ory$/;
const NOUN_SUFFIX = /tion$|sion$|ness$|ment$|ity$|ism$|ance$|ence$|ology$|graphy$|ship$|hood$/;
const VERB_SUFFIX = /ize$|ise$|ify$|ate$|en$/;
const DISCOURSE = /^(furthermore|likewise|nevertheless|notwithstanding|whereas|however|therefore|moreover|meanwhile|otherwise)$/;
const ADULT_EXAMPLE = /scientist|police|darwin|laboratory|crimes thoroughly|medical research|innocence|biology forever|university|parliament|shareholder|students learn to use|daily conversation|good example of|you sounded very|during dinner last night|the topic in class/i;
const KID_VOICE = /\b(I|we|my|our|Mum|Mom|dad|friend|school|homework|class|dinner|home|today|teacher|brother|sister|game|match|playground|kids|children)\b/i;
const VERB_FIRST = /^(examine|investigate|discover|explore|observe|analyze|analyse|persuade|convey|communicate|evaluate|compare|justify|deduce|verify|uncover|probe|speculate|scrutinize|articulate|describe|interpret|negotiate|advocate|announce|clarify|elaborate|express|assert|emphasize|narrate|paraphrase|summarize|debate|assess|contrast|distinguish|critique|appraise|weigh|ascertain|discern|elucidate|postulate|surmise|contemplate|protect|adapt|reach|make|form|suggest|perceive|suppose|think|find|look|watch|travel|establish|present|share|stand|work|use|take|help|build|create|show|tell|ask|learn|teach|improve|support|encourage|inspire|motivate|resolve|process|handle|manage|lead|follow|choose|decide|consider|reflect|practice|practise|try|test|check|prove|demonstrate|illustrate|explain|define|identify|recognize|acknowledge|accept|reject|challenge|defend|maintain|promote|develop|design|plan|organize|organise|conclude|research)/;

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function article(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function posKind(word, meaning) {
  const m = String(meaning || '').toLowerCase().trim();
  const w = String(word || '').toLowerCase();
  if (DISCOURSE.test(w) || /^(in addition|in the same way|in spite|in contrast)/.test(m)) {
    return 'adverb';
  }
  const placeholder = m === `relating to ${w}`;
  if (!placeholder) {
    if (m.startsWith('to ')) return 'verb';
    if (/^(a|an) /.test(m)) return 'noun';
    if (m.startsWith('the ')) return 'noun';
    if (/^(relating |existing |having |based |able |eager |fluent |of |showing |characterized |concerned |lacking |situated )/.test(m)) {
      return 'adj';
    }
    if (VERB_FIRST.test(m)) return 'verb';
    if (ADJ_SUFFIX.test(w)) return 'adj';
    if (NOUN_SUFFIX.test(w)) return 'noun';
    return 'noun';
  }
  if (ADJ_SUFFIX.test(w)) return 'adj';
  if (NOUN_SUFFIX.test(w)) return 'noun';
  if (VERB_SUFFIX.test(w)) return 'verb';
  if (w.length <= 4) return 'noun';
  return 'verb';
}

export function spokenMeaning(word, meaning) {
  const m = String(meaning || '').trim().replace(/\.$/, '');
  const lower = m.toLowerCase();
  const w = String(word || '');
  if (!m || lower === `relating to ${w.toLowerCase()}`) {
    return `${cap(w)} is a word you can use at school, at home, and with friends.`;
  }
  if (lower.startsWith('to ')) return `It means ${lower}.`;
  if (/^(a|an) /.test(lower)) return `${cap(w)} is ${m}.`;
  if (lower.startsWith('the ')) return `${cap(w)} is ${m}.`;
  if (lower.startsWith('relating to ')) {
    return `It means it is about ${m.slice('relating to '.length)}.`;
  }
  if (VERB_FIRST.test(lower)) return `It means you ${m}.`;
  return `It means ${m}.`;
}

const VERB_LINES = [
  (w) => `Let me ${w} this homework before I guess.`,
  (w) => `After the match we should ${w} what went wrong.`,
  (w) => `Can we ${w} this so everyone at dinner understands?`,
  (w) => `I need to ${w} where I left my charger.`,
  (w) => `Don't shout — let's ${w} what happened first.`,
  (w) => `Help me ${w} this so I can do it myself tomorrow.`,
  (w) => `Before I send that message I should ${w} if it sounds kind.`,
  (w) => `In class I asked if we can ${w} the question together.`,
  (w) => `If I lose my jumper I have to ${w} the last place I had it.`,
];

const NOUN_LINES = [
  (w) => `I told Mum the ${w} from class actually happened at home.`,
  (w) => `What's the ${w} we should remember from today?`,
  (w) => `I wrote the ${w} in my own words for homework.`,
  (w) => `That's a real ${w}, not just a story from a book.`,
  (w) => `Start with the ${w}, then the details.`,
  (w) => `I explained the ${w} to my little brother at dinner.`,
  (w) => `My friend asked about the ${w} and I didn't freeze.`,
  (w) => `Before the test I need one clear ${w} I can say out loud.`,
  (w) => `On the playground I used the ${w} in a real sentence.`,
];

const ADJ_LINES = [
  (w) => `That was ${article(w)} ${w} way to finish the homework.`,
  (w) => `We stayed ${w} even when the game was hard.`,
  (w) => `I need to be ${w} when I explain this to Mum.`,
  (w) => `Stay ${w} when the question feels tricky.`,
  (w) => `Today I felt ${w} when I finally understood.`,
  (w) => `My teacher said that was ${w} work.`,
  (w) => `Don't guess — be ${w} about what really happened.`,
  (w) => `You were ${w} in that group chat with us.`,
  (w) => `${article(w).replace(/^./, (c) => c.toUpperCase())} ${w} start is better than rushing dinner homework.`,
];

const RELATING_ADJ_LINES = [
  (w) => `My ${w} homework actually helped at home.`,
  (w) => `That ${w} example came up at dinner with Mum.`,
  (w) => `I used ${article(w)} ${w} idea in class today.`,
  (w) => `We talked about ${w} stuff after the match.`,
  (w) => `I told my friend a ${w} story from school.`,
  (w) => `Mum asked a ${w} question at dinner.`,
  (w) => `I kept my ${w} notes so I can revise tonight.`,
  (w) => `At school I gave ${article(w)} ${w} example from real life.`,
  (w) => `This ${w} word showed up in my game chat.`,
];

const ADVERB_LINES = [
  (w) => `${cap(w)} I packed my bag, then I started homework.`,
  (w) => `I used ${w} when I added one more idea in class.`,
  (w) => `At dinner I said ${w} so I could add what happened at school.`,
  (w) => `${cap(w)} we finished the match, then we walked home.`,
  (w) => `My teacher liked that I said ${w} instead of just and.`,
  (w) => `I tried ${w} in my homework sentence so it sounded grown-up.`,
];

function poolFor(kind) {
  switch (kind) {
    case 'verb':
      return VERB_LINES;
    case 'adj':
      return ADJ_LINES;
    case 'adverb':
      return ADVERB_LINES;
    case 'noun':
      return NOUN_LINES;
    default:
      return NOUN_LINES;
  }
}

function pickThree(pool, word, seed) {
  const out = [];
  const used = new Set();
  let i = 0;
  while (out.length < 3 && i < pool.length * 2) {
    const idx = (seed + i * 5) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(pool[idx](word));
    }
    i += 1;
  }
  return out;
}

function datasetUsable(sentence, word) {
  const s = String(sentence || '').replace(/^"/, '').replace(/"$/, '').trim();
  if (!s) return '';
  if (!s.toLowerCase().includes(String(word).toLowerCase())) return '';
  if (ADULT_EXAMPLE.test(s)) return '';
  if (!KID_VOICE.test(s) && !/^(We|I|My|Our|Kids|Children)\b/.test(s)) return '';
  return s;
}

export function buildKidExamples(entry) {
  const word = entry.word;
  const kind = posKind(word, entry.meaning);
  const meaning = String(entry.meaning || '').toLowerCase();
  const pool = kind === 'adj' && meaning.startsWith('relating ')
    ? RELATING_ADJ_LINES
    : poolFor(kind);
  const picked = pickThree(pool, word, hash(String(word).toLowerCase()));
  const primary = datasetUsable(entry.example, word);
  if (!primary) return picked.slice(0, 3);
  const rest = picked.filter((line) => line.toLowerCase() !== primary.toLowerCase());
  return [primary, ...rest].slice(0, 3);
}

export function getWordExplanation(wordData) {
  const key = String(wordData.word || '').toLowerCase();
  const found = WORD_EXPLANATIONS[key];
  if (found?.simple && found?.examples?.length >= 3) {
    return {
      simple: found.simple,
      examples: found.examples.slice(0, 3),
    };
  }

  return {
    simple: spokenMeaning(wordData.word, wordData.meaning),
    examples: buildKidExamples(wordData),
  };
}

export function explanationToSpeech(word, explanation) {
  return {
    word,
    meaning: explanation.simple,
    examples: explanation.examples.slice(0, 3),
  };
}
