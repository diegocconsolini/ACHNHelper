'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const SYNC_KEYS = [
  'fish-tracker', 'bug-tracker', 'sea-creature-tracker', 'flower-calculator',
  'garden-planner', 'island-flower-map', 'turnip-tracker', 'bell-calculator',
  'nooks-cranny-log', 'museum-tracker', 'golden-tool-tracker', 'nook-miles-tracker',
  'five-star-checker', 'daily-routine', 'villager-gift-guide', 'gulliver-tracker',
  'art-detector', 'kk-catalogue', 'seasonal-event-calendar', 'acnh-diy-tracker',
  'celeste-meteor-tracker', 'dream-address-book', 'acnh-modal-theme',
  'hotel-tracker'
];
const DEBOUNCE_MS = 5000;

export default function SyncManager({ children }) {
  const { data: session, status } = useSession();
  const originalSet = useRef(null);
  const syncQueue = useRef(new Map());

  const runInitialSync = useCallback(async () => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const flagKey = `sync-initialized-${userId}`;

    // Skip if already initialized on this device
    if (localStorage.getItem(flagKey)) {
      return;
    }

    window.__syncStatus = 'syncing';

    for (const key of SYNC_KEYS) {
      try {
        const res = await fetch(`/api/sync/${key}`);
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
          }
        }
        // 404 = no cloud data for this key, skip
      } catch (e) {
        console.error(`Sync download failed for ${key}:`, e);
      }
    }

    localStorage.setItem(flagKey, Date.now().toString());
    window.__syncStatus = 'synced';
  }, [session]);

  const patchStorage = useCallback(() => {
    if (originalSet.current) return; // already patched

    originalSet.current = window.storage.set.bind(window.storage);

    window.storage.set = async (key, value) => {
      // Always write locally first (original behavior)
      await originalSet.current(key, value);

      // Queue cloud sync if this is a known artifact key
      if (SYNC_KEYS.includes(key)) {
        // Clear existing debounce for this key
        if (syncQueue.current.has(key)) {
          clearTimeout(syncQueue.current.get(key));
        }

        // Debounce: sync after 5 seconds of no changes
        const timeoutId = setTimeout(async () => {
          syncQueue.current.delete(key);
          try {
            window.__syncStatus = 'syncing';
            await fetch(`/api/sync/${key}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                data: value,
                updatedAt: new Date().toISOString(),
              }),
            });
            window.__syncStatus = 'synced';
          } catch (e) {
            console.error(`Sync upload failed for ${key}:`, e);
            window.__syncStatus = 'error';
          }
        }, DEBOUNCE_MS);

        syncQueue.current.set(key, timeoutId);
      }
    };
  }, []);

  const unpatchStorage = useCallback(() => {
    if (originalSet.current) {
      window.storage.set = originalSet.current;
      originalSet.current = null;
    }
    // Clear all pending syncs
    for (const timeoutId of syncQueue.current.values()) {
      clearTimeout(timeoutId);
    }
    syncQueue.current.clear();
    window.__syncStatus = null;
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      runInitialSync().then(() => {
        patchStorage();
      });
    } else if (status === 'unauthenticated') {
      unpatchStorage();
    }

    return () => unpatchStorage();
  }, [status, session?.user?.id, runInitialSync, patchStorage, unpatchStorage]);

  return children;
}
