/**
 * Effortless — Blog snack prototype
 * Macro flow: discover → read → done → next
 */

const STEPS = [
  { id: "discover", label: "Discover" },
  { id: "read", label: "Read" },
  { id: "done", label: "Done" },
  { id: "next", label: "Next" },
];

const DEFAULT_SNACK_PATH = "content/why-rain-smells-good.json";
const MIRROR_SNACK_PATH = "content/how-a-mirror-helps-you-notice-yourself.json";
const DEFAULT_TOPIC = "Why rain smells good";
const MAX_WORDS_PER_SCREEN = 80;
const READER_NAME = "Ayaan";

/** @type {{ title: string; topic: string; screens: { heading: string; body: string }[] } | null} */
let activeSnack = null;
let readIndex = 0;
let currentStep = "discover";

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
const snackTitleEl = document.getElementById("done-snack-title");

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
  createStatus.hidden = !message;
  createStatus.textContent = message;
  createStatus.className = `status-msg ${type}`;
}

async function loadSnackFromPath(path, successLabel) {
  setCreateStatus("Loading snack…", "info");
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snack = await res.json();
    const err = validateSnack(snack);
    if (err) throw new Error(err);
    activeSnack = snack;
    readIndex = 0;
    if (topicInput && snack.topic) {
      topicInput.value = snack.topic;
    }
    setCreateStatus(successLabel || `Loaded “${snack.title}”.`, "success");
    setTimeout(() => showStep("read"), 400);
  } catch (e) {
    setCreateStatus(
      `Could not load snack: ${e.message}. Use a local server — npx serve web/snack-blog -p 5173`,
      "warn",
    );
  }
}

async function loadDefaultSnack() {
  await loadSnackFromPath(DEFAULT_SNACK_PATH, `“Why rain smells good” is ready for ${READER_NAME}.`);
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
        body: "What do you notice about this topic around you? One small detail is enough to start. Write it down or tell a grown-up.",
      },
      {
        heading: "Ask again",
        body: "What follow-up question pops into your head? Strong thinkers ask more than once. That is how ideas grow.",
      },
      {
        heading: "Share it",
        body: "Tell someone one thing you learned. When you explain it out loud, your brain remembers it better.",
      },
    ],
  };
}

async function tryOllamaGenerate(topic) {
  const prompt = `You write kid-safe blog snacks for Ayaan, a 4th grade student (~10 years old). NOT for 3 year olds.
Topic: ${topic}
Return ONLY valid JSON (no markdown):
{
  "title": "short title",
  "topic": "${topic.replace(/"/g, '\\"')}",
  "reader": "Ayaan",
  "grade": "4th",
  "screens": [
    { "heading": "3-6 words", "body": "one idea, max 80 words, calm tone" }
  ]
}
Rules: 6 screens, one idea each, curiosity, no shopping, no scary content, English only.`;

  const res = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      prompt,
      stream: false,
      format: "json",
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.response);
  const err = validateSnack(parsed);
  if (err) throw new Error(err);
  return parsed;
}

async function generateSnack() {
  const topic = topicInput.value.trim();
  if (!topic) {
    setCreateStatus("Type a topic first.", "warn");
    topicInput.focus();
    return;
  }

  setCreateStatus("Generating with local Ollama… (or offline fallback)", "info");

  try {
    activeSnack = await tryOllamaGenerate(topic);
    setCreateStatus(`Generated “${activeSnack.title}” for ${READER_NAME}.`, "success");
  } catch {
    activeSnack = fallbackSnack(topic);
    setCreateStatus("Ollama offline — used built-in fallback. See docs/local-llm-blog-snack.md.", "warn");
  }

  readIndex = 0;
  setTimeout(() => showStep("read"), 400);
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
  readerBody.textContent = screen.body;
  readerCounter.textContent = `Screen ${readIndex + 1} of ${total}`;

  document.getElementById("btn-read-prev").disabled = readIndex === 0;
  document.getElementById("btn-read-next").textContent =
    readIndex === total - 1 ? "Finish snack" : "Next screen";
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

function prevReadScreen() {
  if (readIndex > 0) {
    readIndex -= 1;
    renderReadScreen();
  }
}

let touchStartX = 0;
const readerPane = document.getElementById("reader-pane");
if (readerPane) {
  readerPane.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );
  readerPane.addEventListener(
    "touchend",
    (e) => {
      const delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) < 50) return;
      if (delta < 0) nextReadScreen();
      else prevReadScreen();
    },
    { passive: true },
  );
}

document.getElementById("btn-read-snack")?.addEventListener("click", () => {
  topicInput.value = DEFAULT_TOPIC;
  loadDefaultSnack();
});

document.getElementById("btn-generate")?.addEventListener("click", generateSnack);

document.getElementById("btn-read-prev")?.addEventListener("click", prevReadScreen);
document.getElementById("btn-read-next")?.addEventListener("click", nextReadScreen);

document.getElementById("btn-next-snack")?.addEventListener("click", () => showStep("next"));

document.getElementById("btn-next-fresh")?.addEventListener("click", () => {
  setCreateStatus("");
  showStep("discover");
});

document.getElementById("btn-reread-rain")?.addEventListener("click", () => {
  topicInput.value = DEFAULT_TOPIC;
  loadDefaultSnack();
});

document.querySelectorAll(".topic-chip-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const path = btn.getAttribute("data-snack-path");
    if (path) {
      loadSnackFromPath(path);
    }
  });
});

renderChips();
showStep("discover");
