/**
 * Register the Effortless snack service worker (relative scope for GitHub Pages).
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./" })
      .catch((err) => {
        console.warn("[effortless] Service worker registration failed:", err);
      });
  });
}
