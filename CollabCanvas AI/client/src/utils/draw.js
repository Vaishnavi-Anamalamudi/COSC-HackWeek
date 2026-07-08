export function screenToWorld(point, viewport) {
  return {
    x: (point.x - viewport.x) / viewport.zoom,
    y: (point.y - viewport.y) / viewport.zoom
  };
}

export function worldToScreen(point, viewport) {
  return {
    x: point.x * viewport.zoom + viewport.x,
    y: point.y * viewport.zoom + viewport.y
  };
}

export function drawElement(ctx, element, viewport, imageCache = {}) {
  if (!element || element.deleted) return;

  ctx.save();
  ctx.translate(viewport.x, viewport.y);
  ctx.scale(viewport.zoom, viewport.zoom);
  ctx.globalAlpha = element.opacity ?? 1;
  ctx.strokeStyle = element.color || '#111827';
  ctx.fillStyle = element.fill || element.color || '#111827';
  ctx.lineWidth = element.size || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (element.type === 'pencil' || element.type === 'brush' || element.type === 'highlighter' || element.type === 'eraser' || element.type === 'laser') {
    drawPath(ctx, element);
  } else if (element.type === 'rectangle') {
    ctx.strokeRect(element.x, element.y, element.w, element.h);
  } else if (element.type === 'circle') {
    const radius = Math.max(Math.abs(element.w), Math.abs(element.h)) / 2;
    ctx.beginPath();
    ctx.arc(element.x + element.w / 2, element.y + element.h / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (element.type === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse(element.x + element.w / 2, element.y + element.h / 2, Math.abs(element.w / 2), Math.abs(element.h / 2), 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (element.type === 'line' || element.type === 'arrow') {
    drawLine(ctx, element);
    if (element.type === 'arrow') drawArrowHead(ctx, element);
  } else if (element.type === 'text') {
    ctx.globalAlpha = element.opacity ?? 1;
    ctx.fillStyle = element.color || '#111827';
    ctx.font = `${Math.max(16, element.size * 4)}px Inter, sans-serif`;
    wrapText(ctx, element.text || '', element.x, element.y, 340, Math.max(20, element.size * 5));
  } else if (element.type === 'sticky') {
    drawSticky(ctx, element);
  } else if (element.type === 'image') {
    const image = imageCache[element.id];
    if (image) ctx.drawImage(image, element.x, element.y, element.w, element.h);
  }

  ctx.restore();
}

function drawPath(ctx, element) {
  const points = element.points || [];
  if (points.length < 1) return;

  if (element.type === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
  } else if (element.type === 'highlighter') {
    ctx.globalAlpha = element.opacity ?? 0.35;
    ctx.lineWidth = (element.size || 12) * 2;
  } else if (element.type === 'laser') {
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + current.x) / 2, (previous.y + current.y) / 2);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
}

function drawLine(ctx, element) {
  ctx.beginPath();
  ctx.moveTo(element.x, element.y);
  ctx.lineTo(element.x + element.w, element.y + element.h);
  ctx.stroke();
}

function drawArrowHead(ctx, element) {
  const endX = element.x + element.w;
  const endY = element.y + element.h;
  const angle = Math.atan2(element.h, element.w);
  const length = 18;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - length * Math.cos(angle - Math.PI / 6), endY - length * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - length * Math.cos(angle + Math.PI / 6), endY - length * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function drawSticky(ctx, element) {
  ctx.fillStyle = element.fill || '#fef08a';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.22)';
  roundRect(ctx, element.x, element.y, element.w || 220, element.h || 160, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = element.color || '#111827';
  ctx.font = '18px Inter, sans-serif';
  wrapText(ctx, element.text || 'Sticky note', element.x + 18, element.y + 34, (element.w || 220) - 36, 24);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = '';
  let offset = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + offset);
      line = word;
      offset += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y + offset);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
