import { generateQuestions, PASS_THRESHOLD, coachMessage } from '../../js/questions.js';

export const QuizComponent = {
  id: 'quiz',
  version: '2.0.0',
  dependencies: ['storage'],
  init(ctx) {
    ctx.quiz = {
      PASS_THRESHOLD,
      generate: generateQuestions,
      coachMessage,
    };
  },
  health() {
    return { ok: typeof generateQuestions === 'function', status: 'ready' };
  },
};
