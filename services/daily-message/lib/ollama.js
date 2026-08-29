/**
 * Ollama client with URL and model fallbacks.
 * Does not modify the router at 127.0.0.1:8817 — only calls it as a fallback endpoint.
 */

const DEFAULT_TIMEOUT_MS = 120_000;

/**
 * Try generating text from Ollama.
 * @param {object} opts
 * @param {string[]} opts.urls - Ollama base URLs to try in order
 * @param {string} opts.model - Primary model
 * @param {string} [opts.modelFallback] - Fallback model if primary fails
 * @param {string} opts.prompt
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {number} [opts.timeoutMs]
 */
export async function generateMessage({
  urls,
  model,
  modelFallback,
  prompt,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const models = [model, modelFallback].filter(Boolean);
  const errors = [];

  for (const baseUrl of urls) {
    for (const m of models) {
      try {
        const text = await callGenerate(baseUrl, m, prompt, fetchImpl, timeoutMs);
        if (text && text.trim()) {
          return { text: text.trim(), model: m, url: baseUrl };
        }
        errors.push(`${baseUrl} model ${m}: empty response`);
      } catch (err) {
        errors.push(`${baseUrl} model ${m}: ${err.message}`);
      }
    }
  }

  throw new Error(`Ollama generation failed:\n${errors.join('\n')}`);
}

/**
 * @param {string} baseUrl
 * @param {string} model
 * @param {string} prompt
 * @param {typeof fetch} fetchImpl
 * @param {number} timeoutMs
 */
export async function callGenerate(baseUrl, model, prompt, fetchImpl, timeoutMs) {
  const url = `${baseUrl.replace(/\/$/, '')}/api/generate`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }

  const data = await res.json();
  return data.response ?? '';
}

/**
 * Check if any Ollama endpoint responds.
 * @param {string[]} urls
 * @param {typeof fetch} [fetchImpl]
 */
export async function probeOllama(urls, fetchImpl = fetch) {
  for (const baseUrl of urls) {
    try {
      const res = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return { up: true, url: baseUrl };
    } catch {
      /* try next */
    }
  }
  return { up: false };
}
