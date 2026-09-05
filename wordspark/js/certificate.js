/**
 * Generates a shareable certificate image using Canvas.
 */

export async function generateCertificate({ childName, dayData, progress }) {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1520;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16213e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  ctx.strokeRect(55, 55, width - 110, height - 110);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 WordSpark', width / 2, 160);

  ctx.fillStyle = '#ffffff';
  ctx.font = '36px Georgia, serif';
  ctx.fillText('Certificate of Achievement', width / 2, 230);

  const name = childName || 'Young Scholar';
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText(name, width / 2, 340);

  ctx.fillStyle = '#cccccc';
  ctx.font = '32px Arial, sans-serif';
  ctx.fillText(`completed Day ${dayData.day} of 100`, width / 2, 410);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText(`📚 ${dayData.theme}`, width / 2, 500);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 28px Georgia, serif';
  wrapText(ctx, `"${dayData.takeaway}"`, width / 2, 560, width - 160, 36);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText('✨ 10 Advanced Words Learned Today', width / 2, 700);

  ctx.fillStyle = '#ffffff';
  ctx.font = '28px Arial, sans-serif';
  let y = 760;
  const col1 = dayData.words.slice(0, 5);
  const col2 = dayData.words.slice(5, 10);

  for (let i = 0; i < 5; i++) {
    const w1 = col1[i];
    const w2 = col2[i];
    ctx.textAlign = 'left';
    if (w1) {
      ctx.fillStyle = '#e94560';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText(`${i + 1}. ${w1.word}`, 100, y);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText(`   ${w1.meaning}`, 100, y + 30);
    }
    if (w2) {
      ctx.fillStyle = '#e94560';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText(`${i + 6}. ${w2.word}`, 560, y);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText(`   ${w2.meaning}`, 560, y + 30);
    }
    y += 80;
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#cccccc';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText(`📊 Progress: ${progress.totalWordsLearned} words learned`, width / 2, 1220);
  ctx.fillText(`🔥 Streak: ${progress.streak} day${progress.streak !== 1 ? 's' : ''}`, width / 2, 1260);
  ctx.fillText(`📅 Day ${dayData.day} of 100 — ${100 - dayData.day} days to mastery!`, width / 2, 1300);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('Share with parents on WhatsApp! 💬', width / 2, 1380);

  ctx.fillStyle = '#666666';
  ctx.font = '22px Arial, sans-serif';
  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(`Issued: ${date}`, width / 2, 1450);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

export async function shareCertificate(canvas, dayData) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `wordspark-day-${dayData.day}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `WordSpark Day ${dayData.day} Certificate`,
            text: `I completed Day ${dayData.day} and learned 10 new words! 🎉`,
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
      a.download = `wordspark-day-${dayData.day}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve({ method: 'download', success: true });
    }, 'image/png');
  });
}
