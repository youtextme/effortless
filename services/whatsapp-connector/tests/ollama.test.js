import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { generate, callGenerate, probe } from '../llm/ollama.js';

describe('callGenerate', () => {
  it('returns response text', async () => {
    const fetchImpl = mock.fn(async () => ({
      ok: true,
      json: async () => ({ response: 'Hello!' }),
    }));
    const text = await callGenerate('http://127.0.0.1:11434', 'qwen3.5:4b', 'hi', fetchImpl, 5000);
    assert.equal(text, 'Hello!');
  });
});

describe('generate', () => {
  it('falls back to second URL', async () => {
    const fetchImpl = mock.fn(async (url) => {
      if (url.includes('11434')) throw new Error('down');
      return { ok: true, json: async () => ({ response: 'via router' }) };
    });
    const r = await generate({
      urls: ['http://127.0.0.1:11434', 'http://127.0.0.1:8817'],
      model: 'qwen3.5:4b',
      prompt: 'test',
      fetchImpl,
    });
    assert.equal(r.text, 'via router');
    assert.equal(r.url, 'http://127.0.0.1:8817');
  });

  it('falls back to secondary model', async () => {
    const fetchImpl = mock.fn(async (_url, opts) => {
      const body = JSON.parse(opts.body);
      if (body.model === 'qwen3.5:4b') {
        return { ok: false, status: 404, text: async () => '' };
      }
      return { ok: true, json: async () => ({ response: 'fallback' }) };
    });
    const r = await generate({
      urls: ['http://127.0.0.1:11434'],
      model: 'qwen3.5:4b',
      modelFallback: 'llama3.2:3b',
      prompt: 'test',
      fetchImpl,
    });
    assert.equal(r.model, 'llama3.2:3b');
  });
});

describe('probe', () => {
  it('returns first up URL', async () => {
    const fetchImpl = mock.fn(async (url) => {
      if (url.includes('8817')) return { ok: true };
      throw new Error('down');
    });
    const r = await probe(['http://127.0.0.1:11434', 'http://127.0.0.1:8817'], fetchImpl);
    assert.equal(r.up, true);
    assert.equal(r.url, 'http://127.0.0.1:8817');
  });
});
