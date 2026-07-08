export function normalizeUrl(value) {
  if (!value) return '';
  if (/^(mailto:|tel:|https?:\/\/)/i.test(value)) return value;
  return `https://${value}`;
}

export function getQrTarget(card) {
  return normalizeUrl(card.website || card.portfolio || card.email || '');
}

export function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
