import CryptoJS from 'crypto-js';

const secret = import.meta.env.VITE_ENCRYPTION_SECRET || 'chronovault-local-demo-secret';

export function encryptPayload(payload) {
  return CryptoJS.AES.encrypt(JSON.stringify(payload), secret).toString();
}

export function decryptPayload(ciphertext) {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    const value = bytes.toString(CryptoJS.enc.Utf8);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function hashPassword(password = '') {
  return CryptoJS.SHA256(`${password}:${secret}`).toString();
}

export function verifyPassword(password, hash) {
  return Boolean(password && hash && hashPassword(password) === hash);
}
