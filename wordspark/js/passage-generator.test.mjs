import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionToHtml } from './passage-generator.js';

test('visible HTML has no hidden section headings for speech to read', () => {
  const html = sectionToHtml({
    h2: 'Secret outline heading that kids never see',
    body: 'Kids only see this paragraph about asking questions.\nA second paragraph stays visible too.',
  }, [{ word: 'questions', meaning: 'asks', example: 'Ask questions.' }]);

  assert.equal(html.includes('passage-h2'), false);
  assert.equal(html.includes('Secret outline heading'), false);
  assert.ok(html.includes('Kids only see this paragraph'));
  assert.ok(html.includes('vocab-word'));
});
