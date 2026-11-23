import { supabase } from '../lib/supabase';
import { demoDb } from './demoDb';

const fail = (error) => { throw new Error(error.message || 'Something went wrong'); };

/** Returns 'subscribed' or 'exists'. */
export async function subscribeNewsletter(email) {
  const clean = email.trim().toLowerCase();
  if (!supabase) {
    const list = demoDb.read('newsletter', []);
    if (list.includes(clean)) return 'exists';
    demoDb.write('newsletter', [...list, clean]);
    return 'subscribed';
  }
  const { error } = await supabase.from('newsletter_subscribers').insert({ email: clean });
  if (error?.code === '23505') return 'exists';
  if (error) fail(error);
  return 'subscribed';
}

export async function sendContactMessage({ name, email, message }) {
  if (!supabase) return demoDb.write('contact', [{ name, email, message, at: new Date().toISOString() }, ...demoDb.read('contact', [])]);
  const { error } = await supabase.from('contact_messages').insert({ name, email, message });
  if (error) fail(error);
}

/* Wishlist sync (Supabase + signed-in users only) */
export async function fetchRemoteWishlist(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', userId);
  if (error) fail(error);
  return data.map((r) => r.product_id);
}
export async function addRemoteWishlist(userId, productId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from('wishlists').upsert({ user_id: userId, product_id: productId });
  if (error) fail(error);
}
export async function removeRemoteWishlist(userId, productId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
  if (error) fail(error);
}
