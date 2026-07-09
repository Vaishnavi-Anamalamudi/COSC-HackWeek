import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase.js';

export async function uploadCapsuleFile(userId, capsuleId, file, onProgress) {
  if (!storage || !userId) return readLocalFile(file);
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const fileRef = ref(storage, `capsules/${userId}/${capsuleId}/${safeName}`);
  const task = uploadBytesResumable(fileRef, file, {
    contentType: file.type,
    customMetadata: { originalName: file.name },
  });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          url,
          path: task.snapshot.ref.fullPath,
        });
      },
    );
  });
}

export function readLocalFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        url: reader.result,
        local: true,
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
