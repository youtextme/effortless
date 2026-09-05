/**
 * Effortless — Blog snack (minimal book flow)
 * Read → Comprehension → Video observations → Share
 */

const SNACKS = {
  rain: "content/sample-rain.json",
  mirror: "content/sample-mirror.json",
};

const DEFAULT_SNACK = "rain";
const MAX_WORDS_PER_SCREEN = 80;
const SCROLL_THRESHOLD = 48;

const STEPS = ["read", "comprehension", "video", "share"];

/** @type {Record<string, unknown> | null} */
let activeSnack = null;
let currentStep = "read";
let readScrollComplete = false;

const stepEls = {
  read: document.getElementById("step-read"),
  comprehension: document.getElementById("step-comprehension"),
  video: document.getElementById("step-video"),
  share: document.getElementById("step-share"),
};

const articleEl = document.getElementById("article");
const readProgressFill = document.getElementById("read-progress-fill");
const readProgressBar = document.getElementById("read-progress");
const readGateHint = document.getElementById("read-gate-hint");
const btnReadDone = document.getElementById("btn-read-done");
const comprehensionForm = document.getElementById("comprehension-form");
const videoPrompt = document.getElementById("video-prompt");
const videoLink = document.getElementById("video-link");
const videoObservations = document.getElementById("video-observations");
const shareMessage = document.getElementById("share-message");
const shareStatus = document.getElementById("share-status");
const createStatus = document.getElementById("create-status");
const topicInput = document.getElementById("topic-input");
const versionSwitcher = document.getElementById("version-switcher");

function getSnackKey() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("snack");
  return key && SNACKS[key] ? key : DEFAULT_SNACK;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function validateSnack(snack) {
  if (!snack?.screens?.length) {
    return "Snack needs at least one section.";
  }
  for (let i = 0; i < snack.screens.length; i += 1) {
    const screen = snack.screens[i];
    const words = countWords(screen.body || "");
    if (words > MAX_WORDS_PER_SCREEN) {
      return `Section ${i + 1} has ${words} words (max ${MAX_WORDS_PER_SCREEN}).`;
    }
  }
  if (!snack.comprehension?.length) {
    return "Snack needs at least one comprehension question.";
  }
  return null;
}

function setStatus(message) {
  if (!createStatus) return;
  createStatus.hidden = !message;
  createStatus.textContent = message || "";
}

