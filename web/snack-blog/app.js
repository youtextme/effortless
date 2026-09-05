/**
 * Effortless — Blog snack prototype
 * Step flow: discover → pick → create → read → done
 */

const STEPS = [
  { id: "discover", label: "Discover" },
  { id: "pick", label: "Pick" },
  { id: "create", label: "Create" },
  { id: "read", label: "Read" },
  { id: "done", label: "Done" },
];

const MAX_WORDS_PER_SCREEN = 80;

/** @type {{ title: string; topic: string; screens: { heading: string; body: string }[] } | null} */
let activeSnack = null;
let readIndex = 0;
let currentStep = "discover";

const floors = {
  discover: document.getElementById("floor-discover"),
  pick: document.getElementById("floor-pick"),
  create: document.getElementById("floor-create"),
  read: document.getElementById("floor-read"),
  done: document.getElementById("floor-done"),
};

const chipsEl = document.getElementById("progress-chips");
const topicInput = document.getElementById("topic-input");
const createStatus = document.getElementById("create-status");
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

async function loadSampleSnack() {
  setCreateStatus("Loading sample snack…", "info");
  try {
    const res = await fetch("content/sample-curiosity.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snack = await res.json();
    const err = validateSnack(snack);
    if (err) throw new Error(err);
    activeSnack = snack;
    readIndex = 0;
    setCreateStatus(`Loaded “${snack.title}” — ${snack.screens.length} screens ready.`, "success");
    setTimeout(() => showStep("read"), 600);
  } catch (e) {
    setCreateStatus(`Could not load sample: ${e.message}. Open via a local server (see README).`, "warn");
  }
}

function fallbackSnack(topic) {
  const clean = topic.trim() || "being curious";
  return {
    title: `Wondering about ${clean}`,
    topic: clean,
    screens: [
      {
        heading: "Your topic",
        body: `Today we explore ${clean}. You do not need to know everything right away. Curiosity means enjoying the questions.`,
      },
      {
        heading: "Look closer",
        body: "Notice one small detail about this topic. What do you see, hear, or feel? Writing it down helps your brain remember.",
      },
      {
        heading: "Ask one more",
        body: "Think of a follow-up question. Who could help you find an answer — a book, a grown-up, or a quiet search?",
      },
      {
        heading: "What stuck?",
        body: "Tell someone one fact or idea you liked. Teaching others is a secret way to learn twice.",
      },
    ],
  };
}

async function tryOllamaGenerate(topic) {
  const prompt = `You write kid-safe blog snacks for a ~10 year old.
Topic: ${topic}
Return ONLY valid JSON (no markdown):
{
  "title": "short title",
  "topic": "${topic.replace(/"/g, '\\"')}",
  "screens": [
    { "heading": "3-6 words", "body": "one idea, max 80 words, calm tone" }
  ]
}
Rules: 6 screens, one idea each, growth mindset, no shopping, no scary content.`;

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
    setCreateStatus("Type a topic first — e.g. “Why do stars twinkle?”", "warn");
    topicInput.focus();
    return;
  }

  setCreateStatus("Generating with local Ollama… (or using offline fallback)", "info");

  try {
    activeSnack = await tryOllamaGenerate(topic);
    setCreateStatus(`Generated “${activeSnack.title}” locally.`, "success");
  } catch {
    activeSnack = fallbackSnack(topic);
    setCreateStatus(
      "Ollama not reachable — used built-in fallback text. See docs/local-llm-blog-snack.md.",
      "warn",
    );
  }

  readIndex = 0;
  setTimeout(() => showStep("read"), 500);
}

function renderReadScreen() {
  if (!activeSnack?.screens?.length) {
    showStep("create");
    return;
  }

  const screen = activeSnack.screens[readIndex];
  const total = activeSnack.screens.length;

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

// Touch swipe on reader
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

// Wire buttons
document.getElementById("btn-discover-next")?.addEventListener("click", () => showStep("pick"));

document.getElementById("btn-pick-blog")?.addEventListener("click", () => showStep("create"));

document.getElementById("btn-load-sample")?.addEventListener("click", loadSampleSnack);
document.getElementById("btn-generate")?.addEventListener("click", generateSnack);

document.getElementById("btn-read-prev")?.addEventListener("click", prevReadScreen);
document.getElementById("btn-read-next")?.addEventListener("click", nextReadScreen);

document.getElementById("btn-another")?.addEventListener("click", () => {
  readIndex = 0;
  showStep("pick");
});

document.getElementById("btn-start-over")?.addEventListener("click", () => {
  activeSnack = null;
  readIndex = 0;
  topicInput.value = "";
  setCreateStatus("");
  showStep("discover");
});

renderChips();
showStep("discover");
