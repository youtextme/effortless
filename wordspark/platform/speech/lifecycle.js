/**
 * Stop read-aloud when the customer leaves the surface being spoken.
 * Pure decision + MutationObserver + optional poll. No per-screen if/else.
 */

export function shouldStopForSurfaceChange(speakingRoot, activeRoot) {
  if (!speakingRoot) return false;
  if (!activeRoot) return true;
  if (speakingRoot === activeRoot) return false;
  if (typeof speakingRoot.contains === 'function' && speakingRoot.contains(activeRoot)) return false;
  if (typeof activeRoot.contains === 'function' && activeRoot.contains(speakingRoot)) return false;
  return true;
}

export function shouldAbortAfterAsyncWait(generationAtStart, generationNow) {
  return generationAtStart !== generationNow;
}

export function pickSpeakRoot(intendedRoot, liveRoot) {
  if (shouldStopForSurfaceChange(intendedRoot, liveRoot)) return null;
  return liveRoot || intendedRoot;
}

export function attachSpeechLifecycle({ doc, stop, findActiveSurface, pollMs = 0 }) {
  if (!doc?.body || typeof MutationObserver === 'undefined') {
    return () => {};
  }

  let speakingRoot = findActiveSurface(doc);

  const onMut = () => {
    const active = findActiveSurface(doc);
    if (shouldStopForSurfaceChange(speakingRoot, active)) {
      stop();
    }
    speakingRoot = active;
  };

  const observer = new MutationObserver(onMut);
  observer.observe(doc.body, {
    attributes: true,
    attributeFilter: ['hidden'],
    subtree: true,
    childList: true,
  });

  const timer = pollMs > 0 ? setInterval(onMut, pollMs) : null;

  return () => {
    observer.disconnect();
    if (timer) clearInterval(timer);
  };
}
