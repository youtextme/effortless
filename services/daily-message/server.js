#!/usr/bin/env node
/**
 * Optional localhost HTTP API (127.0.0.1:8770).
 * GET /health  → doctor report
 * POST /run-now → generate + send once
 */

import { createServer } from 'node:http';
import { runDoctor } from './lib/doctor.js';
import { runDailyJob } from './lib/run.js';
import { EXIT, exitLabel } from './lib/exit-codes.js';

const HOST = '127.0.0.1';
const PORT = 8770;

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${HOST}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      const report = await runDoctor();
      return json(res, report.ok ? 200 : 503, report);
    }

    if (req.method === 'POST' && url.pathname === '/run-now') {
      try {
        const result = await runDailyJob();
        return json(res, 200, { ok: true, code: EXIT.OK, ...result });
      } catch (err) {
        const code = err.exitCode ?? EXIT.INTERNAL;
        return json(res, 502, { ok: false, code, status: exitLabel(code), error: err.message });
      }
    }

    json(res, 404, { ok: false, error: 'Not found. Try GET /health or POST /run-now' });
  } catch (err) {
    json(res, 500, { ok: false, code: EXIT.INTERNAL, error: err.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`daily-message HTTP on http://${HOST}:${PORT} (localhost only)`);
});
