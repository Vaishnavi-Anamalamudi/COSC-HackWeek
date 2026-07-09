export const colorMatrices = {
  normal: [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ],
  protanopia: [
    0.567, 0.433, 0,
    0.558, 0.442, 0,
    0, 0.242, 0.758,
  ],
  deuteranopia: [
    0.625, 0.375, 0,
    0.7, 0.3, 0,
    0, 0.3, 0.7,
  ],
  tritanopia: [
    0.95, 0.05, 0,
    0, 0.433, 0.567,
    0, 0.475, 0.525,
  ],
  achromatopsia: [
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
  ],
};

export const clampChannel = (value) => Math.max(0, Math.min(255, value));
