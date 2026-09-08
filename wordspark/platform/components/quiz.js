import { generateQuestions, PASS_THRESHOLD, coachMessage } from '../../js/questions.js';

export const QuizComponent = {
  id: 'quiz',
  version: '2.1.0',
  dependencies: ['storage', 'item'],
  init(ctx) {
    ctx.quiz = {
      PASS_THRESHOLD,
      generate: generateQuestions,
      coachMessage,
      renderHtml(question) {
        return ctx.item?.renderHtml?.(question) || '';
      },
    };
  },
  health() {
    return { ok: typeof generateQuestions === 'function', status: 'ready' };
  },
};
