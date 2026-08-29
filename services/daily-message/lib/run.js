import { loadConfig, loadState } from './config.js';
import { generateMessage } from './ollama.js';
import { sendWhatsAppMessage } from './whatsapp.js';
import { EXIT } from './exit-codes.js';

function fail(code, message) {
  const err = new Error(message);
  err.exitCode = code;
  throw err;
}

/**
 * Generate a message with Ollama and send via WhatsApp.
 * @param {{ configPath?: string }} [opts]
 */
export async function runDailyJob(opts = {}) {
  const config = await loadConfig(opts.configPath);
  const state = await loadState();

  if (!state.recipientJid) {
    fail(EXIT.WHATSAPP_NOT_LINKED, 'WhatsApp not linked. Run: node cli.js link-whatsapp');
  }

  console.log(`Generating message with Ollama (model: ${config.model})...`);
  let text, model, url;
  try {
    ({ text, model, url } = await generateMessage({
      urls: config.ollamaUrls,
      model: config.model,
      modelFallback: config.modelFallback,
      prompt: config.prompt,
    }));
  } catch (err) {
    fail(EXIT.OLLAMA_FAIL, err.message);
  }
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
