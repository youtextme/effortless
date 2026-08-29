import {
  getJob,
  buildPrompt,
  resolveJobModels,
  getRecipientState,
  saveRecipientState,
} from './jobs.js';
import { generate, probe } from '../llm/ollama.js';
import { sendMessage } from '../whatsapp/baileys.js';
import { fail, EXIT } from './exit-codes.js';

/**
 * Run one job: LLM generate → WhatsApp send.
 * @param {string} jobId
 */
export async function runJob(jobId) {
  const { job, settings } = await getJob(jobId);

  if (job.enabled === false) {
    throw fail(EXIT.CONFIG, `Job "${jobId}" is disabled.`);
  }

  const models = resolveJobModels(job, settings);
  const ollama = await probe(models.ollamaUrls);
  if (!ollama.up) {
    throw fail(EXIT.OLLAMA_DOWN, 'Ollama not reachable (tried 11434 and 8817).');
  }

  const prompt = buildPrompt(job);
  console.log(`[${jobId}] Generating with ${models.model}...`);

  let text, model, url;
  try {
    ({ text, model, url } = await generate({
      urls: models.ollamaUrls,
      model: models.model,
      modelFallback: models.modelFallback,
      prompt,
    }));
  } catch (err) {
    throw fail(EXIT.OLLAMA_FAIL, err.message);
  }

  console.log(`[${jobId}] Generated ${text.length} chars via ${model} @ ${url}`);

  const saved = await getRecipientState(jobId);
  const dest = {
    text,
    jid: saved?.jid,
    to: job.to,
    phone: job.phone,
  };

  console.log(`[${jobId}] Sending to ${job.to ?? job.phone}...`);
  const receipt = await sendMessage(dest);

  if (!saved?.jid) {
    await saveRecipientState(jobId, receipt.jid, receipt.name ?? job.to ?? job.phone);
  }

  console.log(`[${jobId}] Sent (id: ${receipt.messageId})`);
  return { jobId, text, model, url, receipt };
}
