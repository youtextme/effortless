/**
 * Reading comprehension quiz — 12 questions, shuffled choices, skills + takeaways.
 */

import { getTopicTitle } from './data/topics.js';
import { getTargetWords } from './passage-generator.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(prompt, correct, wrongs) {
  return {
    prompt,
    choices: shuffle([
      { text: correct, correct: true },
      ...wrongs.map((text) => ({ text, correct: false })),
    ]),
  };
}

function skillQuestions(passageData) {
  const title = getTopicTitle(passageData.day);
  const takeaway = passageData.takeaway;
  const theme = passageData.theme;

  return [
    makeQuestion(
      'What is this reading mainly about?',
      title,
      [
        'Memorising spelling lists',
        'Finishing pages as fast as possible',
        'Learning only grammar rules',
      ]
    ),
    makeQuestion(
      'What is the most important reason to read carefully?',
      'To understand ideas you can use in real life',
      [
        'To impress people with long words',
        'To skip thinking and move on',
        'To collect highlights without understanding',
      ]
    ),
    makeQuestion(
      'According to the passage, what should you do after reading?',
      'Pause and think about what you learned',
      [
        'Forget everything immediately',
        'Only copy highlighted words',
        'Never explain it to anyone',
      ]
    ),
    makeQuestion(
      'Why is pausing while reading valuable?',
      'It means your mind is working and learning',
      [
        'It means you are too slow',
        'It means the topic is boring',
        'It means you should stop forever',
      ]
    ),
    makeQuestion(
      `Which idea best matches the key lesson: "${takeaway}"`,
      takeaway,
      [
        'Facts never matter in decisions',
        'You should never ask questions',
        'Reading is only for exams',
      ]
    ),
    makeQuestion(
      'What skill does the passage encourage you to build?',
      'Thinking clearly before you decide',
      [
        'Reacting quickly without facts',
        'Ignoring details on purpose',
        'Trusting only loud voices',
      ]
    ),
    makeQuestion(
      'What should you try explaining to someone after reading?',
      'This topic using your own examples',
      [
        'Only the number of pages you read',
        'Nothing — keep it private',
        'Only word definitions from memory',
      ]
    ),
    makeQuestion(
      'How does the passage describe strong thinkers?',
      'They collect facts before they decide',
      [
        'They guess and never check',
        'They avoid hard topics',
        'They only believe friends',
      ]
    ),
    makeQuestion(
      `This passage belongs to which area of learning?`,
      theme,
      [
        'Random word memorisation',
        'Typing speed practice',
        'Colouring worksheets',
      ]
    ),
    makeQuestion(
      'What makes reading "useful" according to the passage?',
      'Connecting ideas to your own life',
      [
        'Reading as fast as possible',
        'Never using what you learn',
        'Avoiding real-world examples',
      ]
    ),
    makeQuestion(
      'When you truly understand a topic, what happens?',
      'You can explain it simply to someone else',
      [
        'You forget it the next day',
        'You only remember fancy words',
        'You stop asking questions',
      ]
    ),
    makeQuestion(
      'What is the best way to make learning stick?',
      'Use what you read in real conversations',
      [
        'Highlight words and never speak them',
        'Read once and never return',
        'Memorise without understanding',
      ]
    ),
  ];
}

function wordQuestions(passageData) {
  const words = getTargetWords(passageData);
  const picked = shuffle(words);

  return picked.map((word) => {
    const distractors = shuffle(words.filter((w) => w.word !== word.word)).slice(0, 3);
    return makeQuestion(
      `In this topic, what does "${word.word}" mean?`,
      word.meaning,
      distractors.map((d) => d.meaning)
    );
  });
}

export function generateQuestions(passageData) {
  const core = skillQuestions(passageData);
  const vocab = wordQuestions(passageData);
  return shuffle([...core, ...vocab]);
}

export const PASS_THRESHOLD = 10;
