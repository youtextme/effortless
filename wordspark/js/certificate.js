/**
 * Minimal printable certificate — topic, takeaway, words learned.
 */

import { getTopicTitle } from './data/topics.js';
import { getTargetWords } from './passage-generator.js';

const MAX_TAKEAWAY_WORDS = 80;

function truncateWords(text, max) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max) return text;
  return words.slice(0, max).join(' ') + '…';
}

export async function generateCertificate({ childName, dayData, progress }) {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1520;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const topic = dayData.theme || getTopicTitle(dayData.day);
  const takeaway = truncateWords(dayData.takeaway || '', MAX_TAKEAWAY_WORDS);
  const name = childName || 'Student';
  const words = getTargetWords(dayData);
  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // White printable background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Thin border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Golden badge
  const badgeX = width / 2;
  const badgeY = 200;
  const badgeR = 72;
  const grad = ctx.createRadialGradient(badgeX, badgeY, 8, badgeX, badgeY, badgeR);
  grad.addColorStop(0, '#fff8dc');
  grad.addColorStop(0.5, '#ffd700');
  grad.addColorStop(1, '#c9a227');
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#7a5c00';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', badgeX, badgeY + 18);

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 42px Georgia, serif';
  ctx.fillText('Certificate', width / 2, 340);

  ctx.fillStyle = '#444444';
  ctx.font = '28px Arial, sans-serif';
  ctx.fillText('WordSpark', width / 2, 390);

  ctx.fillStyle = '#1a73e8';
  ctx.font = 'bold 48px Georgia, serif';
  wrapText(ctx, name, width / 2, 470, width - 160, 56);

  ctx.fillStyle = '#202124';
  ctx.font = 'bold 36px Georgia, serif';
  wrapText(ctx, topic, width / 2, 560, width - 120, 44);

  ctx.fillStyle = '#5f6368';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText('Key takeaway', width / 2, 660);
  ctx.fillStyle = '#202124';
  ctx.font = 'italic 28px Georgia, serif';
  wrapText(ctx, takeaway, width / 2, 710, width - 140, 38);

  ctx.fillStyle = '#5f6368';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText('Words learned', width / 2, 920);

  ctx.fillStyle = '#202124';
  ctx.font = '28px Arial, sans-serif';
  const wordList = words.map((w) => w.word).join(' · ');
  wrapText(ctx, wordList, width / 2, 970, width - 120, 36);

  ctx.fillStyle = '#9aa0a6';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText(date, width / 2, 1380);
  ctx.fillText(`${progress?.totalWordsLearned ?? words.length} of 1000 words · Topic ${dayData.day} of 100`, width / 2, 1420);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  ctx.textAlign = 'center';

  for (const word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, currentY);
}

export async function shareCertificate(canvas, dayData) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      const topic = dayData.theme || getTopicTitle(dayData.day);
      const file = new File([blob], `wordspark-${dayData.day}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `WordSpark — ${topic}`,
            text: `I completed "${topic}" on WordSpark!`,
            files: [file],
          });
          resolve({ method: 'share', success: true });
          return;
        } catch (err) {
          if (err.name === 'AbortError') {
            resolve({ method: 'share', success: false, cancelled: true });
            return;
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wordspark-${dayData.day}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve({ method: 'download', success: true });
    }, 'image/png');
  });
}
