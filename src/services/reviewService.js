import { supabase } from '../lib/supabase';
import { seedReviews } from '../data/content';
import { demoDb, uid } from './demoDb';

const fail = (error) => { throw new Error(error.message || 'Something went wrong'); };

const mapReview = (r) => ({
  id: r.id, productId: r.product_id, productName: r.products?.name, name: r.name, rating: r.rating, title: r.title,
  body: r.body, verified: r.verified, status: r.status, createdAt: r.created_at, avatar: r.avatar || null,
});
const demoReviews = () => demoDb.read('reviews', seedReviews);

/** Approved reviews, optionally for one product. */
export async function listReviews({ productId } = {}) {
  if (!supabase) return demoReviews().filter((r) => r.status === 'approved' && (!productId || r.productId === productId));
  let q = supabase.from('reviews').select('*').eq('status', 'approved').order('created_at', { ascending: false });
  if (productId) q = q.eq('product_id', productId);
  const { data, error } = await q;
  if (error) fail(error);
  return data.map(mapReview);
}

/** Submitted reviews wait for admin moderation. */
export async function submitReview({ productId, name, rating, title, body }) {
  if (!supabase) {
    // Demo: "verified" only if an order placed in this browser contains the product.
    const verified = Boolean(productId) && demoDb.read('orders', []).some((o) => o.order_items.some((i) => i.product_id === productId));
    demoDb.write('reviews', [{ id: uid(), productId: productId || null, name, rating, title, body, verified, status: 'pending', createdAt: new Date().toISOString() }, ...demoReviews()]);
    return;
  }
  const { error } = await supabase.from('reviews').insert({ product_id: productId || null, name, rating, title: title || null, body });
  if (error) fail(error);
}

/** Admin */
export async function listAllReviews() {
  if (!supabase) return demoReviews();
  const { data, error } = await supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false });
  if (error) fail(error);
  return data.map(mapReview);
}

export async function setReviewStatus(id, status) {
  if (!supabase) return demoDb.write('reviews', demoReviews().map((r) => (r.id === id ? { ...r, status } : r)));
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) fail(error);
}

export async function deleteReview(id) {
  if (!supabase) return demoDb.write('reviews', demoReviews().filter((r) => r.id !== id));
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) fail(error);
}
