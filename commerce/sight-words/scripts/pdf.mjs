/**
 * Tiny PDF 1.4 writer — Helvetica, US Letter. No dependencies.
 */
const PAGE_W = 612;
const PAGE_H = 792;

function escapePdf(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function fontOp(size) {
  return `/F1 ${size} Tf`;
}

export class Page {
  constructor() {
    this.ops = [];
  }

  fill(r, g, b) {
    this.ops.push(`${r} ${g} ${b} rg`);
  }

  stroke(r, g, b) {
    this.ops.push(`${r} ${g} ${b} RG`);
  }

  gray(v) {
    this.ops.push(`${v} g`);
  }

  rect(x, y, w, h, style = 's') {
    this.ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${style}`);
  }

  line(x1, y1, x2, y2, width = 0.8) {
    this.ops.push(`${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  text(str, x, y, size, opts = {}) {
    const gray = opts.gray;
    const color = opts.rgb;
    const parts = [];
    if (gray != null) parts.push(`${gray} g`);
    if (color) parts.push(`${color[0]} ${color[1]} ${color[2]} rg`);
    parts.push('BT', fontOp(size), `${x.toFixed(2)} ${y.toFixed(2)} Td`, `(${escapePdf(str)}) Tj`, 'ET');
    if (gray != null || color) parts.push('0 g');
    this.ops.push(parts.join(' '));
  }

  content() {
    return this.ops.join('\n');
  }
}

export function buildPdf(pages) {
  const body = [];
  const offsets = [0];
  const write = (chunk) => {
    const buf = Buffer.from(chunk);
    body.push(buf);
    return buf.length;
  };

  let cursor = 0;
  const add = (chunk) => {
    cursor += write(chunk);
  };

  add('%PDF-1.4\n');

  const objStarts = [];
  const objects = [];

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  const kids = pages.map((_, i) => `${4 + i * 2} 0 R`).join(' ');
  objects.push(`<< /Type /Pages /Kids [ ${kids} ] /Count ${pages.length} >>`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  for (const page of pages) {
    const stream = page.content();
    const pageIndex = 4 + objects.length - 3; // assigned later; store placeholders
    objects.push({ type: 'page' });
    objects.push({ type: 'stream', stream });
  }

  // Rebuild page objects with correct content refs: objects 1=cat 2=pages 3=font
  // then pairs (page, contents) starting at 4
  const rebuilt = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [ ${pages.map((_, i) => `${4 + i * 2} 0 R`).join(' ')} ] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  pages.forEach((page, i) => {
    const pageNum = 4 + i * 2;
    const contentNum = pageNum + 1;
    rebuilt.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentNum} 0 R >>`,
    );
    const stream = page.content();
    rebuilt.push({ stream });
  });

  rebuilt.forEach((obj, idx) => {
    objStarts[idx] = cursor;
    const n = idx + 1;
    if (typeof obj === 'string') {
      add(`${n} 0 obj\n${obj}\nendobj\n`);
    } else {
      const bytes = Buffer.from(obj.stream, 'utf8');
      add(`${n} 0 obj\n<< /Length ${bytes.length} >>\nstream\n`);
      cursor += write(bytes);
      add('\nendstream\nendobj\n');
    }
  });

  const xrefAt = cursor;
  let xref = `xref\n0 ${rebuilt.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (let i = 0; i < rebuilt.length; i += 1) {
    xref += `${String(objStarts[i]).padStart(10, '0')} 00000 n \n`;
  }
  add(xref);
  add(`trailer\n<< /Size ${rebuilt.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`);

  return Buffer.concat(body);
}

export const LETTER = { w: PAGE_W, h: PAGE_H };
