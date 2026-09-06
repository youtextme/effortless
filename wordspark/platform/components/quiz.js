import { generateQuestions, PASS_THRESHOLD } from '../../js/questions.js';

export const QuizComponent = {
  id: 'quiz',
  version: '1.0.0',
  dependencies: ['storage'],
  init(ctx) {
    ctx.quiz = {
      PASS_THRESHOLD,
      generate: generateQuestions,
    };
  },
  health() {
    return { ok: typeof generateQuestions === 'function', status: 'ready' };
  },
};
