import { loadConfig, loadState } from './config.js';
import { generateMessage } from './ollama.js';
import { sendWhatsAppMessage } from './whatsapp.js';

/**
 * Generate a message with Ollama and send via WhatsApp.
 * @param {{ configPath?: string }} [opts]
 */
export async function runDailyJob(opts = {}) {
  const config = await loadConfig(opts.configPath);
  const state = await loadState();

  console.log(`Generating message with Ollama (model: ${config.model})...`);
  const { text, model, url } = await generateMessage({
    urls: config.ollamaUrls,
    model: config.model,
    modelFallback: config.modelFallback,
    prompt: config.prompt,
  });
  console.log(`Generated ${text.length} chars via ${model} @ ${url}`);

  console.log(`Sending to "${config.to}"...`);
  const receipt = await sendWhatsAppMessage({
    text,
    jid: state.recipientJid,
    name: config.to,
  });

  console.log(`Sent to ${receipt.name} (message id: ${receipt.messageId})`);
  return { text, receipt, model, url };
}
