#!/usr/bin/env node
/**
 * Localhost HTTP API for whatsapp-connector.
 * GET  /health        → doctor report
 * GET  /jobs          → list jobs
 * POST /jobs          → add/update job (JSON body)
 * POST /jobs/:id/run  → run one job now
 */

import { createServer } from 'node:http';
import { runDoctor } from './lib/doctor.js';
import { listJobs, upsertJob } from './lib/jobs.js';
import { runJob } from './lib/run.js';
import { EXIT, exitLabel } from './lib/exit-codes.js';
import { HTTP_HOST, HTTP_PORT } from './lib/paths.js';

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
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${HTTP_HOST}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      const report = await runDoctor();
      return json(res, report.ok ? 200 : 503, report);
    }

    if (req.method === 'GET' && url.pathname === '/jobs') {
      const jobs = await listJobs();
      return json(res, 200, { jobs });
    }

    if (req.method === 'POST' && url.pathname === '/jobs') {
      const raw = await readBody(req);
      let body;
      try {
        body = JSON.parse(raw || '{}');
      } catch {
        return json(res, 400, { ok: false, code: EXIT.CONFIG, error: 'Invalid JSON' });
      }
      const saved = await upsertJob(body);
      return json(res, 201, { ok: true, job: saved });
    }

    const runMatch = url.pathname.match(/^\/jobs\/([^/]+)\/run$/);
    if (req.method === 'POST' && runMatch) {
      try {
        const result = await runJob(runMatch[1]);
        return json(res, 200, { ok: true, code: EXIT.OK, ...result });
      } catch (err) {
        const code = err.exitCode ?? EXIT.INTERNAL;
        return json(res, 502, { ok: false, code, status: exitLabel(code), error: err.message });
      }
    }

    json(res, 404, { ok: false, error: 'Try GET /health, GET /jobs, POST /jobs, POST /jobs/:id/run' });
  } catch (err) {
    const code = err.exitCode ?? EXIT.INTERNAL;
    json(res, 500, { ok: false, code, error: err.message });
  }
});

server.listen(HTTP_PORT, HTTP_HOST, () => {
  console.log(`whatsapp-connector on http://${HTTP_HOST}:${HTTP_PORT}`);
});
