import { colorMatrices, clampChannel } from './colorMatrices';

const MAX_PROCESSING_SIZE = 2600;

export const createEmptyHistogram = () => ({
  r: Array(256).fill(0),
  g: Array(256).fill(0),
  b: Array(256).fill(0),
});

export const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        resolve({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          size: file.size,
          type: file.type,
          width: image.naturalWidth,
          height: image.naturalHeight,
          src: reader.result,
          createdAt: new Date().toISOString(),
        });
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const getCanvas = (width, height) => {
  if ('OffscreenCanvas' in window) {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const toDataUrl = async (canvas, type = 'image/png', quality = 0.95) => {
  if ('convertToBlob' in canvas) {
    const blob = await canvas.convertToBlob({ type, quality });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  return canvas.toDataURL(type, quality);
};

export const processImage = async ({
  src,
  mode = 'normal',
  intensity = 100,
  mimeType = 'image/png',
  quality = 0.95,
}) => {
  const image = await loadImage(src);
  const ratio = Math.min(1, MAX_PROCESSING_SIZE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * ratio);
  const height = Math.round(image.naturalHeight * ratio);
  const canvas = getCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const matrix = colorMatrices[mode] || colorMatrices.normal;
  const amount = Math.max(0, Math.min(1, intensity / 100));
  const before = createEmptyHistogram();
  const after = createEmptyHistogram();

  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];

    before.r[r] += 1;
    before.g[g] += 1;
    before.b[b] += 1;

    const sr = clampChannel(r * matrix[0] + g * matrix[1] + b * matrix[2]);
    const sg = clampChannel(r * matrix[3] + g * matrix[4] + b * matrix[5]);
    const sb = clampChannel(r * matrix[6] + g * matrix[7] + b * matrix[8]);

    const nr = Math.round(r + (sr - r) * amount);
    const ng = Math.round(g + (sg - g) * amount);
    const nb = Math.round(b + (sb - b) * amount);

    pixels[index] = nr;
    pixels[index + 1] = ng;
    pixels[index + 2] = nb;

    after.r[nr] += 1;
    after.g[ng] += 1;
    after.b[nb] += 1;
  }

  context.putImageData(imageData, 0, 0);

  return {
    src: await toDataUrl(canvas, mimeType, quality),
    histograms: { before, after },
    width,
    height,
  };
};
