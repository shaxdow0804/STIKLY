// Tiny localStorage "database" used when Supabase credentials are not configured.
const PREFIX = 'stikly:';

export const demoDb = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      throw new Error('Browser storage is full. Remove some data or use a smaller image.');
    }
  },
};

export const uid = () =>
  (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
