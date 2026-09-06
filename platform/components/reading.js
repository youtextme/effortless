export const ReadingComponent = {
  id: 'reading',
  version: '1.0.0',
  dependencies: ['passage', 'storage'],
  init(ctx) {
    ctx.reading = {
      hasScrolledToEnd: false,
      resetScroll() {
        ctx.reading.hasScrolledToEnd = false;
      },
      markScrolledToEnd() {
        ctx.reading.hasScrolledToEnd = true;
        ctx.emit('reading.scrolled-to-end', 'reading', {});
      },
    };
  },
  health() {
    return { ok: true, status: 'ready' };
  },
};
