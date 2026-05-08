'use client';

import { useEffect, useState } from 'react';
import SpeechDialog from '../design/components/SpeechDialog.jsx';

const STORAGE_KEY = 'acnh-resetti-counter';
const WINDOW_MS = 30_000;
const TRIGGER_THRESHOLD = 5;

export default function ResettiTrap() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timestamps = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      timestamps = raw ? JSON.parse(raw) : [];
    } catch {
      timestamps = [];
    }

    const now = Date.now();
    timestamps = timestamps.filter((t) => now - t < WINDOW_MS);
    timestamps.push(now);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
    } catch {
      /* ignore */
    }

    if (timestamps.length >= TRIGGER_THRESHOLD) {
      setShow(true);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (!show) return null;

  return (
    <SpeechDialog
      open
      onClose={() => setShow(false)}
      character="isabelle"
      message="What are ya doin'?? You can't just keep restartin'! Stop refreshin' and play the game already, will ya?!"
      confirmLabel="Sorry!"
      onConfirm={() => setShow(false)}
    />
  );
}