function showStep(stepId) {
  currentStep = stepId;
  STEPS.forEach((id) => {
    const el = stepEls[id];
    if (el) el.hidden = id !== stepId;
  });
  readProgressBar.hidden = stepId !== "read";
  window.scrollTo(0, 0);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBodyWithTips(body, tips = {}) {
  const words = Object.keys(tips);
  if (!words.length) {
    return escapeHtml(body);
  }

  const pattern = new RegExp(
    `\\b(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi",
  );
  let html = "";
  let lastIndex = 0;
  let match;
  const re = new RegExp(pattern.source, pattern.flags);

  while ((match = re.exec(body)) !== null) {
    if (match.index > lastIndex) {
      html += escapeHtml(body.slice(lastIndex, match.index));
    }
    const key = match[1].toLowerCase();
    const tipKey = words.find((w) => w.toLowerCase() === key);
    if (tipKey && tips[tipKey]) {
      const tip = tips[tipKey];
      html += `<dfn title="${escapeHtml(tip.meaning)}">${escapeHtml(match[1])}</dfn>`;
    } else {
      html += escapeHtml(match[1]);
    }
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < body.length) {
    html += escapeHtml(body.slice(lastIndex));
  }
  return html;
}

function renderArticle(snack) {
  if (!articleEl) return;

  const sections = snack.screens
    .map((screen) => {
      const bodyHtml = renderBodyWithTips(screen.body || "", screen.tips);
      const heading = screen.heading
        ? `<h2>${escapeHtml(screen.heading)}</h2>`
        : "";
      return `<section class="article-section">${heading}<p>${bodyHtml}</p></section>`;
    })
    .join("");

  articleEl.innerHTML = `
    <h1 class="article-title">${escapeHtml(snack.title)}</h1>
    ${sections}
  `;

  document.title = `${snack.title} — Effortless`;
  readScrollComplete = false;
  updateReadGate();
  updateReadProgress();
}

function getScrollMetrics() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const viewport = window.innerHeight;
  const fullHeight = doc.scrollHeight;
  const remaining = fullHeight - (scrollTop + viewport);
  const progress = fullHeight <= viewport
    ? 100
    : Math.min(100, Math.round((scrollTop / (fullHeight - viewport)) * 100));
  return { scrollTop, remaining, progress };
}

function updateReadProgress() {
  if (!readProgressFill || !readProgressBar) return;
  const { progress, remaining } = getScrollMetrics();
  readProgressFill.style.width = `${progress}%`;
  readProgressBar.setAttribute("aria-valuenow", String(progress));

  if (remaining <= SCROLL_THRESHOLD) {
    readScrollComplete = true;
  }
  updateReadGate();
}

function updateReadGate() {
  if (!btnReadDone || !readGateHint) return;
  btnReadDone.disabled = !readScrollComplete;
  readGateHint.textContent = readScrollComplete
    ? "You reached the end."
    : "Scroll to the end to continue.";
}

function renderComprehension(snack) {
  if (!comprehensionForm) return;
  comprehensionForm.innerHTML = snack.comprehension
    .map((q, idx) => {
      const choices = q.choices
        .map(
          (choice, choiceIdx) => `
            <li>
              <label>
                <input type="radio" name="q${idx}" value="${choiceIdx}" required />
                <span>${escapeHtml(choice)}</span>
              </label>
            </li>
          `,
        )
        .join("");
      return `
        <fieldset class="question-block">
          <p class="question-text">${idx + 1}. ${escapeHtml(q.question)}</p>
          <ul class="choice-list">${choices}</ul>
        </fieldset>
      `;
    })
    .join("");
}

function renderVideoStep(snack) {
  const video = snack.video || {};
  if (videoPrompt) {
    videoPrompt.textContent =
      video.prompt || "Watch the short clip, then write what you noticed.";
  }
  if (videoLink) {
    if (video.url) {
      videoLink.hidden = false;
      videoLink.innerHTML = `<a href="${escapeHtml(video.url)}" target="_blank" rel="noopener noreferrer">Open video</a>`;
    } else {
      videoLink.hidden = true;
      videoLink.innerHTML = "";
    }
  }
  if (videoObservations) {
    videoObservations.value = "";
  }
}

function renderShareStep(snack) {
  if (shareMessage) {
    shareMessage.textContent = `You finished “${snack.title}”.`;
  }
  if (shareStatus) {
    shareStatus.hidden = true;
    shareStatus.textContent = "";
  }
}

async function loadSnack(key) {
  const path = SNACKS[key] || SNACKS[DEFAULT_SNACK];
  setStatus("Loading…");
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snack = await res.json();
    const err = validateSnack(snack);
    if (err) throw new Error(err);
    activeSnack = snack;
    if (topicInput && snack.topic) {
      topicInput.value = snack.topic;
    }
    renderArticle(snack);
    renderComprehension(snack);
    renderVideoStep(snack);
    renderShareStep(snack);
    showStep("read");
    setStatus("");
  } catch (e) {
    setStatus(`Could not load snack: ${e.message}`);
    showStep("read");
  }
}

function handleComprehensionSubmit(event) {
  event.preventDefault();
  if (!comprehensionForm?.reportValidity()) return;
  showStep("video");
}

function handleVideoContinue() {
  const minChars = activeSnack?.video?.minChars ?? 8;
  const text = videoObservations?.value.trim() || "";
  const hint = document.getElementById("video-hint");
  if (text.length < minChars) {
    videoObservations?.focus();
    if (videoObservations) {
      videoObservations.setAttribute("aria-invalid", "true");
    }
    if (hint) {
      hint.textContent = `Write a bit more (${minChars} characters minimum).`;
    }
    return;
  }
  videoObservations?.removeAttribute("aria-invalid");
  if (hint) {
    hint.textContent = "At least a sentence or two.";
  }
  showStep("share");
}

async function handleShare() {
  if (!activeSnack) return;
  const observations = videoObservations?.value.trim() || "";
  const payload = {
    title: "Effortless snack",
    text: `Finished “${activeSnack.title}”. Observations: ${observations}`,
    url: window.location.href.split("?")[0],
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      if (shareStatus) {
        shareStatus.hidden = false;
        shareStatus.textContent = "Shared.";
      }
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }

  const fallback = `${payload.text}\n${payload.url}`;
  try {
    await navigator.clipboard.writeText(fallback);
    if (shareStatus) {
      shareStatus.hidden = false;
      shareStatus.textContent = "Copied to clipboard.";
    }
  } catch {
    if (shareStatus) {
      shareStatus.hidden = false;
      shareStatus.textContent = "Share is not available on this device.";
    }
  }
}

function fallbackSnack(topic) {
  const clean = topic.trim() || "Why rain smells good";
  return {
    title: clean,
    topic: clean,
    screens: [
      {
        heading: "Your question",
        body: `Today we wonder about ${clean}. Good readers stay curious and take one idea at a time.`,
      },
      {
        heading: "Look and listen",
        body: "What do you notice about this topic around you? One small detail is enough to start.",
      },
      {
        heading: "Share it",
        body: "Tell someone one thing you learned. Explaining out loud helps your brain remember.",
      },
    ],
    comprehension: [
      {
        question: "What helps your brain remember what you read?",
        choices: ["Explaining it out loud", "Skipping the ending", "Reading faster"],
        answer: 0,
      },
    ],
    video: {
      prompt: "Watch a short clip about this topic. What did you notice?",
      minChars: 8,
    },
  };
}

async function tryOllamaGenerate(topic) {
  const prompt = `You write kid-safe blog snacks for a 4th grader (~10).
Topic: ${topic}
Return ONLY valid JSON:
{"title":"...","topic":"...","screens":[{"heading":"3-6 words","body":"max 80 words"}],"comprehension":[{"question":"...","choices":["a","b","c"],"answer":0}],"video":{"prompt":"Watch...","minChars":8}}
Rules: 3-5 sections, one idea each, 2 comprehension questions, English, no shopping.`;

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
    setStatus("Type a topic first.");
    topicInput?.focus();
    return;
  }
  setStatus("Generating…");
  try {
    activeSnack = await tryOllamaGenerate(topic);
    setStatus("Generated.");
  } catch {
    activeSnack = fallbackSnack(topic);
    setStatus("Ollama offline — used fallback.");
  }
  renderArticle(activeSnack);
  renderComprehension(activeSnack);
  renderVideoStep(activeSnack);
  renderShareStep(activeSnack);
  showStep("read");
}

async function renderVersionSwitcher() {
  if (!versionSwitcher) return;
  try {
    const res = await fetch("versions/manifest.json");
    if (!res.ok) throw new Error("manifest missing");
    const manifest = await res.json();
    const links = manifest.versions
      .map((v) => {
        const isCurrent = v.id === manifest.latest;
        if (isCurrent) {
          return `<span class="current">${escapeHtml(v.label)}</span>`;
        }
        const href = v.path === "." ? "." : v.path;
        return `<a href="${escapeHtml(href)}">${escapeHtml(v.label)}</a>`;
      })
      .join("");
    versionSwitcher.innerHTML = links;
  } catch {
    versionSwitcher.innerHTML = '<span class="current">v2 · latest</span><a href="versions/v1-stitch-cream/">v1</a>';
  }
}

window.addEventListener("scroll", updateReadProgress, { passive: true });
window.addEventListener("resize", updateReadProgress);

btnReadDone?.addEventListener("click", () => {
  if (!readScrollComplete) return;
  showStep("comprehension");
});

comprehensionForm?.addEventListener("submit", handleComprehensionSubmit);
document.getElementById("btn-video-done")?.addEventListener("click", handleVideoContinue);
document.getElementById("btn-share")?.addEventListener("click", handleShare);

document.getElementById("btn-try-sample")?.addEventListener("click", () => {
  if (topicInput) topicInput.value = "Why rain smells good";
  loadSnack("rain");
});

document.getElementById("btn-generate")?.addEventListener("click", generateSnack);

document.querySelectorAll(".more-snacks a[data-snack]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const key = link.getAttribute("data-snack");
    if (key) {
      const url = new URL(window.location.href);
      url.searchParams.set("snack", key);
      window.history.replaceState({}, "", url);
      loadSnack(key);
    }
  });
});

renderVersionSwitcher();
loadSnack(getSnackKey());
