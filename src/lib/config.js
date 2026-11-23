export const BRAND = { name: 'STIKLY', tagline: 'Stick Your Personality' };

// Edit these to match your real policies.
export const SHIPPING = { flat: 49, freeAbove: 499 };
export const MAX_QTY = 20;

const env = import.meta.env;
export const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const RAZORPAY_KEY_ID = env.VITE_RAZORPAY_KEY_ID || '';
export const DEMO_ADMIN = env.VITE_DEMO_ADMIN === 'true' && !isSupabaseConfigured;

// Custom sticker types. Keep prices in sync with the sticker_types seed in supabase/schema.sql.
export const STICKER_TYPES = [
  { id: 'vinyl', name: 'Die-cut vinyl', base: 25, note: 'Glossy, waterproof, cut to your shape' },
  { id: 'holo', name: 'Holographic', base: 35, note: 'Rainbow foil finish that catches the light' },
  { id: 'matte', name: 'Matte vinyl', base: 28, note: 'Soft, fingerprint-resistant finish' },
  { id: 'clear', name: 'Transparent', base: 30, note: 'Clear base for a printed-on-glass look' },
];
export const CUSTOM_MIN_QTY = 5;
export const CUSTOM_MAX_QTY = 500;
