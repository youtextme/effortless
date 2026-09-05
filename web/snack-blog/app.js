/**
 * Effortless — Blog snack prototype
 * Kid path: Discover → Read → Done → Next
 */

const STEPS = [
  { id: "discover", label: "Discover" },
  { id: "read", label: "Read" },
  { id: "done", label: "Done" },
  { id: "next", label: "Next" },
];

const SAMPLE_RAIN = "content/sample-rain.json";
const SAMPLE_MIRROR = "content/sample-mirror.json";
const DEFAULT_TOPIC = "Why rain smells good";
const MAX_WORDS_PER_SCREEN = 80;
const READER_NAME = "Ayaan";

/** @type {{ title: string; topic?: string; screens: { heading: string; body: string; tips?: Record<string, { meaning: string; example: string }> }[] } | null} */
let activeSnack = null;
let readIndex = 0;
let currentStep = "discover";
let lastSnackPath = SAMPLE_RAIN;

const floors = {
  discover: document.getElementById("floor-discover"),
  read: document.getElementById("floor-read"),
  done: document.getElementById("floor-done"),
  next: document.getElementById("floor-next"),
};

const chipsEl = document.getElementById("progress-chips");
const topicInput = document.getElementById("topic-input");
const createStatus = document.getElementById("create-status");
const readerSnackTitle = document.getElementById("reader-snack-title");
const readerHeading = document.getElementById("reader-heading");
const readerBody = document.getElementById("reader-body");
const readerCounter = document.getElementById("reader-counter");
const readProgressEl = document.getElementById("read-progress");
const snackTitleEl = document.getElementById("done-snack-title");
const mirrorCard = document.getElementById("sample-mirror-card");

function getStepIndex(stepId) {
  return STEPS.findIndex((s) => s.id === stepId);
}

function renderChips() {
  const currentIdx = getStepIndex(currentStep);
  chipsEl.innerHTML = STEPS.map((step, idx) => {
    const isCurrent = step.id === currentStep;
    const isDone = idx < currentIdx;
    let attrs = `class="chip${isDone ? " done" : ""}"`;
    if (isCurrent) {
      attrs += ' aria-current="step"';
    }
    return `<span ${attrs}>${step.label}</span>`;
  }).join("");
}

function showStep(stepId) {
  currentStep = stepId;
  Object.entries(floors).forEach(([id, el]) => {
    if (!el) return;
    el.hidden = id !== stepId;
  });
  renderChips();
  if (stepId === "read") {
    renderReadScreen();
  }
  if (stepId === "next") {
    highlightNextSuggestion();
  }
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function validateSnack(snack) {
  if (!snack?.screens?.length) {
    return "Snack needs at least one screen.";
  }
  for (let i = 0; i < snack.screens.length; i += 1) {
    const screen = snack.screens[i];
    const words = countWords(screen.body || "");
    if (words > MAX_WORDS_PER_SCREEN) {
      return `Screen ${i + 1} has ${words} words (max ${MAX_WORDS_PER_SCREEN}).`;
    }
  }
  return null;
}

function setCreateStatus(message, type = "info") {
  if (!createStatus) return;
  createStatus.hidden = !message;
  createStatus.textContent = message;
  createStatus.className = `status-msg ${type}`;
}

async function loadSnackFromPath(path, options = {}) {
  const { silent = false } = options;
  if (!silent) {
    setCreateStatus("Loading snack…", "info");
  }
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snack = await res.json();
    const err = validateSnack(snack);
    if (err) throw new Error(err);
    activeSnack = snack;
    readIndex = 0;
    lastSnackPath = path;
    if (topicInput && snack.topic) {
      topicInput.value = snack.topic;
    }
    if (!silent) {
      setCreateStatus(`Loaded “${snack.title}”.`, "success");
    }
    showStep("read");
  } catch (e) {
    setCreateStatus(
      `Could not load snack: ${e.message}. Run: npx serve web/snack-blog -p 5173`,
      "warn",
    );
  }
}

function highlightNextSuggestion() {
  if (!mirrorCard) return;
  const suggestMirror = lastSnackPath === SAMPLE_RAIN;
  mirrorCard.classList.toggle("sample-card-highlight", suggestMirror);
}

