#!/usr/bin/env node
/**
 * HTTP microservice for WhatsApp send bridge.
 * Binds 127.0.0.1:8765 only — localhost personal use.
 */

import { createServer } from 'node:http';
import { sendMessage, getStatus, listChats } from './lib/send.js';
import { validateSendInput } from './lib/validation.js';
import { healAndWait } from './lib/heal.js';
import { isCdpUp } from './lib/cdp.js';
import { EXIT, exitLabel } from './lib/exit-codes.js';
import { HTTP_HOST, HTTP_PORT } from './lib/constants.js';

const MAX_BODY = 64 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function handleHealth(_req, res) {
  const cdp = await isCdpUp();
  const body = { ok: cdp, cdp };

  if (cdp) {
    const { status } = await getStatus();
    Object.assign(body, status);
  }

  json(res, cdp ? 200 : 503, body);
}

async function handleFix(_req, res) {
  const result = await healAndWait();
  const status = result.cdpUp ? 200 : 503;
  json(res, status, {
    ok: result.cdpUp,
    cdp: result.cdpUp,
    output: result.output,
  });
}

async function handleSend(req, res) {
  let raw;
  try {
    raw = await readBody(req);
  } catch (err) {
    return json(res, 413, { ok: false, error: err.message });
  }

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return json(res, 400, { ok: false, error: 'Invalid JSON body.', code: EXIT.USAGE });
  }

  const validationError = validateSendInput(body);
  if (validationError) {
    return json(res, 400, {
      ok: false,
      error: validationError.error,
      code: validationError.code,
    });
  }

  const { code, receipt } = await sendMessage(body);
  const httpStatus = code === EXIT.OK ? 200 : code === EXIT.USAGE ? 400 : 502;
  json(res, httpStatus, { ...receipt, code, status: exitLabel(code) });
}

async function handleList(_req, res) {
  const { code, chats, error } = await listChats();
  const body = { chats };
  if (error) body.error = error;
  json(res, code === EXIT.OK ? 200 : 502, body);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${HTTP_HOST}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return await handleHealth(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/fix') {
      return await handleFix(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/send') {
      return await handleSend(req, res);
    }
    if (req.method === 'GET' && url.pathname === '/list') {
      return await handleList(req, res);
    }

    json(res, 404, { ok: false, error: 'Not found' });
  } catch (err) {
    json(res, 500, { ok: false, error: err.message, code: EXIT.INTERNAL });
  }
});

server.listen(HTTP_PORT, HTTP_HOST, () => {
  console.log(`whatsapp-send listening on http://${HTTP_HOST}:${HTTP_PORT}`);
});
