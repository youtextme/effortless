/**
 * Topic comprehension questions — not vocabulary drills.
 */

import { getTopicTitle } from './data/topics.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function topicQuestions(passageData) {
  const title = getTopicTitle(passageData.day);
  const takeaway = passageData.takeaway;

  const bank = [
    {
      prompt: `What is this reading mainly about?`,
      choices: [
        { text: title, correct: true },
        { text: 'Memorising a list of difficult words', correct: false },
        { text: 'Finishing homework as fast as possible', correct: false },
        { text: 'Learning spelling rules only', correct: false },
      ],
    },
    {
      prompt: 'According to the passage, what should you do after you finish reading?',
      choices: [
        { text: 'Pause and think about what you learned', correct: true },
        { text: 'Forget it and move on immediately', correct: false },
        { text: 'Copy every sentence into a notebook', correct: false },
        { text: 'Only remember the highlighted words', correct: false },
      ],
    },
    {
      prompt: 'Why does the passage say pausing while reading is valuable?',
      choices: [
        { text: 'It means your mind is working and learning', correct: true },
        { text: 'It means you are reading too slowly', correct: false },
        { text: 'It means you should stop reading forever', correct: false },
        { text: 'It means the topic is not important', correct: false },
      ],
    },
    {
      prompt: 'What is the main goal of reading topics like this?',
      choices: [
        { text: 'To understand ideas you can use in real life', correct: true },
        { text: 'To collect fancy words for no reason', correct: false },
        { text: 'To impress people with long sentences', correct: false },
        { text: 'To avoid thinking about the subject', correct: false },
      ],
    },
    {
      prompt: `Which idea best matches: "${takeaway}"`,
      choices: [
        { text: takeaway, correct: true },
        { text: 'Reading is only useful for exams', correct: false },
        { text: 'You should never ask questions', correct: false },
        { text: 'Facts never matter in decisions', correct: false },
      ],
    },
    {
      prompt: 'What does the passage suggest you try explaining to someone tonight?',
      choices: [
        { text: 'This topic, using your own examples', correct: true },
        { text: 'Only the definitions of highlighted words', correct: false },
        { text: 'Nothing — reading is private', correct: false },
        { text: 'How many pages you read', correct: false },
      ],
    },
    {
      prompt: 'How does the passage describe strong thinkers?',
      choices: [
        { text: 'They collect facts before they decide', correct: true },
        { text: 'They react quickly without thinking', correct: false },
        { text: 'They ignore details on purpose', correct: false },
        { text: 'They only trust loud voices', correct: false },
      ],
    },
  ];

  return shuffle(bank).slice(0, 5);
}

export function generateQuestions(passageData) {
  return topicQuestions(passageData);
}

export const PASS_THRESHOLD = 4;
