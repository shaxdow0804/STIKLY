import { supabase } from '../lib/supabase';
import { seedCategories, seedProducts } from '../data/seed';
import { demoDb, uid } from './demoDb';
import { slugify, downscaleImage } from '../lib/format';

const fail = (error) => { throw new Error(error.message || 'Something went wrong'); };

/* ───── mappers ───── */
const mapCategory = (r) => ({ id: r.id, slug: r.slug, name: r.name, image: r.image_url, blurb: r.blurb || '', sort: r.sort_order });
const mapProduct = (r) => ({
  id: r.id, slug: r.slug, name: r.name, categoryId: r.category_id, category: r.categories?.slug || null,
  categoryName: r.categories?.name || '', price: Number(r.price), compareAt: r.compare_at_price != null ? Number(r.compare_at_price) : null,
  description: r.description || '', image: r.image_url, stock: r.stock, isActive: r.is_active, isBestseller: r.is_bestseller,
  isNew: r.is_new, rating: Number(r.rating), reviewCount: r.review_count, sold: r.sold, finish: r.finish, size: r.size,
  tags: r.tags || [], createdAt: r.created_at,
});
const toRow = (p) => ({
  slug: p.slug || slugify(p.name), name: p.name, category_id: p.categoryId || null, price: Number(p.price),
  compare_at_price: p.compareAt ? Number(p.compareAt) : null, description: p.description, image_url: p.image,
  stock: Number(p.stock), is_active: p.isActive, is_bestseller: p.isBestseller, is_new: p.isNew,
  finish: p.finish || null, size: p.size || null, tags: p.tags || [],
});

/* ───── demo helpers ───── */
const demoCategories = () => demoDb.read('categories', seedCategories);
const demoProducts = () => {
  const cats = demoCategories();
  return demoDb.read('products', seedProducts).map((p) => {
    const c = cats.find((x) => x.id === p.categoryId);
    return { ...p, category: c?.slug || null, categoryName: c?.name || '' };
  });
};

/* ───── categories ───── */
export async function listCategories() {
  if (!supabase) return [...demoCategories()].sort((a, b) => a.sort - b.sort);
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) fail(error);
  return data.map(mapCategory);
}

export async function saveCategory(cat) {
  if (!supabase) {
    const all = demoCategories();
    const slug = slugify(cat.name);
    const next = cat.id
      ? all.map((c) => (c.id === cat.id ? { ...c, ...cat, slug } : c))
      : [...all, { ...cat, id: slug, slug, sort: all.length + 1 }];
    demoDb.write('categories', next);
    return;
  }
  const row = { name: cat.name, slug: slugify(cat.name), image_url: cat.image || null, blurb: cat.blurb || null };
  const { error } = cat.id ? await supabase.from('categories').update(row).eq('id', cat.id) : await supabase.from('categories').insert(row);
  if (error) fail(error);
}

export async function deleteCategory(id) {
  if (!supabase) return demoDb.write('categories', demoCategories().filter((c) => c.id !== id));
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) fail(error);
}

/* ───── products ───── */
export async function listProducts() {
  if (!supabase) return demoProducts().filter((p) => p.isActive);
  const { data, error } = await supabase.from('products').select('*, categories(slug,name)').eq('is_active', true).order('created_at', { ascending: false });
  if (error) fail(error);
  return data.map(mapProduct);
}

/** Admin: includes inactive products. */
export async function listAllProducts() {
  if (!supabase) return demoProducts();
  const { data, error } = await supabase.from('products').select('*, categories(slug,name)').order('created_at', { ascending: false });
  if (error) fail(error);
  return data.map(mapProduct);
}

export async function getProductBySlug(slug) {
  const all = await listProducts();
  return all.find((p) => p.slug === slug) || null;
}

export async function saveProduct(product) {
  if (!supabase) {
    const all = demoDb.read('products', seedProducts);
    const clean = { ...product };
    delete clean.category; delete clean.categoryName;
    if (clean.id) {
      demoDb.write('products', all.map((p) => (p.id === clean.id ? { ...p, ...clean } : p)));
    } else {
      demoDb.write('products', [{ rating: 0, reviewCount: 0, sold: 0, ...clean, id: uid(), slug: clean.slug || slugify(clean.name), createdAt: new Date().toISOString() }, ...all]);
    }
    return;
  }
  const row = toRow(product);
  const { error } = product.id ? await supabase.from('products').update(row).eq('id', product.id) : await supabase.from('products').insert(row);
  if (error) fail(error);
}

export async function deleteProduct(id) {
  if (!supabase) return demoDb.write('products', demoDb.read('products', seedProducts).filter((p) => p.id !== id));
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) fail(error);
}

/** Uploads an admin-selected image and returns a URL to store on the product. */
export async function uploadProductImage(file) {
  if (!supabase) return downscaleImage(file, 900, 0.85);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${uid()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type });
  if (error) fail(error);
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}
