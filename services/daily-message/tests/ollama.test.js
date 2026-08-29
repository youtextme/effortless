import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { generateMessage, callGenerate, probeOllama } from '../lib/ollama.js';

describe('callGenerate', () => {
  it('returns response text from Ollama', async () => {
    const fetchImpl = mock.fn(async () => ({
      ok: true,
      json: async () => ({ response: 'Hello Sigma Boy!' }),
    }));

    const text = await callGenerate(
      'http://127.0.0.1:11434',
      'qwen3.5:4b',
      'Say hi',
      fetchImpl,
      5000
    );
    assert.equal(text, 'Hello Sigma Boy!');
    assert.equal(fetchImpl.mock.calls.length, 1);
    const [url, opts] = fetchImpl.mock.calls[0].arguments;
    assert.equal(url, 'http://127.0.0.1:11434/api/generate');
    assert.equal(JSON.parse(opts.body).model, 'qwen3.5:4b');
  });

  it('throws on HTTP error', async () => {
    const fetchImpl = mock.fn(async () => ({
      ok: false,
      status: 404,
      text: async () => 'model not found',
    }));

    await assert.rejects(
      () => callGenerate('http://127.0.0.1:11434', 'missing', 'hi', fetchImpl, 5000),
      /404/
    );
  });
});

describe('generateMessage', () => {
  it('tries primary URL and model first', async () => {
    const fetchImpl = mock.fn(async () => ({
      ok: true,
      json: async () => ({ response: 'Primary works' }),
    }));

    const result = await generateMessage({
      urls: ['http://127.0.0.1:11434'],
      model: 'qwen3.5:4b',
      modelFallback: 'llama3.2:3b',
      prompt: 'test',
      fetchImpl,
    });

    assert.equal(result.text, 'Primary works');
    assert.equal(result.model, 'qwen3.5:4b');
    assert.equal(fetchImpl.mock.calls.length, 1);
  });

  it('falls back to second URL when first fails', async () => {
    let calls = 0;
    const fetchImpl = mock.fn(async (url) => {
      calls += 1;
      if (url.includes('11434')) {
        throw new Error('connection refused');
      }
      return {
        ok: true,
        json: async () => ({ response: 'Router fallback' }),
      };
    });

    const result = await generateMessage({
      urls: ['http://127.0.0.1:11434', 'http://127.0.0.1:8817'],
      model: 'qwen3.5:4b',
      prompt: 'test',
      fetchImpl,
    });

    assert.equal(result.text, 'Router fallback');
    assert.equal(result.url, 'http://127.0.0.1:8817');
    assert.ok(calls >= 2);
  });

  it('falls back to secondary model', async () => {
    let calls = 0;
    const fetchImpl = mock.fn(async (_url, opts) => {
      calls += 1;
      const body = JSON.parse(opts.body);
      if (body.model === 'qwen3.5:4b') {
        return { ok: false, status: 404, text: async () => 'not found' };
      }
      return { ok: true, json: async () => ({ response: 'Fallback model' }) };
    });

    const result = await generateMessage({
      urls: ['http://127.0.0.1:11434'],
      model: 'qwen3.5:4b',
      modelFallback: 'llama3.2:3b',
      prompt: 'test',
      fetchImpl,
    });

    assert.equal(result.text, 'Fallback model');
    assert.equal(result.model, 'llama3.2:3b');
    assert.equal(calls, 2);
  });
});

describe('probeOllama', () => {
  it('returns first reachable URL', async () => {
    const fetchImpl = mock.fn(async (url) => {
      if (url.includes('8817')) return { ok: true };
      throw new Error('down');
    });

    const result = await probeOllama(
      ['http://127.0.0.1:11434', 'http://127.0.0.1:8817'],
      fetchImpl
    );
    assert.equal(result.up, true);
    assert.equal(result.url, 'http://127.0.0.1:8817');
  });

  it('returns up:false when all down', async () => {
    const fetchImpl = mock.fn(async () => {
      throw new Error('down');
    });
    const result = await probeOllama(['http://127.0.0.1:11434'], fetchImpl);
    assert.equal(result.up, false);
  });
});
