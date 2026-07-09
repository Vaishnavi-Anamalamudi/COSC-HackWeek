import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  addCapsule,
  firebaseReady,
  removeCapsule,
  subscribeToUserCapsules,
  updateCapsule,
} from '../services/firebase.js';
import { decryptPayload, encryptPayload } from '../utils/encryption.js';
import { getCapsuleStatus, toDate } from '../utils/helpers.js';

const localKey = 'chronovault_capsules';

const demoCapsules = [
  {
    id: 'demo-1',
    title: 'Letter to New Year Me',
    message: 'Open this when the year turns. Remember the small rituals, the hard-won courage, and the people who made ordinary days feel bright.',
    category: 'letter',
    privacy: 'private',
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 32).toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    files: [],
    mood: 'Hopeful',
    location: 'Home',
    favorite: true,
    archived: false,
    createdAt: new Date().toISOString(),
    theme: 'emerald',
  },
  {
    id: 'demo-2',
    title: 'Graduation Week Capsule',
    message: 'A small museum of the week everything changed.',
    category: 'milestone',
    privacy: 'public',
    unlockAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    files: [],
    mood: 'Grateful',
    location: 'Campus',
    favorite: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    theme: 'sky',
    reactions: { heart: 8, sparkle: 4 },
  },
];

function readLocalCapsules() {
  const raw = localStorage.getItem(localKey);
  if (!raw) {
    localStorage.setItem(localKey, JSON.stringify(demoCapsules));
    return demoCapsules;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return demoCapsules;
  }
}

function writeLocalCapsules(capsules) {
  localStorage.setItem(localKey, JSON.stringify(capsules));
}

function normalizeSnapshot(docSnapshot) {
  const data = docSnapshot.data();
  const decrypted = decryptPayload(data.encryptedPayload) || {};
  return {
    id: docSnapshot.id,
    ...decrypted,
    ownerId: data.ownerId,
    title: decrypted.title || data.title,
    category: data.category,
    privacy: data.privacy,
    unlockAt: data.unlockAt,
    favorite: Boolean(data.favorite),
    archived: Boolean(data.archived),
    createdAt: data.createdAt?.toDate?.().toISOString?.() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString?.() || data.updatedAt || new Date().toISOString(),
  };
}

function packForFirestore(capsule, ownerId) {
  const encryptedPayload = encryptPayload(capsule);
  return {
    ownerId,
    encryptedPayload,
    title: capsule.title,
    category: capsule.category,
    privacy: capsule.privacy,
    unlockAt: toDate(capsule.unlockAt).toISOString(),
    favorite: Boolean(capsule.favorite),
    archived: Boolean(capsule.archived),
  };
}

export function useCapsules(user, guest) {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = user?.uid;
  const cloudEnabled = firebaseReady && userId && !guest;

  useEffect(() => {
    setError('');
    if (!cloudEnabled) {
      setCapsules(readLocalCapsules());
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    return subscribeToUserCapsules(
      userId,
      (snapshot) => {
        setCapsules(snapshot.docs.map(normalizeSnapshot));
        setLoading(false);
      },
      (firestoreError) => {
        setError(firestoreError.message);
        setLoading(false);
      },
    );
  }, [cloudEnabled, userId]);

  const persistLocal = useCallback(
    (updater) => {
      setCapsules((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater;
        writeLocalCapsules(next);
        return next;
      });
    },
    [setCapsules],
  );

  const saveCapsule = useCallback(
    async (capsule) => {
      const now = new Date().toISOString();
      const nextCapsule = {
        ...capsule,
        id: capsule.id || uuid(),
        createdAt: capsule.createdAt || now,
        updatedAt: now,
        archived: Boolean(capsule.archived),
        favorite: Boolean(capsule.favorite),
      };

      if (cloudEnabled) {
        const packed = packForFirestore(nextCapsule, userId);
        if (capsule.id) await updateCapsule(capsule.id, packed);
        else await addCapsule(packed);
      } else {
        persistLocal((current) => {
          const exists = current.some((item) => item.id === nextCapsule.id);
          return exists
            ? current.map((item) => (item.id === nextCapsule.id ? nextCapsule : item))
            : [nextCapsule, ...current];
        });
      }
      return nextCapsule;
    },
    [cloudEnabled, persistLocal, userId],
  );

  const deleteCapsule = useCallback(
    async (id) => {
      if (cloudEnabled) await removeCapsule(id);
      else persistLocal((current) => current.filter((capsule) => capsule.id !== id));
    },
    [cloudEnabled, persistLocal],
  );

  const updateFlag = useCallback(
    async (id, patch) => {
      const target = capsules.find((capsule) => capsule.id === id);
      if (!target) return;
      await saveCapsule({ ...target, ...patch });
    },
    [capsules, saveCapsule],
  );

  const duplicateCapsule = useCallback(
    async (id) => {
      const target = capsules.find((capsule) => capsule.id === id);
      if (!target) return;
      const copy = {
        ...target,
        id: undefined,
        title: `${target.title} Copy`,
        unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        favorite: false,
        archived: false,
      };
      await saveCapsule(copy);
    },
    [capsules, saveCapsule],
  );

  const value = useMemo(
    () => ({
      capsules: capsules
        .map((capsule) => ({ ...capsule, status: getCapsuleStatus(capsule) }))
        .sort((a, b) => toDate(a.unlockAt).getTime() - toDate(b.unlockAt).getTime()),
      loading,
      error,
      saveCapsule,
      deleteCapsule,
      duplicateCapsule,
      archiveCapsule: (id) => updateFlag(id, { archived: true }),
      toggleFavorite: (id) => {
        const capsule = capsules.find((item) => item.id === id);
        return updateFlag(id, { favorite: !capsule?.favorite });
      },
    }),
    [capsules, deleteCapsule, duplicateCapsule, error, loading, saveCapsule, updateFlag],
  );

  return value;
}