function renderBodyWithTips(screen) {
  const body = screen.body || "";
  const tips = screen.tips || {};
  const words = Object.keys(tips);
  if (!words.length) {
    readerBody.textContent = body;
    return;
  }

  const pattern = new RegExp(`\\b(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
  readerBody.innerHTML = "";
  let lastIndex = 0;
  let match;
  const re = new RegExp(pattern.source, pattern.flags);

  while ((match = re.exec(body)) !== null) {
    if (match.index > lastIndex) {
      readerBody.appendChild(document.createTextNode(body.slice(lastIndex, match.index)));
    }
    const key = match[1].toLowerCase();
    const tipKey = words.find((w) => w.toLowerCase() === key);
    if (tipKey && tips[tipKey]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hard-word";
      btn.textContent = match[1];
      btn.setAttribute("aria-label", `Tip for ${match[1]}`);
      btn.addEventListener("click", () => showTipSheet(tipKey, tips[tipKey]));
      readerBody.appendChild(btn);
    } else {
      readerBody.appendChild(document.createTextNode(match[1]));
    }
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < body.length) {
    readerBody.appendChild(document.createTextNode(body.slice(lastIndex)));
  }
}

function showTipSheet(word, tip) {
  const existing = document.getElementById("tip-sheet");
  if (existing) existing.remove();

  const sheet = document.createElement("div");
  sheet.id = "tip-sheet";
  sheet.className = "tip-sheet";
  sheet.innerHTML = `
    <div class="tip-sheet-panel" role="dialog" aria-labelledby="tip-word">
      <p class="tip-sheet-label">Word tip</p>
      <h4 id="tip-word" class="tip-sheet-word">${word}</h4>
      <p class="tip-sheet-meaning">${tip.meaning}</p>
      <p class="tip-sheet-example"><strong>In life:</strong> ${tip.example}</p>
      <button type="button" class="btn btn-primary tip-close">Got it</button>
    </div>
  `;
  sheet.querySelector(".tip-close")?.addEventListener("click", () => sheet.remove());
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) sheet.remove();
  });
  document.body.appendChild(sheet);
}

function renderReadProgress(total) {
  if (!readProgressEl) return;
  readProgressEl.innerHTML = "";
  for (let i = 0; i < total; i += 1) {
    const seg = document.createElement("span");
    seg.className = `read-progress-seg${i <= readIndex ? " filled" : ""}`;
    readProgressEl.appendChild(seg);
  }
}

function renderReadScreen() {
  if (!activeSnack?.screens?.length) {
    showStep("discover");
    return;
  }

  const screen = activeSnack.screens[readIndex];
  const total = activeSnack.screens.length;

  readerSnackTitle.textContent = activeSnack.title;
  readerHeading.textContent = screen.heading;
  renderBodyWithTips(screen);
  readerCounter.textContent = `Screen ${readIndex + 1} of ${total}`;
  renderReadProgress(total);

  const nextBtn = document.getElementById("btn-read-next");
  if (nextBtn) {
    nextBtn.textContent = readIndex === total - 1 ? "Finish snack" : "Forward";
  }
}

function nextReadScreen() {
  if (!activeSnack) return;
  if (readIndex < activeSnack.screens.length - 1) {
    readIndex += 1;
    renderReadScreen();
  } else {
    snackTitleEl.textContent = activeSnack.title;
    showStep("done");
  }
}

function fallbackSnack(topic) {
  const clean = topic.trim() || DEFAULT_TOPIC;
  return {
    title: clean,
    topic: clean,
    reader: READER_NAME,
    screens: [
      {
        heading: "Your question",
        body: `Today we wonder about ${clean}. You do not need every answer right now. Good readers stay curious and take one bite at a time.`,
      },
      {
        heading: "Look and listen",
        body: "What do you notice about this topic around you? One small detail is enough to start.",
      },
      {
        heading: "Share it",
        body: "Tell someone one thing you learned. When you explain it out loud, your brain remembers it better.",
      },
    ],
  };
}

async function tryOllamaGenerate(topic) {
  const prompt = `You write kid-safe blog snacks for Ayaan, 4th grade (~10). NOT for 3 year olds.
Topic: ${topic}
Return ONLY valid JSON:
{"title":"...","topic":"...","reader":"Ayaan","screens":[{"heading":"3-6 words","body":"max 80 words"}]}
Rules: 4-6 screens, one idea each, English, no shopping.`;

  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3.2", prompt, stream: false, format: "json" }),
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.response);
  const err = validateSnack(parsed);
  if (err) throw new Error(err);
  return parsed;
}

async function generateSnack() {
  const topic = topicInput?.value.trim();
  if (!topic) {
    setCreateStatus("Type a topic first.", "warn");
    topicInput?.focus();
    return;
  }
  setCreateStatus("Generating…", "info");
  try {
    activeSnack = await tryOllamaGenerate(topic);
    setCreateStatus(`Generated “${activeSnack.title}”.`, "success");
  } catch {
    activeSnack = fallbackSnack(topic);
    setCreateStatus("Ollama offline — used fallback.", "warn");
  }
  readIndex = 0;
  lastSnackPath = "";
  showStep("read");
}

let touchStartX = 0;
const readerPane = document.getElementById("reader-pane");
if (readerPane) {
  readerPane.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  readerPane.addEventListener("touchend", (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (delta < -50) nextReadScreen();
  }, { passive: true });
}

document.getElementById("btn-start-reading")?.addEventListener("click", () => {
  loadSnackFromPath(SAMPLE_RAIN, { silent: true });
});

document.querySelectorAll(".snack-start-btn, .sample-card[data-snack-path]").forEach((el) => {
  el.addEventListener("click", () => {
    const path = el.getAttribute("data-snack-path");
    if (path) loadSnackFromPath(path, { silent: true });
  });
});

document.getElementById("btn-try-sample")?.addEventListener("click", () => {
  if (topicInput) topicInput.value = DEFAULT_TOPIC;
  loadSnackFromPath(SAMPLE_RAIN);
});

document.getElementById("btn-generate")?.addEventListener("click", generateSnack);
document.getElementById("btn-read-next")?.addEventListener("click", nextReadScreen);
document.getElementById("btn-next-snack")?.addEventListener("click", () => showStep("next"));
document.getElementById("btn-done-for-now")?.addEventListener("click", () => showStep("discover"));
document.getElementById("btn-back-home")?.addEventListener("click", () => showStep("discover"));

renderChips();
showStep("discover");
