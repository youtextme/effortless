import * as passageApi from '../../js/passage-generator.js';

export const PassageComponent = {
  id: 'passage',
  version: '1.0.0',
  dependencies: [],
  init(ctx) {
    ctx.passage = passageApi;
  },
  health() {
    try {
      const words = Array.from({ length: 10 }, (_, i) => ({
        word: `w${i}`,
        meaning: 'm',
        example: 'e',
      }));
      const pages = passageApi.generatePassagePages({ day: 1, takeaway: 'test', words });
      return { ok: Boolean(pages?.sections?.length), status: 'generator ok' };
    } catch (e) {
      return { ok: false, status: String(e) };
    }
  },
};
