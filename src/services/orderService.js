import { supabase } from '../lib/supabase';
import { demoDb, uid } from './demoDb';
import { customUnitPrice, shippingFor } from '../lib/pricing';
import { dataUrlToBlob } from '../lib/format';
import { STICKER_TYPES } from '../lib/config';

const fail = (error) => { throw new Error(error.message || 'Something went wrong'); };

const mapOrder = (r) => ({
  id: r.id, orderNumber: r.order_number, customerName: r.customer_name, email: r.email, phone: r.phone, address: r.address,
  city: r.city, state: r.state, pincode: r.pincode, paymentMethod: r.payment_method, paymentStatus: r.payment_status,
  status: r.status, subtotal: Number(r.subtotal), shipping: Number(r.shipping), total: Number(r.total), createdAt: r.created_at,
  items: (r.order_items || []).map((i) => ({ name: i.name, image: i.image_url, unitPrice: Number(i.unit_price), quantity: i.quantity, custom: i.custom })),
});

/**
 * Places an order.
 * Supabase mode: calls the place_order RPC, which recomputes all prices server-side.
 * Demo mode: stores the order in localStorage. No payment is taken.
 */
export async function placeOrder({ customer, lines, paymentMethod, paymentRef }) {
  if (supabase) {
    const items = [];
    for (const l of lines) {
      if (l.custom) {
        let imagePath = null;
        if (l.custom.imageData) {
          imagePath = `${uid()}.jpg`;
          const { error } = await supabase.storage.from('custom-uploads').upload(imagePath, dataUrlToBlob(l.custom.imageData), { contentType: 'image/jpeg' });
          if (error) fail(error);
        }
        items.push({ quantity: l.qty, custom: { type: l.custom.type, text: l.custom.text || '', image_path: imagePath } });
      } else {
        items.push({ product_id: l.productId, quantity: l.qty });
      }
    }
    const { data, error } = await supabase.rpc('place_order', { p_customer: customer, p_items: items, p_payment_method: paymentMethod, p_payment_ref: paymentRef || null });
    if (error) fail(error);
    return { orderNumber: data.order_number, total: Number(data.total), demo: false };
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const order = {
    id: uid(),
    order_number: `STK-${String(new Date().getFullYear()).slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${uid().slice(0, 6).toUpperCase()}`,
    customer_name: customer.name, email: customer.email.toLowerCase(), phone: customer.phone, address: customer.address,
    city: customer.city, state: customer.state, pincode: customer.pincode,
    payment_method: paymentMethod, payment_status: 'demo (no payment taken)', status: 'pending',
    subtotal, shipping, total: subtotal + shipping, created_at: new Date().toISOString(),
    order_items: lines.map((l) => ({ product_id: l.productId || null, name: l.name, image_url: l.image, unit_price: l.price, quantity: l.qty, custom: l.custom || null })),
  };
  demoDb.write('orders', [order, ...demoDb.read('orders', [])]);
  return { orderNumber: order.order_number, total: order.total, demo: true };
}

export async function trackOrder(number, email) {
  if (supabase) {
    const { data, error } = await supabase.rpc('track_order', { p_number: number, p_email: email });
    if (error) fail(error);
    return data || null;
  }
  const o = demoDb.read('orders', []).find((x) => x.order_number === number.trim().toUpperCase() && x.email === email.trim().toLowerCase());
  return o ? { order_number: o.order_number, status: o.status, payment_status: o.payment_status, total: o.total, created_at: o.created_at, items: o.order_items.map((i) => ({ name: i.name, quantity: i.quantity })) } : null;
}

export async function listMyOrders() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (error) fail(error);
  return data.map(mapOrder);
}

/** Admin */
export async function listOrders() {
  if (!supabase) return demoDb.read('orders', []).map(mapOrder);
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (error) fail(error);
  return data.map(mapOrder);
}

export async function updateOrderStatus(id, status) {
  if (!supabase) return demoDb.write('orders', demoDb.read('orders', []).map((o) => (o.id === id ? { ...o, status } : o)));
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) fail(error);
}

/** Admin: custom sticker requests */
export async function listCustomRequests() {
  if (!supabase) {
    return demoDb.read('orders', []).flatMap((o) =>
      o.order_items.filter((i) => i.custom).map((i, idx) => ({
        id: `${o.id}-${idx}`, orderNumber: o.order_number, customer: o.customer_name, email: o.email,
        type: STICKER_TYPES.find((t) => t.id === i.custom.type)?.name || i.custom.type, text: i.custom.text,
        quantity: i.quantity, imageUrl: i.custom.imageData || null, status: 'new', createdAt: o.created_at,
      })));
  }
  const { data, error } = await supabase.from('custom_sticker_requests').select('*, orders(order_number,customer_name,email)').order('created_at', { ascending: false });
  if (error) fail(error);
  return Promise.all(data.map(async (r) => {
    let imageUrl = null;
    if (r.image_path) {
      const { data: signed } = await supabase.storage.from('custom-uploads').createSignedUrl(r.image_path, 3600);
      imageUrl = signed?.signedUrl || null;
    }
    return { id: r.id, orderNumber: r.orders?.order_number, customer: r.orders?.customer_name, email: r.orders?.email,
      type: STICKER_TYPES.find((t) => t.id === r.sticker_type)?.name || r.sticker_type, text: r.text_content, quantity: r.quantity, imageUrl, status: r.status, createdAt: r.created_at };
  }));
}

export async function updateCustomRequestStatus(id, status) {
  if (!supabase) return; // demo requests are derived from orders and have no separate status
  const { error } = await supabase.from('custom_sticker_requests').update({ status }).eq('id', id);
  if (error) fail(error);
}

export { customUnitPrice };
